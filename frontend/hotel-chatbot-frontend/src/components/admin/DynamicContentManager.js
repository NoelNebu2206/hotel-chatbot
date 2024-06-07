import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../../constants';

const DynamicContentManager = () => {
    const [content, setContent] = useState([]);
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const response = await axios.get(`${apiUrl}/admin/dynamic-content`);
            setContent(response.data);
        } catch (error) {
            console.error('Error fetching dynamic content:', error);
        }
    };

    const addContent = async () => {
        const newContent = { key, value };
        await axios.post(`${apiUrl}/admin/dynamic-content`, newContent);
        setKey('');
        setValue('');
        fetchContent();
    };

    const updateContent = async (id) => {
        const updatedContent = { key, value };
        await axios.put(`${apiUrl}/admin/dynamic-content/${id}`, updatedContent);
        fetchContent();
    };

    const deleteContent = async (id) => {
        await axios.delete(`${apiUrl}/admin/dynamic-content/${id}`);
        fetchContent();
    };

    return (
        <div className="dynamic-content-manager">
            <h2>Manage Dynamic Content</h2>
            <input
                type="text"
                placeholder="Key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
            />
            <input
                type="text"
                placeholder="Value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <button onClick={addContent}>Add Content</button>
            <ul>
                {content.map((item) => (
                    <li key={item._id}>
                        <input
                            type="text"
                            value={item.key}
                            onChange={(e) => setKey(e.target.value)}
                        />
                        <input
                            type="text"
                            value={item.value}
                            onChange={(e) => setValue(e.target.value)}
                        />
                        <button onClick={() => updateContent(item._id)}>Update</button>
                        <button onClick={() => deleteContent(item._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DynamicContentManager;
