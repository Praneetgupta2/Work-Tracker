import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  ArrowUpRight,
  TrendingUp,
  Layout,
  GitBranch,
  Loader2,
  Calendar
} from 'lucide-react';
import { useState, useEffect } from 'react';
import ReportBlockerModal from '../components/ReportBlockerModal';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const LocalSlider = ({ initialValue, onUpdate }) => {
  const [localValue, setLocalValue] = useState(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  const handleChange = (e) => {
    setLocalValue(parseInt(e.target.value));
  };

  const handleFinish = () => {
    if (localValue !== initialValue) {
      onUpdate(localValue);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
           <div className={`w-1.5 h-1.5 rounded-full ${localValue === 100 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'} transition-all`} />
           <span className="text-[10px] text-slate-500 font-bold italic uppercase tracking-[2px]">Flow Alignment</span>
        </div>
        <div className="flex items-center space-x-2">
           <span className={`text-lg font-bold italic transition-all duration-300 ${localValue === 100 ? 'text-emerald-400' : 'text-white'}`}>
             {localValue}%
           </span>
           <span className="text-[10px] text-slate-700 font-bold uppercase tracking-widest italic">Syncing</span>
        </div>
      </div>
      <div className="relative group/slider pt-2">
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={localValue} 
          onChange={handleChange}
          onMouseUp={handleFinish}
          onTouchEnd={handleFinish}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-grab active:cursor-grabbing accent-blue-600 hover:accent-blue-400 transition-all shadow-inner"
          style={{
            backgroundImage: `linear-gradient(to right, ${localValue === 100 ? '#10b981' : '#3b82f6'} ${localValue}%, transparent ${localValue}%)`
          }}
        />
        <div className="absolute top-[-4px] left-0 h-[2px] bg-blue-500/30 blur-[2px] rounded-full" style={{ width: `${localValue}%` }} />
      </div>
    </div>
  );
};

const MemberDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskForBlock, setSelectedTaskForBlock] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      // If Admin, show all tasks for preview, else show only assigned tasks
      const myTasks = user.role === 'admin' 
        ? response.data 
        : response.data.filter(t => t.assignedMember?._id === user.id);
      setTasks(myTasks);
    } catch (error) {
      console.error('Error fetching member tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const updateProgress = async (id, newProgress) => {
    try {
      await api.put(`/tasks/${id}/progress`, { progress: newProgress });
      // Optimized: Just update the local state for better UX
      setTasks(tasks.map(t => t._id === id ? { ...t, progress: newProgress, status: newProgress === 100 ? 'done' : t.status } : t));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleReportBlocker = async (id, reason) => {
    try {
      // Logic for explicit "blocked" status will be handled by the backend
      // But for now we can update the status in the DB if the API supports it
      // Actually, my backend logic handles status automatically based on dependencies, 
      // but "manual" blocking can be implemented by adding a field or setting status.
      // Re-fetching is safer here to get the new status and reason.
      await api.put(`/tasks/${id}/progress`, { progress: tasks.find(t => t._id === id).progress, status: 'blocked', blockedReason: reason });
      fetchData();
    } catch (error) {
      console.error('Error reporting blocker:', error);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Syncing Asset List...</p>
    </div>
  );

  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const completedTasks = tasks.filter(t => t.status === 'done');
  const avgProgress = tasks.length ? Math.round(tasks.reduce((a, b) => a + b.progress, 0) / tasks.length) : 0;

  return (
    <div className="space-y-8 pb-12 font-inter">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white italic tracking-tight uppercase flex items-center space-x-3">
             <span>Active Deployment</span>
             {user.role === 'admin' && (
               <span className="text-[10px] bg-amber-500/20 text-amber-500 border border-amber-500/20 px-2 py-1 rounded-lg uppercase tracking-[2px] ml-4 ring-4 ring-amber-500/5 animate-pulse">
                 Preview Mode
               </span>
             )}
          </h2>
          <p className="text-slate-400 mt-1 text-sm font-medium italic uppercase tracking-widest leading-loose">Personnel Overview & Unit Management</p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 shadow-lg border-slate-700/50">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest italic">Node Status: Operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Tasks Column */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center space-x-3 italic">
            <Layout className="w-5 h-5 text-blue-400" />
            <span>Assigned Units</span>
            <span className="ml-2 text-xs font-bold px-3 py-1 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/20">{tasks.length}</span>
          </h3>

          <div className="space-y-6">
            {tasks.length > 0 ? tasks.map((task, i) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-8 rounded-3xl border transition-all duration-300 relative overflow-hidden group
                  ${task.status === 'blocked' ? 'bg-rose-500/5 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.05)]' : 
                    task.status === 'done' ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 
                    'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-2xl'}`}
              >
                 <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-blue-600/5 blur-[40px] rounded-full group-hover:bg-blue-600/10 transition-all" />
                
                <div className="flex items-start justify-between mb-8">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-[2px] italic border
                        ${task.priority === 'critical' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-blue-500/20 text-blue-400 border-blue-500/20'}`}>
                        {task.priority}
                      </span>
                      {task.status === 'blocked' && (
                        <span className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[9px] font-bold uppercase tracking-widest italic">
                          <AlertTriangle size={10} />
                          <span>Unit Blocked</span>
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors uppercase italic tracking-tight">{task.title}</h4>
                    <div className="flex items-center space-x-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest italic leading-none">
                      <div className="flex items-center space-x-1">
                        <Clock size={12} className="text-slate-600" />
                        <span>{task.estimatedTime || 0}H EST.</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={12} className="text-slate-600" />
                        <span>TASK-{task._id.slice(-4)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {task.status !== 'blocked' && task.status !== 'done' && (
                      <button 
                        onClick={() => setSelectedTaskForBlock(task)}
                        className="p-3 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-500/20"
                        title="Flag Work Stoppage"
                      >
                        <AlertTriangle size={20} />
                      </button>
                    )}
                    <button className="p-3 text-slate-600 hover:text-white hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-700">
                      <ArrowUpRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-800/50">
                   <LocalSlider 
                     initialValue={task.progress} 
                     onUpdate={(val) => updateProgress(task._id, val)} 
                   />
                </div>

                {task.status === 'blocked' && (
                  <div className="mt-8 p-5 bg-rose-500/10 rounded-2xl border border-rose-500/10 flex items-start space-x-4 shadow-sm italic">
                    <MessageSquare className="w-5 h-5 text-rose-500 mt-1 flex-shrink-0" />
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest leading-none">Impediment Detected</p>
                       <p className="text-sm font-medium text-rose-200/90 leading-relaxed italic">
                         {task.blockedReason || 'Personnel reported work stoppage without specific reason.'}
                       </p>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex items-center justify-between pt-8 border-t border-slate-800/50">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(u => (
                      <div key={u} className="w-8 h-8 rounded-xl border-2 border-slate-900 bg-slate-800 text-[10px] flex items-center justify-center text-slate-500 font-bold italic ring-2 ring-transparent group-hover:ring-blue-500/20 transition-all">
                        U{u}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-xl border-2 border-slate-900 bg-slate-950 text-[10px] flex items-center justify-center text-slate-600 font-bold italic">
                      +1
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {task.status === 'done' ? (
                       <div className="flex items-center space-x-2 text-emerald-400 font-bold text-[10px] uppercase tracking-widest italic">
                          <CheckCircle2 size={16} />
                          <span>Unit Complete</span>
                       </div>
                    ) : (
                       <div className="flex items-center space-x-2 text-slate-600 text-[10px] font-bold uppercase tracking-widest italic">
                          <Clock size={14} />
                          <span>Sync status: Active</span>
                       </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="p-20 text-center bg-slate-900/50 border border-slate-800 rounded-3xl border-dashed">
                 <Layout className="w-10 h-10 text-slate-700 mx-auto mb-4" />
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">No operational units assigned yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats / Summary Section */}
        <div className="space-y-8">
          <h3 className="text-xl font-bold text-white italic uppercase tracking-tight">Personnel Pulse</h3>
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-5 relative overflow-hidden">
               <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full" />
              <div className="p-4 w-fit rounded-2xl bg-emerald-500/10 mb-2 border border-emerald-500/20">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white italic">{avgProgress}%</p>
                <p className="text-[10px] text-slate-500 font-bold italic uppercase tracking-widest mt-1">Operational Efficiency</p>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${avgProgress}%` }}
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-blue-600/5 blur-[40px] rounded-full group-hover:bg-blue-600/10 transition-all" />
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest italic leading-loose">Deployment Target</p>
              <h4 className="text-xl font-bold text-white mt-1 italic uppercase tracking-tight">Sprint v1.4 Finalise</h4>
              <p className="text-xs text-slate-500 mt-4 leading-relaxed font-bold italic">
                Achieve 100% completion on all priority units by Saturday 18:00.
              </p>
            </div>
          </div>

          <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-8 space-y-4 relative overflow-hidden">
            <div className="absolute top-[-10px] right-[-10px] p-2">
               <GitBranch className="text-blue-500/20 w-12 h-12 rotate-12" />
            </div>
            <h4 className="text-xs font-bold text-blue-400 flex items-center space-x-2 italic tracking-widest">
              <CheckCircle2 size={16} />
              <span>UNBLOCKED ALERT</span>
            </h4>
            <p className="text-xs text-blue-200/90 leading-relaxed font-bold italic">
              New dependency unblocked: <span className="text-white underline decoration-blue-500/50">#TASK-9921</span> is now available for deployment.
            </p>
            <button className="text-[10px] font-bold text-blue-400 hover:text-blue-200 transition-colors uppercase tracking-widest leading-loose italic border-b border-blue-500/20 hover:border-blue-400 pt-2 w-fit">
              Initiate Deployment &rarr;
            </button>
          </div>
        </div>
      </div>
      
      {selectedTaskForBlock && (
        <ReportBlockerModal 
          isOpen={!!selectedTaskForBlock}
          onClose={() => setSelectedTaskForBlock(null)}
          task={selectedTaskForBlock}
          onReport={handleReportBlocker}
        />
      )}
    </div>
  );
};

export default MemberDashboard;
