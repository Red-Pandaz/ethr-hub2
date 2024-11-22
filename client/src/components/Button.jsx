// Button.js
import React from 'react';
import './Button.css'; // Import button styles

const Button = ({ onClick, className, children }) => {
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
};

export default Button;