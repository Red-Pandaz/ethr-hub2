import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient from "../utils/apiClient";
import './ChannelPage.css';

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleString('en-US', options);
};

const ChannelPage = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posts, setPosts] = useState([]);
  const [channel, setChannel] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [ensName, setEnsName] = useState(null);
  const [loading, setLoading] = useState(true);

  const { channelId } = useParams();
  const { userAddress, authToken } = useAuth();
  const navigate = useNavigate();

  // Apply the theme to the document when it changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  // Fetch channel and posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (!/^[a-fA-F0-9]{24}$/.test(channelId)) {
          navigate("/error", { replace: true });
          return;
        }

        const response = await apiClient.get(`http://localhost:5000/api/channels/${channelId}`);
        if (!response.data.channel || response.data.channel.length === 0) {
          navigate("/error", { replace: true });
          return;
        }

        const sortedPosts = response.data.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(sortedPosts);
        setChannel(response.data.channel[0]);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [channelId]);

  // Fetch ENS Name
  useEffect(() => {
    const fetchEnsName = async () => {
      try {
        const response = await apiClient.get(`http://localhost:5000/api/ensname/${userAddress}`);
        setEnsName(response.data.ensName);
      } catch (error) {
        console.error("Error fetching ENS name:", error);
      }
    };

    if (userAddress) fetchEnsName();
  }, [userAddress]);

  // Handle post submission
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newPost = {
        postTitle,
        postText,
        ensName,
        userId: userAddress,
        channelId,
      };
      const response = await apiClient.post("http://localhost:5000/api/writePost", newPost, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setPostTitle("");
      setPostText("");
      setIsFormVisible(false);
      window.location.reload();
    } catch (error) {
      console.error("Error submitting post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className={`channel-page-container ${theme}`}>
      <div className="header-container">
        <h1>{channel.name}</h1>
        <h3>{channel.description}</h3>
      </div>

      <p>You are signed in as {localStorage.getItem("ensName") === "null" ? userAddress : localStorage.getItem("ensName")}</p>

      <button onClick={() => setIsFormVisible(!isFormVisible)} className="create-post-btn">
        {isFormVisible ? "Cancel" : "Create Post"}
      </button>

      {isFormVisible && (
        <form onSubmit={handlePostSubmit} className="new-post-form">
          <div>
            <label>
              Title:
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Content:
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                rows="4"
                required
              ></textarea>
            </label>
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Post"}
          </button>
        </form>
      )}

      <div className="post-list">
        {posts.map((post) => (
          <div key={post._id} className="post-item">
            <h3>
              <a href={`/posts/${post._id}`}>{post.title || "Untitled Post"}</a>
            </h3>
            <p>by {post.ensName || post.createdBy || "No content available."}</p>
            <p>Posted on {formatTimestamp(post.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChannelPage;