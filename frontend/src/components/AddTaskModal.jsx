import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, UserPlus, Tag, Clock } from 'lucide-react';

const AddTaskModal = ({ isOpen, onClose, onAdd, members }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assigneeId: '',
    skills: '',
    estimatedTime: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
    });
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      assigneeId: '',
      skills: '',
      estimatedTime: ''
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden font-inter"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-800/40">
            <h3 className="text-xl font-bold text-white flex items-center space-x-3 italic">
              <UserPlus className="text-blue-400 w-5 h-5" />
              <span>Initialize Operational Unit</span>
            </h3>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Unit Identifier (Title)</label>
              <input
                required
                type="text"
                placeholder="e.g. Design System Implementation"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700 italic"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Objective (Description)</label>
              <textarea
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700 min-h-[80px] resize-none italic"
                placeholder="Describe the operational target..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Operational Priority</label>
                <select
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer italic shadow-sm"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic flex items-center space-x-1">
                   <Clock size={10} />
                   <span>Effort Est. (Hrs)</span>
                </label>
                <input
                  type="number"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700 italic"
                  placeholder="e.g. 12"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Personnel Assignment</label>
              <select
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer italic"
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
              >
                <option value="">Awaiting Personnel Deployment</option>
                {members.map(member => (
                  <option key={member._id} value={member._id}>{member.name} ({member.username})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic flex items-center space-x-2">
                <Tag size={12} className="text-blue-400" />
                <span>Sector Tags (comma separated)</span>
              </label>
              <input
                type="text"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700 italic"
                placeholder="React, CSS, Node.js"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>

            <div className="pt-4 flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 border border-slate-800 rounded-2xl text-slate-500 font-bold hover:bg-slate-800 transition-all uppercase tracking-widest leading-loose text-[10px] italic"
              >
                Abort
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 uppercase tracking-widest leading-loose text-[10px] italic"
              >
                Confirm Link
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddTaskModal;
