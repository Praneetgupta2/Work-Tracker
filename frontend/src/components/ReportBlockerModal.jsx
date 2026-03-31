import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, MessageSquare, AlertTriangle } from 'lucide-react';

const ReportBlockerModal = ({ isOpen, onClose, task, onReport }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onReport(task.id, reason);
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
          className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-rose-500/10">
            <h3 className="text-xl font-bold text-rose-500 flex items-center space-x-2 italic">
              <AlertTriangle className="w-5 h-5" />
              <span>Flag Work Stoppage</span>
            </h3>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4 p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10">
              <div className="flex items-center space-x-3 text-rose-400 mb-2">
                <AlertCircle size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none italic">Core Issue</span>
              </div>
              <p className="text-sm font-bold text-white mb-1">{task.title}</p>
              <p className="text-xs text-rose-200/80 leading-relaxed font-medium">
                Marking this task as <span className="text-rose-400 font-bold italic">Blocked</span> will alert the admin and may impact downstream dependencies.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest italic flex items-center space-x-2">
                <MessageSquare size={14} className="text-slate-400" />
                <span>Describe the Blocker</span>
              </label>
              <textarea
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-rose-500/50 transition-all placeholder:text-slate-700 min-h-[120px] resize-none"
                placeholder="Explain why this task cannot continue (e.g., waiting for response on PR #42, missing environment variables...)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="pt-4 flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-slate-800 rounded-xl text-slate-400 font-semibold hover:bg-slate-800 transition-all uppercase tracking-widest leading-loose text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20 uppercase tracking-widest leading-loose text-xs"
              >
                Submit Blocker
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReportBlockerModal;
