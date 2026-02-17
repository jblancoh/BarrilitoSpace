import React, { useState } from 'react';

interface JoinFormProps {
    onJoin: (username: string) => void;
}

export const JoinForm: React.FC<JoinFormProps> = ({ onJoin }) => {
    const [username, setUsername] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            onJoin(username.trim());
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1e1e2f 0%, #2d2d44 100%)',
            color: '#fff',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '2rem',
                borderRadius: '1rem',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center'
            }}>
                <h1 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>🛢️ BarrilitoSpace</h1>
                <p style={{ marginBottom: '2rem', color: '#ccc' }}>Enter your name to join the lounge</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Your name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoFocus
                        style={{
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            background: 'rgba(0, 0, 0, 0.2)',
                            color: '#fff',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#6366f1',
                            color: '#fff',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#4f46e5'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#6366f1'}
                    >
                        Join World
                    </button>
                </form>
            </div>
        </div >
    );
};
