import React, { useState } from 'react';
import AdminAuthTabs from './AdminAuthTabs';

const AdminLoginModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('login');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(`Submitted ${activeTab} data:`, formData);
        onClose();
        alert(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} request logged to console.`);
    };

    return (
        <div className="admin-modal-overlay" style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            animation: 'fadeIn 0.3s ease-out'
        }} onClick={onClose}>
            <div className="admin-modal-content" style={{
                background: 'white',
                padding: '40px',
                borderRadius: '24px',
                width: '90%',
                maxWidth: '450px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                position: 'relative',
                animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }} onClick={(e) => e.stopPropagation()}>
                
                <h2 style={{
                    fontSize: '1.8rem',
                    fontWeight: '900',
                    marginBottom: '25px',
                    textAlign: 'center',
                    background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Admin Authentication
                </h2>

                <AdminAuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="admin@college.edu"
                            value={formData.email}
                            onChange={handleInputChange}
                            style={{
                                padding: '14px 18px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: '0.2s'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleInputChange}
                            style={{
                                padding: '14px 18px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                outline: 'none'
                             }}
                        />
                    </div>

                    {activeTab === 'signup' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                style={{
                                    padding: '14px 18px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{
                        marginTop: '10px',
                        padding: '16px',
                        fontSize: '1rem',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}>
                        {activeTab === 'login' ? 'Login' : 'Create Admin Account'}
                    </button>
                    
                    <button type="button" onClick={onClose} style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginTop: '10px'
                    }}>
                        Cancel
                    </button>
                </form>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { 
                    from { opacity: 0; transform: translateY(30px) scale(0.95); } 
                    to { opacity: 1; transform: translateY(0) scale(1); } 
                }
            `}</style>
        </div>
    );
};

export default AdminLoginModal;
