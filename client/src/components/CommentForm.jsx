import React, { useState } from "react";
import './CommentForm.css'

const CommentForm = ({ onSubmit, onCancel }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
      setText(""); // Clear the form after submission
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your comment here..."
        rows="4"
        cols="50"
        className='comment-form'
      ></textarea>
      <br />
      <button type="submit">Submit</button>
      <button type="button" className='cancel-btn' onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
};

export default CommentForm;
