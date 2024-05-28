import React, { useState } from 'react';
import FaqManager from './FaqManager';
// import DynamicContentManager from './DynamicContentManager';

const AdminDashboard = () => {
    const [showFaqs, setShowFaqs] = useState(false);

    const handleShowFaqs = () => {
        setShowFaqs(!showFaqs);
    };

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <button onClick={handleShowFaqs}>
                {showFaqs ? 'Hide FAQs' : 'Show All FAQs'}
            </button>
            {showFaqs && <FaqManager />}
            {/* <DynamicContentManager /> */}
        </div>
    );
};

export default AdminDashboard;
