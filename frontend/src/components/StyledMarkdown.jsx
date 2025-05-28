import React from 'react';
import ReactMarkdown from 'react-markdown';

const StyledMarkdown = ({ children }) => {
  return (
    <div className="prose dark:prose-invert">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
};

export default StyledMarkdown;
