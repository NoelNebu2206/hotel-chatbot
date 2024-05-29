import React from 'react';
import ChatWindow from './components/ChatWindow';
import AdminDashboard from './components/admin/AdminDashboard';
import './App.css';
import './ChatWindow.css';

function App() {
  return (
      <div className="App">
          <h1 className="app-title">Talk to OmenaChat</h1>
          <div className="content">
              <ChatWindow />
              <AdminDashboard />
          </div>
      </div>
  );
}

export default App;
