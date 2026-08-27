import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wallet, Plus, TrendingUp, TrendingDown, DollarSign, PieChart, ArrowUpRight, ArrowDownRight, Trash2, X, AlertCircle, Tag } from 'lucide-react';
export default function BudgetPage() {
    const { token } = useAuth();
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        netSavings: 0,
        totalTransactions: 0
    });
    const [categoryStats, setCategoryStats] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Filters State
    const [activeTabFilter, setActiveTabFilter] = useState('ALL');
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({
        type: 'EXPENSE',
        amount: '',
        categoryName: 'Food & Mess',
        description: '',
        transactionDate: new Date().toISOString().split('T')[0]
    });
    // Fetch Summary & Transactions
    const fetchData = useCallback(async () => {
        if (!token)
            return;
        try {
            setLoading(true);
            setError(null);
            // Fetch Summary
            const sumRes = await fetch('http://192.168.10.180:4000/api/v1/budget/summary', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const sumData = await sumRes.json();
            if (sumRes.ok) {
                setSummary(sumData.summary || { totalIncome: 0, totalExpense: 0, netSavings: 0, totalTransactions: 0 });
                setCategoryStats(sumData.categoryStats || []);
            }
            // Fetch Transactions
            let txUrl = 'http://192.168.10.180:4000/api/v1/budget/transactions';
            if (activeTabFilter !== 'ALL') {
                txUrl += `?type=${activeTabFilter}`;
            }
            const txRes = await fetch(txUrl, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const txData = await txRes.json();
            if (txRes.ok) {
                setTransactions(txData.transactions || []);
            }
            else {
                setError(txData.error || 'Failed to fetch financial data');
            }
        }
        catch {
            setError('Cannot connect to Express backend on http://192.168.10.180:4000');
        }
        finally {
            setLoading(false);
        }
    }, [token, activeTabFilter]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    // Log New Transaction
    const handleSaveTransaction = async (e) => {
        e.preventDefault();
        if (!token || !form.amount)
            return;
        try {
            const res = await fetch('http://192.168.10.180:4000/api/v1/budget/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...form,
                    amount: Number(form.amount)
                })
            });
            if (res.ok) {
                setIsModalOpen(false);
                setForm({
                    type: 'EXPENSE',
                    amount: '',
                    categoryName: 'Food & Mess',
                    description: '',
                    transactionDate: new Date().toISOString().split('T')[0]
                });
                fetchData();
            }
            else {
                const data = await res.json();
                alert(`Error: ${data.error || 'Failed to log transaction'}`);
            }
        }
        catch {
            alert('Cannot connect to backend');
        }
    };
    // Delete Transaction
    const handleDeleteTransaction = async (id) => {
        if (!confirm('Are you sure you want to delete this transaction record?'))
            return;
        try {
            const res = await fetch(`http://192.168.10.180:4000/api/v1/budget/transactions/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchData();
            }
        }
        catch {
            // Error
        }
    };
    const defaultCategories = form.type === 'EXPENSE'
        ? ['Food & Mess', 'Books & Supplies', 'Transport', 'Rent & Hostel', 'Utilities', 'Entertainment', 'Personal']
        : ['Allowance', 'Scholarship', 'Freelancing', 'Part-time Job', 'Gift/Other'];
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto space-y-8 select-none", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Wallet, { className: "w-6 h-6 text-emerald-400" }), _jsx("h1", { className: "text-2xl font-extrabold text-white tracking-tight", children: "Budget & Personal Finance Manager" })] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Track monthly student income, expenses, category spending limits, and net savings." })] }), _jsxs("button", { onClick: () => setIsModalOpen(true), className: "px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Log Transaction" })] })] }), error && (_jsxs("div", { className: "p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400", children: [_jsx(AlertCircle, { className: "w-5 h-5 shrink-0" }), _jsx("span", { children: error })] })), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("div", { className: "p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs font-mono text-slate-400 block mb-1", children: "TOTAL INCOME" }), _jsxs("span", { className: "text-2xl font-extrabold text-emerald-400", children: ["$", summary.totalIncome.toFixed(2)] }), _jsx("p", { className: "text-[11px] text-slate-500 mt-1", children: "Allowance & Earnings" })] }), _jsx("div", { className: "p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400", children: _jsx(ArrowUpRight, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs font-mono text-slate-400 block mb-1", children: "TOTAL EXPENSES" }), _jsxs("span", { className: "text-2xl font-extrabold text-rose-400", children: ["$", summary.totalExpense.toFixed(2)] }), _jsx("p", { className: "text-[11px] text-slate-500 mt-1", children: "Mess, Rent & Books" })] }), _jsx("div", { className: "p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400", children: _jsx(ArrowDownRight, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs font-mono text-slate-400 block mb-1", children: "NET SAVINGS / BALANCE" }), _jsxs("span", { className: `text-2xl font-extrabold ${summary.netSavings >= 0 ? 'text-blue-400' : 'text-rose-400'}`, children: ["$", summary.netSavings.toFixed(2)] }), _jsx("p", { className: "text-[11px] text-slate-500 mt-1", children: "Remaining Funds" })] }), _jsx("div", { className: "p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400", children: _jsx(DollarSign, { className: "w-6 h-6" }) })] })] }), categoryStats.length > 0 && (_jsxs("div", { className: "p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h3", { className: "text-sm font-bold text-white flex items-center gap-2", children: [_jsx(PieChart, { className: "w-4 h-4 text-emerald-400" }), _jsx("span", { children: "Category Budget Limits & Progress" })] }), _jsxs("span", { className: "text-xs font-mono text-slate-400", children: [categoryStats.length, " Categories"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: categoryStats.map(cat => {
                            const isOverLimit = cat.monthlyLimit > 0 && cat.spentAmount > cat.monthlyLimit;
                            return (_jsxs("div", { className: "p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-bold text-white", children: cat.name }), _jsxs("span", { className: `font-mono font-bold ${isOverLimit ? 'text-rose-400' : 'text-slate-300'}`, children: ["$", cat.spentAmount.toFixed(2), " ", cat.monthlyLimit > 0 ? `/ $${cat.monthlyLimit}` : ''] })] }), cat.monthlyLimit > 0 && (_jsx("div", { className: "w-full h-1.5 bg-slate-800 rounded-full overflow-hidden", children: _jsx("div", { className: `h-full transition-all ${isOverLimit ? 'bg-rose-500' : 'bg-emerald-500'}`, style: { width: `${Math.min(cat.percentUsed, 100)}%` } }) })), _jsxs("div", { className: "flex justify-between text-[10px] text-slate-500", children: [_jsx("span", { children: cat.type }), isOverLimit && _jsx("span", { className: "text-rose-400 font-bold", children: "Over Limit!" })] })] }, cat.id));
                        }) })] })), _jsxs("div", { className: "p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-left", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4", children: [_jsx("h3", { className: "text-sm font-bold text-white", children: "Transaction History Log" }), _jsxs("div", { className: "flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium", children: [_jsx("button", { onClick: () => setActiveTabFilter('ALL'), className: `px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTabFilter === 'ALL' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`, children: "All Logs" }), _jsx("button", { onClick: () => setActiveTabFilter('INCOME'), className: `px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTabFilter === 'INCOME' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`, children: "Income \uD83D\uDFE2" }), _jsx("button", { onClick: () => setActiveTabFilter('EXPENSE'), className: `px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTabFilter === 'EXPENSE' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'}`, children: "Expense \uD83D\uDD34" })] })] }), loading ? (_jsx("div", { className: "p-8 text-center text-xs text-slate-500", children: "Loading transactions..." })) : transactions.length === 0 ? (_jsxs("div", { className: "p-8 text-center text-xs text-slate-500 space-y-2", children: [_jsx(Wallet, { className: "w-8 h-8 mx-auto text-slate-700" }), _jsx("p", { children: "No transactions logged yet." })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-xs text-left", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-slate-800 text-slate-400 font-mono text-[11px]", children: [_jsx("th", { className: "pb-3 pl-2", children: "DATE" }), _jsx("th", { className: "pb-3", children: "CATEGORY" }), _jsx("th", { className: "pb-3", children: "DESCRIPTION" }), _jsx("th", { className: "pb-3", children: "TYPE" }), _jsx("th", { className: "pb-3 text-right", children: "AMOUNT" }), _jsx("th", { className: "pb-3 pr-2 text-right", children: "ACTION" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800/60", children: transactions.map(t => {
                                        const isIncome = t.type === 'INCOME';
                                        return (_jsxs("tr", { className: "hover:bg-slate-950/40 transition-colors", children: [_jsx("td", { className: "py-3.5 pl-2 font-mono text-slate-400", children: new Date(t.transactionDate).toLocaleDateString() }), _jsxs("td", { className: "py-3.5 font-bold text-white flex items-center gap-1.5", children: [_jsx(Tag, { className: "w-3.5 h-3.5 text-slate-500" }), _jsx("span", { children: t.category.name })] }), _jsx("td", { className: "py-3.5 text-slate-300", children: t.description || 'N/A' }), _jsx("td", { className: "py-3.5", children: _jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold font-mono ${isIncome ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`, children: t.type }) }), _jsxs("td", { className: `py-3.5 text-right font-mono font-bold ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`, children: [isIncome ? '+' : '-', "$", t.amount.toFixed(2)] }), _jsx("td", { className: "py-3.5 pr-2 text-right", children: _jsx("button", { onClick: () => handleDeleteTransaction(t.id), className: "p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) }) })] }, t.id));
                                    }) })] }) }))] }), isModalOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [_jsxs("h3", { className: "text-base font-bold text-white flex items-center gap-2", children: [_jsx(Wallet, { className: "w-5 h-5 text-emerald-400" }), _jsx("span", { children: "Log Financial Transaction" })] }), _jsx("button", { onClick: () => setIsModalOpen(false), className: "p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("form", { onSubmit: handleSaveTransaction, className: "space-y-4 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-2 font-medium", children: "Transaction Type *" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("button", { type: "button", onClick: () => setForm({ ...form, type: 'EXPENSE', categoryName: 'Food & Mess' }), className: `py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${form.type === 'EXPENSE'
                                                        ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg'
                                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`, children: [_jsx(TrendingDown, { className: "w-4 h-4" }), _jsx("span", { children: "Expense \uD83D\uDD34" })] }), _jsxs("button", { type: "button", onClick: () => setForm({ ...form, type: 'INCOME', categoryName: 'Allowance' }), className: `py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${form.type === 'INCOME'
                                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg'
                                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`, children: [_jsx(TrendingUp, { className: "w-4 h-4" }), _jsx("span", { children: "Income \uD83D\uDFE2" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Amount ($) *" }), _jsx("input", { type: "number", step: "0.01", required: true, placeholder: "50.00", value: form.amount, onChange: (e) => setForm({ ...form, amount: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-base placeholder-slate-600 focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Category *" }), _jsx("select", { value: form.categoryName, onChange: (e) => setForm({ ...form, categoryName: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500", children: defaultCategories.map(cat => (_jsx("option", { value: cat, children: cat }, cat))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Description (Optional)" }), _jsx("input", { type: "text", placeholder: "e.g. Bought DBMS Reference Book", value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-slate-400 mb-1 font-medium", children: "Transaction Date" }), _jsx("input", { type: "date", value: form.transactionDate, onChange: (e) => setForm({ ...form, transactionDate: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: () => setIsModalOpen(false), className: "flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer", children: "Cancel" }), _jsx("button", { type: "submit", className: "flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/20 cursor-pointer", children: "Log Record" })] })] })] }) }))] }));
}
