import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitBranch, AlertCircle, Info, Layers } from 'lucide-react';

const AddDependencyModal = ({ isOpen, onClose, tasks, onAdd }) => {
  const [formData, setFormData] = useState({
    predecessor: '',
    successor: '',
    type: 'full',
    threshold: 50
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.predecessor || !formData.successor) return;
    onAdd(formData);
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
              <GitBranch className="text-purple-400 w-5 h-5" />
              <span>Link Operational Chains</span>
            </h3>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4 p-5 bg-purple-500/5 rounded-2xl border border-purple-500/10 shadow-inner">
              <div className="flex items-center space-x-3 text-purple-400 mb-2">
                <Info size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest italic leading-none">Contextual Directive</span>
              </div>
              <p className="text-[10px] text-purple-200/80 leading-relaxed font-bold italic uppercase tracking-[1px]">
                Establish a link where the <span className="text-white font-black">Successor</span> unit is locked until the <span className="text-white font-black">Predecessor</span> achieves its defined threshold.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic flex items-center space-x-2">
                <Layers size={14} className="text-blue-400" />
                <span>Predecessor Node</span>
              </label>
              <select
                required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer italic"
                value={formData.predecessor}
                onChange={(e) => setFormData({ ...formData, predecessor: e.target.value })}
              >
                <option value="">Awaiting Node Selection</option>
                {tasks.map(t => (
                  <option key={t._id} value={t._id}>{t.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic flex items-center space-x-2">
                <GitBranch size={14} className="text-purple-400" />
                <span>Successor Node</span>
              </label>
              <select
                required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer italic"
                value={formData.successor}
                onChange={(e) => setFormData({ ...formData, successor: e.target.value })}
              >
                <option value="">Awaiting Node Selection</option>
                {tasks.filter(t => t._id != formData.predecessor).map(t => (
                  <option key={t._id} value={t._id}>{t.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Link Type</label>
                <select
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer italic shadow-sm"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="full">Full (100% completion)</option>
                  <option value="partial">Partial (Threshold based)</option>
                </select>
              </div>
              
              <div className={`space-y-2 transition-all duration-300 ${formData.type === 'partial' ? 'opacity-100 scale-100' : 'opacity-30 scale-95 pointer-events-none'}`}>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Threshold (%)</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-700 italic"
                  placeholder="50"
                  value={formData.threshold}
                  onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                />
              </div>
            </div>

            {formData.predecessor === formData.successor && formData.predecessor !== '' && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-2 text-rose-400">
                <AlertCircle size={14} />
                <span className="text-[9px] font-bold uppercase tracking-[2px] leading-loose italic">Self-dependency is forbidden</span>
              </div>
            )}

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
                disabled={!formData.predecessor || !formData.successor || (formData.predecessor === formData.successor)}
                className="flex-1 px-6 py-4 bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20 uppercase tracking-widest leading-loose text-[10px] italic"
              >
                Establish Link
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddDependencyModal;
