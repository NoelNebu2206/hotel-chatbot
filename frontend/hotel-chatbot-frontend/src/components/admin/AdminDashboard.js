import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FaqManager from './FaqManager';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [showFaqs, setShowFaqs] = useState(false);
    const [showPromptEditor, setShowPromptEditor] = useState(false);
    const [tone, setTone] = useState("Keep your responses as short and concise as possible, while maintaining a friendly tone.");

    useEffect(() => {
        // Fetch the current tone from the server on initial render
        const fetchTone = async () => {
            try {
                const response = await axios.get('http://localhost:3000/get-tone');
                setTone(response.data.tone);
            } catch (error) {
                console.error('Error fetching tone:', error);
            }
        };
        fetchTone();
    }, []);

    const handleShowFaqs = () => {
        setShowFaqs(!showFaqs);
    };

    const handleShowPromptEditor = () => {
        setShowPromptEditor(!showPromptEditor);
    };

    const handleSavePrompt = async () => {
        try {
            await axios.post('http://localhost:3000/update-tone', { newTone: tone });
            alert('Prompt tone saved successfully');
        } catch (error) {
            console.error('Error saving prompt tone:', error);
            alert('Failed to save prompt tone');
        }
    };

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <button className="toggle-button" onClick={handleShowFaqs}>
                {showFaqs ? 'Hide Manage FAQs' : 'Manage FAQs'}
            </button>
            {showFaqs && <FaqManager />}
            <button className="toggle-button" onClick={handleShowPromptEditor}>
                {showPromptEditor ? 'Hide Prompt Editor' : 'Edit Tone of Chatbot'}
            </button>
            {showPromptEditor && (
                <div className="prompt-editor">
                    <textarea
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        rows={5}
                        cols={50}
                    />
                    <button className="action-button" onClick={handleSavePrompt}>Save Tone</button>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
