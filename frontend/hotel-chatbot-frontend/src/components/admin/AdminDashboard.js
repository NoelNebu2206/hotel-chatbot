import React from 'react';
import FaqManager from './FaqManager';
import DynamicContentManager from './DynamicContentManager';

const AdminDashboard = () => {
    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <FaqManager />
            <DynamicContentManager />
        </div>
    );
};

export default AdminDashboard;
