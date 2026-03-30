import React, { useState } from 'react';

const AdminAuthTabs = ({ activeTab, onTabChange }) => {
    return (
        <div className="admin-auth-tabs" style={{
            display: 'flex',
            marginBottom: '30px',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '12px',
            position: 'relative'
        }}>
            <button
                onClick={() => onTabChange('login')}
                style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: '0.3s',
                    background: activeTab === 'login' ? 'white' : 'transparent',
                    color: activeTab === 'login' ? 'var(--primary)' : 'var(--text-muted)',
                    boxShadow: activeTab === 'login' ? '0 4px 6px -1px rgb(0 0 0 / 0.05)' : 'none'
                }}
            >
                Login
            </button>
            <button
                onClick={() => onTabChange('signup')}
                style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: '0.3s',
                    background: activeTab === 'signup' ? 'white' : 'transparent',
                    color: activeTab === 'signup' ? 'var(--primary)' : 'var(--text-muted)',
                    boxShadow: activeTab === 'signup' ? '0 4px 6px -1px rgb(0 0 0 / 0.05)' : 'none'
                }}
            >
                Sign Up
            </button>
        </div>
    );
};

export default AdminAuthTabs;
