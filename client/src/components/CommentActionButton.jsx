import React, { useState } from "react";
import apiClient from "../utils/apiClient.jsx";
export default function CommentActionButton({
  extraParam,
  userAddress,
  authToken,
}) {
  const [showForm, setShowForm] = useState(false);
  const [formContent, setFormContent] = useState("");

  async function submitComment(e) {
    e.preventDefault();
    try {
      const response = await apiClient.post(
        "http://localhost:5000/api/writeComment",
        {
          commentText: formContent,
          postId: extraParam.postId,
          userId: userAddress, 
          parentId: extraParam.parentId || null,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setShowForm(false); 
      setFormContent(""); 
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  }

  return (
    <>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Write a Comment"}
      </button>
      {showForm && (
        <form onSubmit={submitComment}>
          <textarea
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            placeholder="Write your comment here..."
          />
          <button type="submit">Submit</button>
        </form>
      )}
    </>
  );
}
