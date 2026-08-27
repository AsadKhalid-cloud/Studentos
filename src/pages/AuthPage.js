import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/pages/AuthPage.tsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, GraduationCap, Building, BookOpen, ArrowRight, AlertCircle } from 'lucide-react';
export default function AuthPage() {
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Form State
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        loginIdentifier: '',
        universityName: 'My University',
        department: 'Department of IT',
        degreeProgram: 'BS Information Technology'
    });
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const endpoint = isLogin ? 'login' : 'register';
        const payload = isLogin
            ? {
                loginIdentifier: formData.loginIdentifier || formData.email || formData.username,
                username: formData.loginIdentifier || formData.username,
                email: formData.loginIdentifier || formData.email,
                password: formData.password
            }
            : {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                universityName: formData.universityName,
                department: formData.department,
                degreeProgram: formData.degreeProgram
            };
        // Direct Fast Local Wi-Fi API Base URL
        const API_BASE_URL = 'http://192.168.10.180:4000';
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/auth/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }
            // Login Successful!
            login(data.token, data.user);
        }
        catch (err) {
            console.error('Auth Error Detail:', err);
            setError(err?.message || 'Connection Error. Please check backend server.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 select-none", children: _jsxs("div", { className: "w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 text-left", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "inline-flex p-2.5 rounded-2xl bg-slate-950 border border-slate-800 mb-3 shadow-md", children: _jsx("img", { src: "/images/logo.png", alt: "StudentOS Logo", className: "w-10 h-10 object-contain rounded-xl" }) }), _jsx("h1", { className: "text-2xl font-bold text-white tracking-tight", children: "StudentOS" }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Academic & Life Management System" })] }), _jsxs("div", { className: "flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800 text-xs font-semibold", children: [_jsx("button", { type: "button", onClick: () => { setIsLogin(true); setError(null); }, className: `flex-1 py-2.5 rounded-lg transition-all cursor-pointer ${isLogin ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`, children: "Sign In" }), _jsx("button", { type: "button", onClick: () => { setIsLogin(false); setError(null); }, className: `flex-1 py-2.5 rounded-lg transition-all cursor-pointer ${!isLogin ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`, children: "Create Account" })] }), error && (_jsxs("div", { className: "mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-400", children: [_jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }), _jsx("span", { children: error })] })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 text-xs", children: [isLogin ? (_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Username or Email" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "w-4 h-4 text-slate-500 absolute left-3 top-3" }), _jsx("input", { type: "text", name: "loginIdentifier", required: true, placeholder: "student / student@univ.edu", value: formData.loginIdentifier, onChange: handleChange, className: "w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors" })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Username" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "w-4 h-4 text-slate-500 absolute left-3 top-3" }), _jsx("input", { type: "text", name: "username", required: true, placeholder: "bsit_student", value: formData.username, onChange: handleChange, className: "w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Email Address" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "w-4 h-4 text-slate-500 absolute left-3 top-3" }), _jsx("input", { type: "email", name: "email", required: true, placeholder: "student@univ.edu", value: formData.email, onChange: handleChange, className: "w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "University Name" }), _jsxs("div", { className: "relative", children: [_jsx(GraduationCap, { className: "w-4 h-4 text-slate-500 absolute left-3 top-3" }), _jsx("input", { type: "text", name: "universityName", placeholder: "University of Technology", value: formData.universityName, onChange: handleChange, className: "w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Department" }), _jsxs("div", { className: "relative", children: [_jsx(Building, { className: "w-4 h-4 text-slate-500 absolute left-3 top-3" }), _jsx("input", { type: "text", name: "department", placeholder: "IT Dept", value: formData.department, onChange: handleChange, className: "w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Degree" }), _jsxs("div", { className: "relative", children: [_jsx(BookOpen, { className: "w-4 h-4 text-slate-500 absolute left-3 top-3" }), _jsx("input", { type: "text", name: "degreeProgram", placeholder: "BS-IT", value: formData.degreeProgram, onChange: handleChange, className: "w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors" })] })] })] })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "w-4 h-4 text-slate-500 absolute left-3 top-3" }), _jsx("input", { type: "password", name: "password", required: true, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: formData.password, onChange: handleChange, className: "w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors" })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer", children: loading ? (_jsx("span", { children: "Processing..." })) : (_jsxs(_Fragment, { children: [_jsx("span", { children: isLogin ? 'Sign In to Workspace' : 'Complete Registration' }), _jsx(ArrowRight, { className: "w-4 h-4" })] })) })] })] }) }));
}
