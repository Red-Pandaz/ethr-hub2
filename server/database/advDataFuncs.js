// CRUD functions to use on an application scale

const dataService = require("./dataService.js");
const { ObjectId } = require("mongodb");
const { checkEnsName } = require("../utils/apiutils.js");

// Function to check if vote object exists
async function checkExistingVote(voteType, idType, uid, itemId) {
  console.log("Checking existing vote with:", {
    voteType,
    idType,
    uid,
    itemId,
  });
  const results = await dataService.findOneDocumentByIndex(voteType, {
    [idType]: itemId,
    userId: uid.toLowerCase(),
  });
  console.log("Found existing vote:", results);
  return results;
}

// Getting all data for post page. This includes the post itself, post votes, comments and comment votes
async function getDataForPostPage(pid) {
  const results = {};
  results.post = await dataService.findOneDocumentByIndex("Posts", {
    _id: new ObjectId(pid),
  });
  results.votes = await dataService.findDocumentsByIndex("Post Votes", {
    postId: pid,
  });

  results.comments = await dataService.findDocumentsByIndex("Comments", {
    postId: pid,
  });

  results.postVotes = await dataService.findDocumentsByIndex("Post Votes", {
    postId: pid,
  });
  results.commentVotes = await dataService.findDocumentsByIndex(
    "Comment Votes",
    {
      postId: pid,
    }
  );

  return results;
}

// This function is not being used. The full vision of the project included allowing users to subscribe to channels
// This would be used to retrieve data for a user's feed
async function getDataForUserFeed(uid) {
  const user = await dataService.findOneDocumentByIndex("Users", {
    _id: uid,
  });
  const userChannelIds = user.savedChannels;
  console.log(userChannelIds);
  const userFeed = [];
  for (let userChannel of userChannelIds) {
    let postIds = await dataService.findDocumentsByIndex("Posts", {
      channel: userChannel,
    });
    userFeed.push(postIds);
  }

  return userFeed;
}

// There was also going to be a default feed for unauthenticated/new users
async function getDataForDefaultFeed() {
  const posts = await dataService.findDocumentsByIndex("Posts", {
    channel: "channelId1",
  });
  return posts;
}
// Retrieves all posts associated with a channelId
async function getDataForChannelFeed(channelId) {
  const posts = await dataService.findDocumentsByIndex("Posts", {
    channel: channelId,
  });
  const channel = await dataService.findDocumentsByIndex("Channels", {
    _id: new ObjectId(channelId),
  });
  console.log("posts ", posts);
  console.log("channel ", channel);
  return {
    posts: posts,
    channel: channel,
  };
}

// This is a very complicated function that handles the voting logic for both posts and comments
// When a user tries to vote, the function first checks for an existing match.
// Each userId/postId and userId/commentId combinations can only have one vote object
// If none is found a new one is created
// If one is found it is toggled based on its current state and the user action
// The vote has 2 boolean values- hasUpvoted and hasDownvoted. These can both be false, or one of them can be true, but both of them cannot be true.

