import React, { useState } from 'react';
import axios from 'axios';
import Message from './Message';
import UserInput from './UserInput';

const ChatWindow = () => {
    const [messages, setMessages] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const addMessage = async (message) => {
        const newMessages = [...messages, { text: message, isUser: true }];
        setMessages(newMessages);

        // Chat history up to the latest user message
        const chatHistoryToSend = chatHistory.map((entry) => ({
            role: entry.role,
            message: entry.content,
        }));

        // Add the latest user message to chat history
        const updatedChatHistory = [...chatHistory, { role: 'USER', content: message }];

        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:3000/message', {
                message,
                chatHistory: chatHistoryToSend,
            });

            setMessages((prevMessages) => [
                ...prevMessages,
                { text: response.data.response, isUser: false },
            ]);

            // Update the chat history with the chatbot's response
            setChatHistory([...updatedChatHistory, { role: 'CHATBOT', content: response.data.response }]);
        } catch (error) {
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: 'Error processing message', isUser: false },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-window">
            <div className="messages">
                {messages.map((msg, index) => (
                    <Message key={index} text={msg.text} isUser={msg.isUser} />
                ))}
                {isLoading && <Message text="Loading..." isUser={false} />}
            </div>
            <UserInput addMessage={addMessage} />
        </div>
    );
};

export default ChatWindow;
