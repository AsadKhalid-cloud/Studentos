import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Network, BookOpen, FileText, HelpCircle, Code2, ArrowRight, AlertCircle, Share2 } from 'lucide-react';
export default function KnowledgeGraphPage({ setActiveTab }) {
    const { token } = useAuth();
    const [nodes, setNodes] = useState([]);
    const [links, setLinks] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Type Filters
    const [filterType, setFilterType] = useState('ALL');
    // Fetch Graph Data
    const fetchGraphData = useCallback(async () => {
        if (!token)
            return;
        try {
            setLoading(true);
            setError(null);
            const res = await fetch('http://192.168.10.180:4000/api/v1/graph/data', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setNodes(data.nodes || []);
                setLinks(data.links || []);
                if (data.nodes && data.nodes.length > 0 && !selectedNode) {
                    setSelectedNode(data.nodes[0]);
                }
            }
            else {
                setError(data.error || 'Failed to fetch graph data');
            }
        }
        catch {
            setError('Cannot connect to Express backend on http://192.168.10.180:4000');
        }
        finally {
            setLoading(false);
        }
    }, [token]);
    useEffect(() => {
        fetchGraphData();
    }, [fetchGraphData]);
    // Filter Nodes
    const filteredNodes = nodes.filter(n => filterType === 'ALL' || n.type === filterType);
    // Jump to Workspace Module Helper
    const handleJumpToWorkspace = (node) => {
        switch (node.type) {
            case 'COURSE':
                setActiveTab('courses');
                break;
            case 'NOTE':
                setActiveTab('notes');
                break;
            case 'QUESTION':
                setActiveTab('questions');
                break;
            case 'CODE':
                setActiveTab('code');
                break;
            default:
                setActiveTab('dashboard');
        }
    };
    const getNodeIcon = (type) => {
        switch (type) {
            case 'COURSE': return _jsx(BookOpen, { className: "w-4 h-4 text-blue-400" });
            case 'NOTE': return _jsx(FileText, { className: "w-4 h-4 text-emerald-400" });
            case 'QUESTION': return _jsx(HelpCircle, { className: "w-4 h-4 text-purple-400" });
            default: return _jsx(Code2, { className: "w-4 h-4 text-amber-400" });
        }
    };
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto space-y-8 select-none text-left", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Network, { className: "w-6 h-6 text-purple-400" }), _jsx("h1", { className: "text-2xl font-extrabold text-white tracking-tight", children: "Obsidian Knowledge Graph View" })] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Visual force-directed map connecting Courses, Notes, Questions, and Code Snippets in SQLite." })] }), _jsxs("div", { className: "flex items-center gap-2 font-mono text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl font-bold", children: [_jsx(Share2, { className: "w-3.5 h-3.5" }), _jsxs("span", { children: [nodes.length, " Nodes \u2022 ", links.length, " Links"] })] })] }), error && (_jsxs("div", { className: "p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400", children: [_jsx(AlertCircle, { className: "w-5 h-5 shrink-0" }), _jsx("span", { children: error })] })), _jsxs("div", { className: "p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 text-xs font-medium", children: [_jsx("span", { className: "text-slate-400", children: "Filter Graph Nodes:" }), _jsx("div", { className: "flex flex-wrap gap-2", children: ['ALL', 'COURSE', 'NOTE', 'QUESTION', 'CODE'].map(type => (_jsx("button", { onClick: () => setFilterType(type), className: `px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${filterType === type
                                ? 'bg-purple-600 border-purple-500 text-white shadow-md font-bold'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`, children: type }, type))) })] }), loading ? (_jsx("div", { className: "p-12 text-center text-xs text-slate-500", children: "Building knowledge graph..." })) : nodes.length === 0 ? (_jsxs("div", { className: "p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3", children: [_jsx(Network, { className: "w-12 h-12 mx-auto text-slate-700" }), _jsx("h3", { className: "text-sm font-bold text-white", children: "Knowledge Graph Empty" }), _jsx("p", { className: "text-xs text-slate-400 max-w-sm mx-auto", children: "Add notes, courses, questions, or code snippets to generate visual connections in the Knowledge Graph." })] })) : (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 min-h-115 flex flex-col justify-between", children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-slate-400 font-mono", children: [_jsxs("span", { children: ["CANVAS NODES (", filteredNodes.length, ")"] }), _jsx("span", { children: "Click any node to inspect connections" })] }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 my-auto", children: filteredNodes.map(node => {
                                    const isSelected = selectedNode?.id === node.id;
                                    return (_jsxs("div", { onClick: () => setSelectedNode(node), className: `p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative text-left ${isSelected
                                            ? 'bg-purple-600/10 border-purple-500 shadow-xl'
                                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`, children: [_jsx("div", { className: "p-2 rounded-xl shrink-0", style: { backgroundColor: `${node.color}20`, color: node.color }, children: getNodeIcon(node.type) }), _jsxs("div", { className: "space-y-1 overflow-hidden", children: [_jsx("span", { className: "text-[9px] font-bold font-mono uppercase px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400", children: node.type }), _jsx("h4", { className: `text-xs font-bold truncate leading-snug ${isSelected ? 'text-purple-400' : 'text-white'}`, children: node.label })] })] }, node.id));
                                }) }), _jsxs("div", { className: "flex items-center justify-center gap-6 text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-blue-500" }), " Course"] }), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-emerald-500" }), " Note"] }), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-purple-500" }), " Question"] }), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-amber-500" }), " Code"] })] })] }), _jsx("div", { className: "p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6", children: selectedNode ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [_jsx("span", { className: "text-xs font-mono font-bold text-slate-400", children: "NODE INSPECTOR" }), _jsx("span", { className: "px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase border", style: { backgroundColor: `${selectedNode.color}20`, color: selectedNode.color, borderColor: `${selectedNode.color}40` }, children: selectedNode.type })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-base font-bold text-white", children: selectedNode.label }), _jsxs("p", { className: "text-xs text-slate-400 font-mono", children: ["ID: ", selectedNode.rawId] })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs", children: [_jsx("span", { className: "text-[10px] text-slate-500 font-mono block", children: "NODE CONNECTIONS" }), _jsxs("p", { className: "text-slate-300", children: ["This ", selectedNode.type.toLowerCase(), " node is mapped in your local SQLite knowledge graph."] })] })] }), _jsxs("button", { onClick: () => handleJumpToWorkspace(selectedNode), className: "w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all cursor-pointer flex items-center justify-center gap-2", children: [_jsxs("span", { children: ["Open in ", selectedNode.type, " Workspace"] }), _jsx(ArrowRight, { className: "w-4 h-4" })] })] })) : (_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-slate-500 text-xs text-center", children: [_jsx(Network, { className: "w-8 h-8 text-slate-700 mb-2" }), _jsx("p", { children: "Click any node on the graph canvas to inspect connections." })] })) })] }))] }));
}
