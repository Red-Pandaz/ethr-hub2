// This file was initially created to handle the logic for ALL buttons
// However, the only buttons defined here that are currently used are the voting buttons
// Any voting action first checks the database to see if there is a match for the given userId/postId or userId/commentId
// If one does not exist, a new one is created with the state of the voting action that prompted its creation
// If the vote object does exist, its state is toggled depending on its current state and the user action
// two boolean values- hasUpvoted and hasDownvoted can both be false, indicating a neutral vote. However if one is true then the other must be false.

import React, { useState } from "react";
import Button from "./Button";
import { useAuth } from "../context/AuthContext";
import apiClient from "../utils/apiClient";

const ButtonDisplay = ({ type, extraParam, onClick }) => {
  const { userAddress } = useAuth();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formContent, setFormContent] = useState("");
  const handleClick = async () => {
    const authToken = localStorage.getItem("authToken");
    try {
      if (!userAddress) {
        console.error("User is not logged in.");
        return;
      }
      let response;
      switch (type) {
        case "upvotePost":
          {
            const { itemId } = extraParam;
            const voteType = "Post Votes";
            const idType = "postId";

            if (!userAddress || !itemId) {
              console.error("Missing required parameters:", {
                userAddress,
                itemId,
              });
              return;
            }

            try {
              const doesVoteExist = await apiClient.get(
                `http://localhost:5000/api/checkExistingVote`,
                {
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                  },
                  params: {
                    voteType,
                    idType,
                    uid: userAddress.toLowerCase(),
                    itemId,
                  },
                }
              );
              const existingVote = doesVoteExist.data;

              let vid = existingVote ? existingVote._id : null;

              response = await apiClient.post(
                "http://localhost:5000/api/toggleVote",
                {
                  voteId: vid,
                  userId: userAddress.toLowerCase(),
                  itemId,
                  voteType,
                  itemType: "Posts",
                  userAction: "Upvote",
                },
                {
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                  },
                }
              );
            } catch (error) {
              console.error("Error toggling vote:", error.message);
            }
          }
          window.location.reload();
          break;

        case "downvotePost":
          {
            const { itemId } = extraParam;
            const voteType = "Post Votes";
            const idType = "postId";

            if (!userAddress || !itemId) {
              console.error("Missing required parameters:", {
                userAddress,
                itemId,
              });
              return;
            }

            try {
              const doesVoteExist = await apiClient.get(
                `http://localhost:5000/api/checkExistingVote`,
                {
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                  },
                  params: {
                    voteType,
                    idType,
                    uid: userAddress.toLowerCase(),
                    itemId,
                  },
                }
              );
              const existingVote = doesVoteExist.data;

              let vid = existingVote ? existingVote._id : null;
              response = await apiClient.post(
                "http://localhost:5000/api/toggleVote",
                {
                  voteId: vid,
                  userId: userAddress.toLowerCase(),
                  itemId,
                  voteType,
                  itemType: "Posts",
                  userAction: "Downvote",
                },
                {
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                  },
                }
              );
            } catch (error) {
              console.error("Error toggling vote:", error.message);
            }
          }
          window.location.reload();
          break;
        case "upvoteComment":
          {
            const doesVoteExist = await apiClient.get(
              `http://localhost:5000/api/checkExistingVote?voteType=Comment%20Votes&idType=commentId&uid=${userAddress}&itemId=${extraParam.itemId}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              }
            );
            const existingVote = doesVoteExist.data;
            let vid;
            if (existingVote) {
              vid = existingVote._id.toString();
            } else {
              vid = null;
            }

            response = await apiClient.post(
              "http://localhost:5000/api/toggleVote",
              {
                voteId: vid,
                userId: userAddress.toLowerCase(),
                itemId: extraParam.itemId,
                voteType: "Comment Votes",
                itemType: "Comments",
                userAction: "Upvote",
              },
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              }
            );
          }
          window.location.reload();
          break;

        case "downvoteComment":
          {
            const doesVoteExist = await apiClient.get(
              `http://localhost:5000/api/checkExistingVote?voteType=Comment%20Votes&idType=commentId&uid=${userAddress}&itemId=${extraParam.itemId}`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              }
            );
            const existingVote = doesVoteExist.data;
            let vid;
            if (existingVote) {
              vid = existingVote._id.toString();
            } else {
              vid = null;
            }

            const response = await apiClient.post(
              "http://localhost:5000/api/toggleVote",
              {
                voteId: vid,
                userId: userAddress,
                itemId: extraParam.itemId,
                voteType: "Comment Votes",
                itemType: "Comments",
                userAction: "Downvote",
              },
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              }
            );
          }
          window.location.reload();
          break;

        case "reply": {
          try {
            const { commentText, postId, parentId, ensName } = extraParam;

            // Ensure commentText and postId are provided
            if (!commentText || !postId) {
              console.error("Missing required parameters for replying:", {
                commentText,
                postId,
              });
              return;
            }

            // Ensure authToken exists
            if (!authToken) {
              console.error("User is not authorized. Missing auth token.");
              return;
            }

            const requestData = {
              commentText,
              postId,
              parentId: parentId || null,
              ensName: ensName || null,
            };

            response = await apiClient.post(
              "http://localhost:5000/api/writeComment",
              requestData,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              }
            );
          } catch (error) {
            if (error.response) {
              console.error("Error creating reply:", error.response.data);
            } else {
              console.error("Error creating reply:", error.message);
            }
          }
          break;
        }

        case "createPost": {
          onClick();
          break;
        }

        case "submitPost":
          response = await apiClient.post(
            "https://localhost:5000/api/writePost",
            {
              postTitle: extraParam.postTitle,
              postText: extraParam.postText,
              userId: userAddress,
              channelId: extraParam.channelId,
            }
          );
          break;

        case "editPost":
        case "submitEditPost":
        case "deletePost":
        case "confirmDeletePost":
        case "editComment":
          response = await apiClient.put("/editItem", {
            itemId: extraParam.itemId,
            newContent: extraParam.newContent,
            userId: userAddress,
            itemType: type.includes("Post") ? "post" : "comment",
          });
          break;
        case "submitEditComment":

        default:
          console.error("Unsupported action type");
          return;
      }

      if (onClick) {
        onClick(response.data);
      }
    } catch (error) {
      console.error(
        "Error performing action:",
        error.response ? error.response.data : error.message
      );
    }
  };
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    const authToken = localStorage.getItem("authToken");

    try {
      const endpoint = "http://localhost:5000/api/writeComment";
      const payload = {
        commentText: formContent,
        postId: extraParam.postId,
        userId: userAddress,
        parentId: type === "replyToComment" ? extraParam.parentId : null,
      };

      const response = await apiClient.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setIsFormVisible(false);
      setFormContent("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };
  const renderButton = () => {
    switch (type) {
      case "upvotePost":
        return (
          <Button onClick={handleClick} className="button upvote">
            Upvote Post
          </Button>
        );
      case "downvotePost":
        return (
          <Button onClick={handleClick} className="button downvote">
            Downvote Post
          </Button>
        );
      case "upvoteComment":
        return (
          <Button onClick={handleClick} className="button upvote">
            Upvote Comment
          </Button>
        );
      case "downvoteComment":
        return (
          <Button onClick={handleClick} className="button downvote">
            Downvote Comment
          </Button>
        );

      case "createPost":
        return (
          <Button onClick={handleClick} className="button create">
            Create Post
          </Button>
        );
      case "submitPost":
        return (
          <Button onClick={handleClick} className="button submit">
            Submit Post
          </Button>
        );
      case "editPost":
        return (
          <Button onClick={handleClick} className="button edit">
            Edit Post
          </Button>
        );
      case "reply":
        return (
          <Button onClick={handleClick} className="button reply">
            Reply
          </Button>
        );
      case "editComment":
        return (
          <Button onClick={handleClick} className="button edit">
            Edit Comment
          </Button>
        );
      default:
        return null;
    }
  };

  return <div>{renderButton()}</div>;
};

export default ButtonDisplay;
