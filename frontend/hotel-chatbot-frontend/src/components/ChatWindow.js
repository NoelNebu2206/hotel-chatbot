import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Message from './Message';
import UserInput from './UserInput';
import { apiUrl } from '../constants';

const ChatWindow = () => {
    const [messages, setMessages] = useState([{ text: "Hey I'm OmenaChat, how can I assist you today?", isUser: false }]);
    const [chatHistory, setChatHistory] = useState([{ role: 'CHATBOT', content: "Hey I'm OmenaChat, how can I assist you today?" }]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
            const response = await axios.post(`${apiUrl}/message`, {
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
                <div ref={messagesEndRef} />
            </div>
            <UserInput addMessage={addMessage} />
        </div>
    );
};

export default ChatWindow;
