import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../passwordInput/passwordInput';


const AdminLog = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await fetch('https://drm-backend.vercel.app/admin/login',
                // 'http://localhost:4000/api/admin/login',
                 formData);
            console.log('Login successful', data);
        } catch (error) {
            console.error('Error logging in', error);
        }
        navigate('/admin');
    };

    return (
        <div className={styles.adminLogWrapper}>
            <form onSubmit={handleSubmit} className={styles.adminLogForm}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    className={styles.adminLogInput}
                />
                <PasswordInput
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    className={styles.adminLogInput}
                />
                <button type="submit" className={styles.adminLogButton}>Login</button>
            </form>
        </div>
    );
};

export default AdminLog;
