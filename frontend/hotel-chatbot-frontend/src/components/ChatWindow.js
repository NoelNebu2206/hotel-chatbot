import React, { useState } from 'react';
import axios from 'axios';
import Message from './Message';
import UserInput from './UserInput';

const ChatWindow = () => {
    const [messages, setMessages] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);

    const addMessage = async (message) => {
        const newMessages = [...messages, { text: message, isUser: true }];
        setMessages(newMessages);
        setChatHistory([...chatHistory, { role: 'USER', message }]);

        try {
            const response = await axios.post('http://localhost:3000/message', {
                message,
                chatHistory,
            });
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: response.data.response, isUser: false },
            ]);
            setChatHistory((prevChatHistory) => [
                ...prevChatHistory,
                { role: 'CHATBOT', message: response.data.response },
            ]);
        } catch (error) {
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: 'Error processing message', isUser: false },
            ]);
        }
    };

    return (
        <div className="chat-window">
            <div className="messages">
                {messages.map((msg, index) => (
                    <Message key={index} text={msg.text} isUser={msg.isUser} />
                ))}
            </div>
            <UserInput addMessage={addMessage} />
        </div>
    );
};

export default ChatWindow;
