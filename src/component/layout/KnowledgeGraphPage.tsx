import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Network, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Code2, 
  ArrowRight, 
  AlertCircle,
  Share2
} from 'lucide-react';
import { ActiveTab } from './sidebar';

interface GraphNode {
  id: string;
  label: string;
  type: 'COURSE' | 'NOTE' | 'QUESTION' | 'CODE';
  color: string;
  size: number;
  rawId: string;
}

interface GraphLink {
  source: string;
  target: string;
  color: string;
}

interface KnowledgeGraphPageProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export default function KnowledgeGraphPage({ setActiveTab }: KnowledgeGraphPageProps) {
  const { token } = useAuth();
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Type Filters
  const [filterType, setFilterType] = useState<string>('ALL');

  // Fetch Graph Data
  const fetchGraphData = useCallback(async () => {
    if (!token) return;
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
      } else {
        setError(data.error || 'Failed to fetch graph data');
      }
    } catch {
      setError('Cannot connect to Express backend on http://192.168.10.180:4000');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  // Filter Nodes
  const filteredNodes = nodes.filter(n => filterType === 'ALL' || n.type === filterType);

  // Jump to Workspace Module Helper
  const handleJumpToWorkspace = (node: GraphNode) => {
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

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'COURSE': return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'NOTE': return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'QUESTION': return <HelpCircle className="w-4 h-4 text-purple-400" />;
      default: return <Code2 className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Obsidian Knowledge Graph View</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual force-directed map connecting Courses, Notes, Questions, and Code Snippets in SQLite.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl font-bold">
          <Share2 className="w-3.5 h-3.5" />
          <span>{nodes.length} Nodes • {links.length} Links</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Type Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 text-xs font-medium">
        <span className="text-slate-400">Filter Graph Nodes:</span>
        <div className="flex flex-wrap gap-2">
          {['ALL', 'COURSE', 'NOTE', 'QUESTION', 'CODE'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-purple-600 border-purple-500 text-white shadow-md font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* GRAPH CANVAS & INSPECTOR GRID */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Building knowledge graph...</div>
      ) : nodes.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <Network className="w-12 h-12 mx-auto text-slate-700" />
          <h3 className="text-sm font-bold text-white">Knowledge Graph Empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Add notes, courses, questions, or code snippets to generate visual connections in the Knowledge Graph.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Graph Node Grid (Left 2 Cols) */}
 <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 min-h-115 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>CANVAS NODES ({filteredNodes.length})</span>
              <span>Click any node to inspect connections</span>
            </div>

            {/* Nodes Visual Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-auto">
              {filteredNodes.map(node => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative text-left ${
                      isSelected
                        ? 'bg-purple-600/10 border-purple-500 shadow-xl'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div 
                      className="p-2 rounded-xl shrink-0"
                      style={{ backgroundColor: `${node.color}20`, color: node.color }}
                    >
                      {getNodeIcon(node.type)}
                    </div>

                    <div className="space-y-1 overflow-hidden">
                      <span className="text-[9px] font-bold font-mono uppercase px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {node.type}
                      </span>
                      <h4 className={`text-xs font-bold truncate leading-snug ${isSelected ? 'text-purple-400' : 'text-white'}`}>
                        {node.label}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Course</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Note</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Question</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Code</span>
            </div>
          </div>

          {/* Node Inspector Panel (Right 1 Col) */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6">
            {selectedNode ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono font-bold text-slate-400">NODE INSPECTOR</span>
                    <span 
                      className="px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase border"
                      style={{ backgroundColor: `${selectedNode.color}20`, color: selectedNode.color, borderColor: `${selectedNode.color}40` }}
                    >
                      {selectedNode.type}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white">{selectedNode.label}</h3>
                    <p className="text-xs text-slate-400 font-mono">ID: {selectedNode.rawId}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <span className="text-[10px] text-slate-500 font-mono block">NODE CONNECTIONS</span>
                    <p className="text-slate-300">
                      This {selectedNode.type.toLowerCase()} node is mapped in your local SQLite knowledge graph.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleJumpToWorkspace(selectedNode)}
                  className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Open in {selectedNode.type} Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs text-center">
                <Network className="w-8 h-8 text-slate-700 mb-2" />
                <p>Click any node on the graph canvas to inspect connections.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}