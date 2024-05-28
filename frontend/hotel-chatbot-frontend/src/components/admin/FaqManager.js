import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FaqManager.css'; // Import CSS file for styling

const FaqManager = () => {
    const [faqs, setFaqs] = useState([]);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [selectedFaq, setSelectedFaq] = useState(null);
    const [showAllFaqs, setShowAllFaqs] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showNoResults, setShowNoResults] = useState(false);

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
        try {
            await axios.post('http://localhost:3000/admin/faqs', newFaq);
            setQuestion('');
            setAnswer('');
            fetchFaqs();
        } catch (error) {
            console.error('Error adding FAQ:', error);
        }
    };

    const updateFaq = async (id) => {
        const updatedFaq = { question, answer };
        try {
            await axios.put(`http://localhost:3000/admin/faqs/${id}`, updatedFaq);
            setQuestion('');
            setAnswer('');
            setSelectedFaq(null);
            fetchFaqs();
        } catch (error) {
            console.error('Error updating FAQ:', error);
        }
    };

    const deleteFaq = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/admin/faqs/${id}`);
            fetchFaqs();
        } catch (error) {
            console.error('Error deleting FAQ:', error);
        }
    };

    const handleSelectFaq = (faq) => {
        setQuestion(faq.question);
        setAnswer(faq.answer);
        setSelectedFaq(faq._id);
    };

    const handleShowAllFaqs = () => {
        setShowAllFaqs(!showAllFaqs);
    };

    const handleSearchFaqs = async () => {
        if (searchKeyword.trim() === '') {
            setSearchResults([]);
            setShowNoResults(false);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:3000/admin/faqs?search=${searchKeyword}`);
            setSearchResults(response.data);
            setShowNoResults(response.data.length === 0);
        } catch (error) {
            console.error('Error searching FAQs:', error);
            setSearchResults([]);
            setShowNoResults(true);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchFaqs();
        }
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
            {selectedFaq ? (
                <button onClick={() => updateFaq(selectedFaq)}>Update FAQ</button>
            ) : (
                <button onClick={addFaq}>Add FAQ</button>
            )}

            <div>
                <button onClick={handleShowAllFaqs}>
                    {showAllFaqs ? 'Hide All FAQs' : 'Show All FAQs'}
                </button>
            </div>

            <div>
                <input
                    type="text"
                    placeholder="Search FAQs"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button onClick={handleSearchFaqs}>Find FAQ</button>
            </div>

            {showAllFaqs && (
                <div className="faq-list">
                    {faqs.map((faq) => (
                        <div key={faq._id} className="faq-item">
                            <div className="faq-content">
                                <p><strong>Q:</strong> {faq.question}</p>
                                <p><strong>A:</strong> {faq.answer}</p>
                            </div>
                            <button onClick={() => handleSelectFaq(faq)}>Edit</button>
                            <button onClick={() => deleteFaq(faq._id)}>Delete</button>
                        </div>
                    ))}
                </div>
            )}

            {searchResults.length > 0 && (
                <div className="faq-list">
                    {searchResults.map((faq) => (
                        <div key={faq._id} className="faq-item">
                            <div className="faq-content">
                                <p><strong>Q:</strong> {faq.question}</p>
                                <p><strong>A:</strong> {faq.answer}</p>
                            </div>
                            <button onClick={() => handleSelectFaq(faq)}>Edit</button>
                            <button onClick={() => deleteFaq(faq._id)}>Delete</button>
                        </div>
                    ))}
                </div>
            )}

            {showNoResults && searchKeyword.trim() !== '' && (
                <p>No FAQs matching the keyword '{searchKeyword}'</p>
            )}
        </div>
    );
};

export default FaqManager;
