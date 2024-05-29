import React, { useState } from 'react';
import FaqManager from './FaqManager';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [showFaqs, setShowFaqs] = useState(false);

    const handleShowFaqs = () => {
        setShowFaqs(!showFaqs);
    };

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <button className="toggle-button" onClick={handleShowFaqs}>
                {showFaqs ? 'Hide Manage FAQs' : 'Manage FAQs'}
            </button>
            {showFaqs && <FaqManager />}
        </div>
    );
};

export default AdminDashboard;