async function toggleVote(voteId, uid, itemId, voteType, itemType, userAction) {
  // console.log("Toggle Vote Params:", {
  //   voteId,
  //   uid,
  //   itemId,
  //   voteType,
  //   itemType,
  //   userAction,
  // });
  let result;

  if (!voteId) {
    const newVoteObj = {};
    newVoteObj.userId = uid;
    if (voteType === "Comment Votes") {
      newVoteObj.commentId = itemId;
      const comment = await dataService.findOneDocumentByIndex("Comments", {
        _id: itemId,
      });
      newVoteObj.postId = comment.postId;
    } else if (voteType === "Post Votes") {
      newVoteObj.postId = itemId;
    }
    if (userAction === "Upvote") {
      newVoteObj.hasUpvoted = true;
      newVoteObj.hasDownvoted = false;
    } else if (userAction === "Downvote") {
      newVoteObj.hasUpvoted = false;
      newVoteObj.hasDownvoted = true;
    }
    const newVote = await dataService.createDocument(voteType, newVoteObj);
    const newVoteId = newVote.insertedId.toString();
    if (newVoteObj.hasUpvoted) {
      const newUpvote = await dataService.addToDocumentArray(
        itemType,
        itemId,
        "votes.upvotes",
        newVoteId
      );
      if (itemType === "Posts") {
        await dataService.addToDocumentArray(
          "Users",
          uid,
          "votes.posts.upvotes",
          newVoteId
        );
      } else if (itemType === "Comments") {
        await dataService.addToDocumentArray(
          "Users",
          uid,
          "votes.comments.upvotes",
          newVoteId
        );
      }
    } else if (newVoteObj.hasDownvoted) {
      const newDownvote = await dataService.addToDocumentArray(
        itemType,
        itemId,
        "votes.downvotes",
        newVoteId
      );
      if (itemType === "Posts") {
        await dataService.addToDocumentArray(
          "Users",
          uid,
          "votes.posts.downvotes",
          newVoteId
        );
      } else if (itemType === "Comments") {
        await dataService.addToDocumentArray(
          "Users",
          uid,
          "votes.comments.downvotes",
          newVoteId
        );
      }
    }

    result = { success: true, message: "Vote created successfully" };
    return result;
  }

  const vote = await dataService.findOneDocumentByIndex(voteType, {
    _id: new ObjectId(voteId),
  });

  const { hasUpvoted, hasDownvoted } = vote;

  if (!hasDownvoted && !hasUpvoted) {
    if (userAction === "Upvote") {
      await dataService.updateDocumentById(voteType, new ObjectId(voteId), {
        hasUpvoted: true,
      });
      await dataService.addToDocumentArray(
        itemType,
        itemId,
        "votes.upvotes",
        voteId
      );
      if (itemType === "Posts") {
        await dataService.addToDocumentArray(
          "Users",
          uid,
          "votes.posts.upvotes",
          voteId
        );
      } else if (itemType === "Comments") {
        await dataService.addToDocumentArray(
          "Users",
          uid,
          "votes.comments.upvotes",
          voteId
        );
      }
      result = { success: true, message: "Upvoted successfully" };
    } else if (userAction === "Downvote") {
      await dataService.updateDocumentById(voteType, new ObjectId(voteId), {
        hasDownvoted: true,
      });
      await dataService.addToDocumentArray(
        itemType,
        itemId,
        "votes.downvotes",
        voteId
      );
      if (itemType === "Posts") {
        await dataService.addToDocumentArray(
          "Users",
          uid,
          "votes.posts.downvotes",
          voteId
        );
      } else if (itemType === "Comments") {
        await dataService.addToDocumentArray(
          "Users",
          uid,
          "votes.comments.downvotes",
          voteId
        );
      }
      result = { success: true, message: "Downvoted successfully" };
    }
  } else if (hasUpvoted && !hasDownvoted) {
    if (userAction === "Upvote") {
      const voteUpdate = await dataService.updateDocumentById(
        voteType,
        new ObjectId(voteId),
        {
          hasUpvoted: false,
        }
      );
      await dataService.removeFromDocumentArray(
        itemType,
        itemId,
        "votes.upvotes",
        voteId
      );
      if (itemType === "Posts") {
        await dataService.removeFromDocumentArray(
          "Users",
          uid,
          "votes.posts.upvotes",
          voteId
        );
      } else if (itemType === "Comments") {
        await dataService.removeFromDocumentArray(
          "Users",
          uid,
          "votes.comments.upvotes",
          voteId
        );
      }
      result = { success: true, message: "Removed upvote successfully" };
    } else if (userAction === "Downvote") {
      await dataService.updateDocumentById(voteType, new ObjectId(voteId), {
        hasUpvoted: false,
        hasDownvoted: true,
      });
      await dataService.addToDocumentArray(
        itemType,
        itemId,
        "votes.downvotes",
        voteId
      );
      await dataService.removeFromDocumentArray(
        itemType,
        itemId,
        "votes.upvotes",
        voteId
      );
      if (itemType === "Posts") {
        await dataService.addToDocumentArray(
          "Users",
          uid,
          "votes.posts.downvotes",
          voteId
        );
        await dataService.removeFromDocumentArray(
          "Users",
          uid,
          "votes.posts.upvotes",
          voteId
        );
      } else if (itemType === "Comments") {
        await dataService.addToDocumentArray(
          "Users",
          uid,
          "votes.comments.downvotes",
          voteId
        );
        await dataService.removeFromDocumentArray(
          "Users",
          uid,
          "votes.comments.upvotes",
          voteId
        );
      }
      result = { success: true, message: "Downvoted successfully" };
    }
  } else if (!hasUpvoted && hasDownvoted) {
    if (userAction === "Upvote") {
      await dataService.updateDocumentById(voteType, new ObjectId(voteId), {
        hasUpvoted: true,
        hasDownvoted: false,
      });
      await dataService.addToDocumentArray(
        itemType,
        itemId,
        "votes.upvotes",
        voteId
      );
      await dataService.removeFromDocumentArray(
        itemType,
        itemId,
        "votes.downvotes",
        voteId
      );
      if (itemType === "Posts") {
        await dataService.addToDocumentArray(
          "Users",
          uid,
          "votes.posts.upvotes",
          voteId
        );
        await dataService.removeFromDocumentArray(
          "Users",
          uid,
          "votes.posts.downvotes",
          voteId
        );
      } else if (itemType === "Comments") {
        await dataService.addToDocumentArray(
          "Users",
          uid,
          "votes.comments.upvotes",
          voteId
        );
        await dataService.removeFromDocumentArray(
          "Users",
          uid,
          "votes.comments.downvotes",
          voteId
        );
      }
      result = { success: true, message: "Upvoted successfully" };
    } else if (userAction === "Downvote") {
      await dataService.updateDocumentById(voteType, new ObjectId(voteId), {
        hasDownvoted: false,
      });
      await dataService.removeFromDocumentArray(
        itemType,
        itemId,
        "votes.downvotes",
        voteId
      );
      if (itemType === "Posts") {
        await dataService.addToDocumentArray(
          "Users",
          uid,
          "votes.posts.downvotes",
          voteId
        );
      } else if (itemType === "Comments") {
        await dataService.removeFromDocumentArray(
          "Users",
          uid,
          "votes.comments.upvotes",
          voteId
        );
      }
      result = { success: true, message: "Removed downvote successfully" };
    }
  }

  return result;
}

