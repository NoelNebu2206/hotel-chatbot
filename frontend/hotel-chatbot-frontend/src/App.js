import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import AdminDashboard from './components/admin/AdminDashboard';
import './App.css';

function App() {
    const [language, setLanguage] = useState('English'); // Default language is English

    const handleLanguageChange = (event) => {
        setLanguage(event.target.value);
    };

    return (
        <div className="App">
            <h1 className="app-title">Talk to OmenaChat</h1>
            <div className="language-selector">
                <label htmlFor="language">Choose language: </label>
                <select id="language" value={language} onChange={handleLanguageChange}>
                    <option value="English">English</option>
                    <option value="Finnish">Finnish</option>
                    <option value="Swedish">Swedish</option>
                </select>
            </div>
            <div className="content">
                <ChatWindow selectedLanguage={language} />
                <AdminDashboard />
            </div>
        </div>
    );
}

export default App;
