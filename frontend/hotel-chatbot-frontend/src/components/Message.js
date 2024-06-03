import React from 'react';
import './ChatWindow.css';

const Message = ({ text, isUser }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Question copied to clipboard');
        });
    };

    return (
        <div className="message-container">
            <div className={`message ${isUser ? 'user' : 'bot'}`}>
                <p>{text}</p>
            </div>
            {isUser && <button className="copy-button" onClick={handleCopy}>Copy</button>}
        </div>
    );
};

export default Message;
