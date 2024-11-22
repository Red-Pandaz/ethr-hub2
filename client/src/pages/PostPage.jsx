import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import ButtonDisplay from "../components/ActionButtons";
import CommentForm from "../components/CommentForm";
import CommentList from "../components/CommentListComponent";
import Post from "../components/PostComponent";

const PostPage = () => {
  const { postId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userAddress, authToken, isConnected, loading: contextLoading } = useAuth();

  useEffect(() => {
    // Automatically set the body to dark theme on mount
    document.body.setAttribute("data-theme", "dark");

    axios
      .get(`http://localhost:5000/api/posts/${postId}`)
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [postId]);

  if (contextLoading || loading) return <p>Loading...</p>;

  if (!data) return <p>No data found</p>;
  if (!isConnected) return <p>Please log in to interact with the post.</p>;

  return (
    <div style={{marginLeft: "15px"}}>
      <p>You are signed in as {localStorage.getItem("ensName") === "null" ? userAddress : localStorage.getItem("ensName")}</p>
      <Post data={data} />
      {data.comments && (
        <CommentList comments={data.comments} postId={postId} />
      )}
    </div>
  );
};

export default PostPage;