// Function for another unused feature that would have allowed users to save favorite posts
async function toggleSave(uid, itemId, itemType) {
  try {
    const user = await dataService.findOneDocumentByIndex("Users", {
      _id: uid,
    });
    const saveArray = `saved${itemType}`;
    console.log("save array" + saveArray);
    const isSaved = user[saveArray].includes(itemId);
    console.log("is saved: " + isSaved);

    if (isSaved) {
      await dataService.removeFromDocumentArray(
        "Users",
        uid,
        saveArray,
        itemId
      );

      console.log(`${itemType} ${itemId} unsaved for user ${uid}`);
    } else {
      await dataService.addToDocumentArray("Users", uid, saveArray, itemId);
      console.log(`${itemType} ${itemId} saved for user ${uid}`);
    }

    return !isSaved;
  } catch (err) {
    console.error(
      `Error toggling save for ${itemType} ${itemId} and user ${uid}`,
      err
    );
    throw err;
  }
}

// Function for creating a new comment
async function writeComment(commentText, uid, pid, replyToId, ensName) {
  const commentObj = {
    postId: pid,
    userId: uid,
    ensName: ensName,
    text: commentText,
    parentId: replyToId,
    createdAt: new Date(),
    modifiedAt: new Date(),
    votes: {
      upvotes: [uid],
      downvotes: [],
    },
  };
  const newComment = await dataService.createDocument("Comments", commentObj);
  const newCommentId = newComment.insertedId.toString();
  await dataService.addToDocumentArray("Users", uid, "comments", newCommentId);
  await dataService.addToDocumentArray("Posts", pid, "comments", newCommentId);
}

// Function for editing a comment
async function editComment(newCommentText, cid) {
  await dataService.updateDocumentById("Comments", cid, {
    modifiedAt: new Date(),
    text: newCommentText,
  });
}

// Function for deleting a comment
async function deleteComment(cid, uid, pid) {
  await dataService.deleteDocumentById("Comments", cid);
  await dataService.removeFromDocumentArray("Users", uid, "comments", cid);
  await dataService.removeFromDocumentArray("Posts", pid, "comments", cid);
}

// Function for creating a new post
async function writePost(postText, postTitle, ensName, uid, cid) {
  const newPostObj = {
    channel: cid,
    url: null,
    title: postTitle,
    text: postText,
    votes: {
      upvotes: [],
      downvotes: [],
    },
    comments: [],
    createdBy: uid,
    ensName: ensName,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };
  console.log(newPostObj);
  const newPost = await dataService.createDocument("Posts", newPostObj);
  // await dataService.addToDocumentArray('Channels', cid, posts, newPost._id)
  // await dataService.addToDocumentArray('Users', uid, posts, newPost._id)
}

async function editPost(newPostText, pid) {
  await dataService.updateDocumentById("Posts", pid, {
    modifiedAt: new Date(),
    text: newPostText,
  });
}

// Function for deleting a post
async function deletePost(cid, uid, pid) {
  const deletedPost = await dataService.deleteDocumentById("Posts", pid);
  await dataService.addToDocumentArray("Users", uid, "posts", pid);
  await dataService.addToDocumentArray("Channels", cid, "posts", pid);
  return deletedPost;
}

// Function for creating a channel (unused)
async function createChannel(channelName, channelDescription, uid) {
  const channelCheck = await dataService.findOneDocumentByIndex("Channels", {
    name: channelName,
  });
  if (channelCheck) {
    console.log("Channel name already exists");
    return;
  } else {
    const newChannelObj = {
      name: channelName,
      description: channelDescription,
      subscribers: [uid],
      posts: [],
      createdBy: uid,
      createdAt: new Date(),
      lastUpdated: new Date(),
    };
    const newChannel = await dataService.createDocument(
      "Channels",
      newChannelObj
    );
    const newChannelId = newChannel.insertedId.toString();
    await dataService.addToDocumentArray(
      "Users",
      uid,
      "savedChannels",
      newChannelId
    );
    return newChannel;
  }
}

// Function for creating a new user
// This function also checks ENS to see if an address has a name
async function createUser(ethAddress) {
  const userCheck = await dataService.findOneDocumentByIndex("Users", {
    _id: ethAddress,
  });
  if (userCheck) {
    console.log("User already exists");
    return;
  } else {
    const ensName = await checkEnsName(ethAddress);
    const newUserObj = {
      _id: ethAddress,
      savedChannels: ["channelId1"],
      savedPosts: [],
      savedComments: [],
      votes: {
        posts: {
          upvotes: [],
          downvotes: [],
        },
        comments: {
          upvotes: [],
          downvotes: [],
        },
      },
      posts: [],
      comments: [],
      createdAt: new Date(),
      lastLogin: new Date(),
      ensName: ensName,
    };

    const newUser = await dataService.createDocument("Users", newUserObj);
    return ensName;
  }
}

// Function for retrieiving a user document
async function getUserByAddress(ethAddress) {
  try {
    const user = await dataService.findOneDocumentByIndex("Users", {
      _id: ethAddress,
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

// Function for retrieving all channels
async function getChannels() {
  try {
    const channels = await dataService.getCollection("Channels");
    if (!channels) {
      return null;
    }

    return channels;
  } catch (error) {
    console.error("Error fetching channels:", error);
    throw error;
  }
}

// Function for retrieiving all comment votes
async function getCommentVotes() {
  try {
    const commentVotes = await dataService.getCollection("Comment Votes");
    if (!commentVotes) {
      return null;
    }

    return commentVotes;
  } catch (error) {
    console.error("Error fetching Comment Votes:", error);
    throw error;
  }
}

// Function for retrieiving all post votes
async function getPostVotes() {
  try {
    const postVotes = await dataService.getCollection("Post Votes");
    if (!postVotes) {
      return null;
    }

    return postVotes;
  } catch (error) {
    console.error("Error fetching Post Votes:", error);
    throw error;
  }
}

module.exports = {
  getDataForPostPage,
  getDataForUserFeed,
  getDataForDefaultFeed,
  getChannels,
  toggleVote,
  writeComment,
  editComment,
  deleteComment,
  writePost,
  editPost,
  deletePost,
  createChannel,
  createUser,
  toggleSave,
  checkExistingVote,
  getDataForChannelFeed,
  getUserByAddress,
  getCommentVotes,
  getPostVotes,
};
