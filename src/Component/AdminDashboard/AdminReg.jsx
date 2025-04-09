import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../passwordInput/passwordInput'

const AdminReg = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('https://drm-backend.vercel.app/api/admin/register',
                // 'http://localhost:4000/api/admin/register', 
                formData);
            console.log('Registration successful', data);
        } catch (error) {
            console.error('Error registering', error);
        }
        navigate('/admin-log')
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="username" placeholder="Username" onChange={handleChange} />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} />
            <PasswordInput type="password" name="password" placeholder="Password" onChange={handleChange} />
            <button type="submit">Register</button>
        </form>
    );
};

export default AdminReg;
