import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FaqManager = () => {
    const [faqs, setFaqs] = useState([]);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const response = await axios.get('http://localhost:3000/admin/faqs');
            setFaqs(response.data);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
        }
    };

    const addFaq = async () => {
        const newFaq = { question, answer };
        await axios.post('http://localhost:3000/admin/faqs', newFaq);
        setQuestion('');
        setAnswer('');
        fetchFaqs();
    };

    const updateFaq = async (id) => {
        const updatedFaq = { question, answer };
        await axios.put(`http://localhost:3000/admin/faqs/${id}`, updatedFaq);
        fetchFaqs();
    };

    const deleteFaq = async (id) => {
        await axios.delete(`http://localhost:3000/admin/faqs/${id}`);
        fetchFaqs();
    };

    return (
        <div className="faq-manager">
            <h2>Manage FAQs</h2>
            <input
                type="text"
                placeholder="Question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
            />
            <input
                type="text"
                placeholder="Answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
            />
            <button onClick={addFaq}>Add FAQ</button>
            <ul>
                {faqs.map((faq) => (
                    <li key={faq._id}>
                        <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                        <input
                            type="text"
                            value={faq.answer}
                            onChange={(e) => setAnswer(e.target.value)}
                        />
                        <button onClick={() => updateFaq(faq._id)}>Update</button>
                        <button onClick={() => deleteFaq(faq._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FaqManager;
