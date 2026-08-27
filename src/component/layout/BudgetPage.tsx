import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Wallet, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2, 
  X, 
  AlertCircle,
  Tag,
  Calendar
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  transactionDate: string;
  category: {
    name: string;
    type: string;
  };
}

interface CategoryStat {
  id: string;
  name: string;
  type: string;
  monthlyLimit: number;
  spentAmount: number;
  remainingLimit: number;
  percentUsed: number;
}

export default function BudgetPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    totalTransactions: 0
  });
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    amount: '',
    categoryName: 'Food & Mess',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0]
  });

  // Fetch Summary & Transactions
  const fetchData = useCallback(async () => {
    if (!token) return;
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
      } else {
        setError(txData.error || 'Failed to fetch financial data');
      }
    } catch {
      setError('Cannot connect to Express backend on http://192.168.10.180:4000');
    } finally {
      setLoading(false);
    }
  }, [token, activeTabFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Log New Transaction
  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !form.amount) return;

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
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || 'Failed to log transaction'}`);
      }
    } catch {
      alert('Cannot connect to backend');
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction record?')) return;
    try {
      const res = await fetch(`http://192.168.10.180:4000/api/v1/budget/transactions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      }
    } catch {
      // Error
    }
  };

  const defaultCategories = form.type === 'EXPENSE' 
    ? ['Food & Mess', 'Books & Supplies', 'Transport', 'Rent & Hostel', 'Utilities', 'Entertainment', 'Personal']
    : ['Allowance', 'Scholarship', 'Freelancing', 'Part-time Job', 'Gift/Other'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Budget & Personal Finance Manager</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track monthly student income, expenses, category spending limits, and net savings.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log Transaction</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Income */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block mb-1">TOTAL INCOME</span>
            <span className="text-2xl font-extrabold text-emerald-400">${summary.totalIncome.toFixed(2)}</span>
            <p className="text-[11px] text-slate-500 mt-1">Allowance & Earnings</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Expense */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block mb-1">TOTAL EXPENSES</span>
            <span className="text-2xl font-extrabold text-rose-400">${summary.totalExpense.toFixed(2)}</span>
            <p className="text-[11px] text-slate-500 mt-1">Mess, Rent & Books</p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Net Balance / Savings */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block mb-1">NET SAVINGS / BALANCE</span>
            <span className={`text-2xl font-extrabold ${summary.netSavings >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
              ${summary.netSavings.toFixed(2)}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Remaining Funds</p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Category Spending Limits Grid */}
      {categoryStats.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>Category Budget Limits & Progress</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">{categoryStats.length} Categories</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.map(cat => {
              const isOverLimit = cat.monthlyLimit > 0 && cat.spentAmount > cat.monthlyLimit;

              return (
                <div key={cat.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{cat.name}</span>
                    <span className={`font-mono font-bold ${isOverLimit ? 'text-rose-400' : 'text-slate-300'}`}>
                      ${cat.spentAmount.toFixed(2)} {cat.monthlyLimit > 0 ? `/ $${cat.monthlyLimit}` : ''}
                    </span>
                  </div>

                  {cat.monthlyLimit > 0 && (
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${isOverLimit ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(cat.percentUsed, 100)}%` }}
                      ></div>
                    </div>
                  )}

                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{cat.type}</span>
                    {isOverLimit && <span className="text-rose-400 font-bold">Over Limit!</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction History Log Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-left">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-white">Transaction History Log</h3>

          {/* Filter Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTabFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTabFilter === 'ALL' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              All Logs
            </button>
            <button
              onClick={() => setActiveTabFilter('INCOME')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTabFilter === 'INCOME' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Income 🟢
            </button>
            <button
              onClick={() => setActiveTabFilter('EXPENSE')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTabFilter === 'EXPENSE' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Expense 🔴
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-2">
            <Wallet className="w-8 h-8 mx-auto text-slate-700" />
            <p>No transactions logged yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-3 pl-2">DATE</th>
                  <th className="pb-3">CATEGORY</th>
                  <th className="pb-3">DESCRIPTION</th>
                  <th className="pb-3">TYPE</th>
                  <th className="pb-3 text-right">AMOUNT</th>
                  <th className="pb-3 pr-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map(t => {
                  const isIncome = t.type === 'INCOME';
                  return (
                    <tr key={t.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-3.5 pl-2 font-mono text-slate-400">
                        {new Date(t.transactionDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 font-bold text-white flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-slate-500" />
                        <span>{t.category.name}</span>
                      </td>
                      <td className="py-3.5 text-slate-300">{t.description || 'N/A'}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          isIncome ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className={`py-3.5 text-right font-mono font-bold ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isIncome ? '+' : '-'}${t.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 pr-2 text-right">
                        <button
                          onClick={() => handleDeleteTransaction(t.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LOG TRANSACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <span>Log Financial Transaction</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4 text-xs">
              {/* Type Switcher */}
              <div>
                <label className="block text-slate-400 mb-2 font-medium">Transaction Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'EXPENSE', categoryName: 'Food & Mess' })}
                    className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      form.type === 'EXPENSE'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4" />
                    <span>Expense 🔴</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'INCOME', categoryName: 'Allowance' })}
                    className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      form.type === 'INCOME'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Income 🟢</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="50.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-base placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Category *</label>
                <select
                  value={form.categoryName}
                  onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {defaultCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Bought DBMS Reference Book"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Transaction Date</label>
                <input
                  type="date"
                  value={form.transactionDate}
                  onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  Log Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}