import { useCallback, useState, useEffect } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { GitBranch, Info, AlertTriangle, Plus, Loader2, Target } from 'lucide-react';
import AddDependencyModal from '../components/AddDependencyModal';
import api from '../api/axios';

const DependencyFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rawTasks, setRawTasks] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, depsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/tasks/dependencies')
      ]);

      const tasks = tasksRes.data;
      const deps = depsRes.data;
      setRawTasks(tasks);

      // Create Nodes
      const newNodes = tasks.map((task, i) => ({
        id: task._id,
        data: { label: task.title },
        position: { x: 250, y: i * 100 }, // Basic auto-layout
        style: { 
          background: '#1e293b', 
          color: '#fff', 
          border: `1px solid ${task.status === 'blocked' ? '#f43f5e' : task.status === 'done' ? '#10b981' : '#3b82f6'}`, 
          borderRadius: '16px', 
          padding: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
          fontStyle: 'italic',
          width: 180,
          textAlign: 'center',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }
      }));

      // Create Edges
      const newEdges = deps.map(dep => ({
        id: `e${dep.predecessor._id}-${dep.successor._id}`,
        source: dep.predecessor._id,
        target: dep.successor._id,
        label: dep.type === 'partial' ? `Partial (${dep.threshold}%)` : 'Full',
        markerEnd: { type: MarkerType.ArrowClosed, color: dep.type === 'partial' ? '#a855f7' : '#3b82f6' },
        style: { stroke: dep.type === 'partial' ? '#a855f7' : '#3b82f6', strokeWidth: 2 }
      }));

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      console.error('Error fetching dependency data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onConnect = useCallback(async (params) => {
     // Optional: Add dependency via dragging link?
     // For now, let's stick to the modal for full control over type/threshold
  }, []);

  const handleAddDependency = async (dep) => {
    try {
      await api.post('/tasks/dependencies', {
        predecessor: dep.predecessor,
        successor: dep.successor,
        type: dep.type,
        threshold: parseInt(dep.threshold)
      });
      fetchData(); // Refresh full flow
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add dependency');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 font-inter">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Mapping Flow Dynamics...</p>
    </div>
  );

  return (
    <div className="space-y-6 h-[calc(100vh-160px)] flex flex-col font-inter">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center space-x-4 italic tracking-tight uppercase">
            <GitBranch className="text-blue-400 w-8 h-8" />
            <span>Operational Flow</span>
          </h2>
          <p className="text-slate-400 mt-1 text-xs font-bold uppercase tracking-widest italic leading-loose">Visualization of unit inter-dependencies and lock states</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex items-center space-x-6 backdrop-blur-sm shadow-xl">
           <div className="flex items-center space-x-2 text-[10px] font-bold uppercase italic tracking-widest">
             <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
             <span className="text-slate-400">Full</span>
           </div>
           <div className="flex items-center space-x-2 text-[10px] font-bold uppercase italic tracking-widest border-l border-slate-800 pl-6">
             <div className="w-2.5 h-2.5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
             <span className="text-slate-400">Partial</span>
           </div>
           <div className="h-8 w-px bg-slate-800 hidden md:block" />
           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-blue-600/20 font-bold text-[10px] uppercase tracking-widest italic group"
           >
             <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
             Add Link
           </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden relative group backdrop-blur-sm">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          className="bg-slate-950"
        >
          <Background color="#1e293b" gap={40} size={1} />
          <Controls className="bg-slate-800 border-slate-700 fill-white !p-1 !rounded-xl !bottom-4 !left-4" />
        </ReactFlow>
        
        <div className="absolute bottom-6 right-6 max-w-xs space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-5 rounded-3xl shadow-2xl relative group overflow-hidden"
          >
             <div className="absolute top-[-10px] right-[-10px] w-20 h-20 bg-blue-500/5 blur-[20px] rounded-full" />
            <div className="flex items-center space-x-3 text-blue-400 mb-3">
              <Target size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest italic leading-none">Operational Intel</span>
            </div>
            <p className="text-[10px] text-slate-400/90 leading-relaxed font-bold italic uppercase tracking-wider">
              Drag nodes to reorganize your sector overview. Links represent critical path dependencies.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-rose-500/10 backdrop-blur-xl border border-rose-500/20 p-5 rounded-3xl shadow-2xl"
          >
            <div className="flex items-center space-x-3 text-rose-500 mb-3">
              <AlertTriangle size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest italic leading-none">Integrity Protection</span>
            </div>
            <p className="text-[10px] text-rose-200/80 leading-relaxed font-bold italic uppercase tracking-wider">
              The neural link system automatically rejects circular logic to maintain operational integrity.
            </p>
          </motion.div>
        </div>
      </div>

      <AddDependencyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        tasks={rawTasks}
        onAdd={handleAddDependency}
      />
    </div>
  );
};

export default DependencyFlow;
