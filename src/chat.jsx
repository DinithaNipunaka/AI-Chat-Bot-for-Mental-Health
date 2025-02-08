import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// Simple Icons as Components
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
  </svg>
);

const ExitIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
  </svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const LoadingIcon = () => (
  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" strokeDasharray="50" strokeDashoffset="20"/>
  </svg>
);

function App() {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const chatBodyRef = useRef(null);

  const recommendedQuestions = [
    "What should I look for when evaluating my mental health?",
    "Is it better to manage stress on my own or seek professional help?",
    "How do I know if I am making real progress in my mental health journey?",
    "What are the key differences between therapy, medication, and lifestyle changes?",
    "What are the necessary steps to prioritize and maintain good mental health?",
  ];

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const removeMarkdown = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, '$1');
  };

  async function generateAnswer() {
    if (!question.trim()) return;
    
    setChatHistory(prev => [...prev, { type: 'question', content: question }]);
    setQuestion('');
    setShowRecommendations(false);
    setChatHistory(prev => [...prev, { type: 'answer', content: 'Loading...' }]);

    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyC9FpQriKpCZbYCxw110wZ0mSS8p_4ejHQ',
        {
          contents: [{ parts: [{ text: question }] }],
        }
      );

      const generatedText = removeMarkdown(response.data.candidates[0].content.parts[0].text);
      
      setChatHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { type: 'answer', content: generatedText };
        return updated;
      });
    } catch (error) {
      setChatHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { 
          type: 'answer', 
          content: 'Error generating response. Please try again.' 
        };
        return updated;
      });
    }
  }

  const handleRecommendedClick = (question) => {
    setQuestion(question);
    setShowRecommendations(false);
    generateAnswer();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateAnswer();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #EEF2FF, #E0E7FF)',
      padding: '1rem',
      transition: 'all 0.3s'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '1rem',
        height: '90vh'
      }}>
        {/* Sidebar */}
        <div style={{
          width: '64px',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '1rem 0',
          transition: 'all 0.3s'
        }}>
          <button 
            onClick={() => window.location.href = 'http://localhost:5173'}
            style={{
              padding: '0.5rem',
              borderRadius: '50%',
              color: '#EF4444',
              transition: 'all 0.2s',
              border: 'none',
              background: 'none',
              cursor: 'pointer'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#FEE2E2'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ExitIcon />
          </button>
        </div>

        {/* Main Chat Area */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          transition: 'all 0.3s'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ChatIcon />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1F2937' }}>AI Assistant</h2>
          </div>

          {/* Chat Body */}
          <div 
            ref={chatBodyRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {showRecommendations && chatHistory.length === 0 && (
              <div style={{
                display: 'grid',
                gap: '0.5rem',
                animation: 'fadeIn 0.3s ease-in'
              }}>
                {recommendedQuestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecommendedClick(item)}
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      borderRadius: '0.5rem',
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = '#818CF8';
                      e.currentTarget.style.backgroundColor = '#EEF2FF';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}

            {chatHistory.map((entry, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: entry.type === 'question' ? 'flex-end' : 'flex-start',
                  animation: 'slideIn 0.3s ease-out'
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    backgroundColor: entry.type === 'question' ? '#6366F1' : 'white',
                    border: entry.type === 'question' ? 'none' : '1px solid #E5E7EB',
                    color: entry.type === 'question' ? 'white' : '#1F2937'
                  }}
                >
                  {entry.content === 'Loading...' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <LoadingIcon />
                      <span>Thinking...</span>
                    </div>
                  ) : (
                    <pre style={{ 
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'inherit',
                      margin: 0
                    }}>
                      {entry.content}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            padding: '1rem',
            borderTop: '1px solid #E5E7EB',
            backgroundColor: 'white'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here..."
                style={{
                  flex: 1,
                  resize: 'none',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #E5E7EB',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#818CF8'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                rows="1"
                onKeyDown={handleKeyPress}
              />
              <button
                onClick={generateAnswer}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6366F1',
                  color: 'white',
                  borderRadius: '0.5rem',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#4F46E5'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#6366F1'}
              >
                <SendIcon />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideIn {
            from { 
              opacity: 0;
              transform: translateY(10px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-spin {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default App;