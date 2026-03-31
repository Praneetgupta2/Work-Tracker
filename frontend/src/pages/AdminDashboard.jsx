import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  BarChart3, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  MoreVertical,
  Activity,
  Layers,
  ArrowRight,
  Loader2
} from 'lucide-react';
import AddTaskModal from '../components/AddTaskModal';
import api from '../api/axios';

const AdminDashboard = () => {
  const [isAddTaskOpen, setAddTaskOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, membersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/tasks/members')
      ]);
      setTasks(tasksRes.data);
      setMembers(membersRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = [
    { label: 'Total Tasks', value: tasks.length.toString(), icon: Layers, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length.toString(), icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Blocked', value: tasks.filter(t => t.status === 'blocked').length.toString(), icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { label: 'Avg Progress', value: `${tasks.length ? Math.round(tasks.reduce((a, b) => a + b.progress, 0) / tasks.length) : 0}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  const handleAddTask = async (newTask) => {
    try {
      const response = await api.post('/tasks', {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        requiredSkills: newTask.skills,
        assignedMember: newTask.assigneeId, // Assuming modal is updated to return ID
        estimatedTime: parseInt(newTask.estimatedTime) || 0
      });
      setTasks([...tasks, response.data]);
      fetchData(); // Refresh to get populated member data
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Syncing Workspace...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12 font-inter">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white italic tracking-tight">Mission Board</h2>
          <p className="text-slate-400 mt-1 text-sm font-medium italic uppercase tracking-widest leading-loose">Operational Oversights & Task Tracking</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setAddTaskOpen(true)}
            className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/20 font-bold uppercase tracking-widest leading-none text-xs group"
          >
            <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
            Initialize Task
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-slate-900 border border-slate-800 rounded-3xl hover:border-slate-700 transition-colors group cursor-default shadow-xl relative overflow-hidden"
          >
             <div className="absolute top-[-10px] right-[-10px] w-20 h-20 bg-blue-500/5 blur-[20px] rounded-full group-hover:bg-blue-500/10 transition-all" />
            <div className={`p-3 w-fit rounded-2xl ${stat.bg} mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1 italic tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white italic flex items-center space-x-2">
               <Activity className="text-blue-400 w-5 h-5" />
               <span>Active Operational Units</span>
            </h3>
            <div className="flex space-x-2">
              <button className="p-2 text-slate-400 hover:text-white bg-slate-800 border border-slate-700 rounded-xl transition-colors">
                <Search size={18} />
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-800/40 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Asset Details</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic text-center">Unit Assigned</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic text-center">Priority</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic text-center">Flow Progress</th>
                  <th className="px-2 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          task.status === 'done' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                          task.status === 'blocked' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 
                          'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                        }`} />
                        <div>
                          <p className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors italic">{task.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                             <p className="text-[10px] text-slate-500 font-bold uppercase italic tracking-widest">ID: TASK-{task._id.slice(-4)}</p>
                             <span className="text-slate-700 font-bold">•</span>
                             <p className="text-[10px] text-blue-400/80 font-bold uppercase italic tracking-widest">{task.estimatedTime || 0}H EST.</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-[10px] font-bold border border-slate-700 text-blue-300 uppercase italic">
                          {task.assignedMember ? task.assignedMember.name.split(' ').map(n => n[0]).join('') : '--'}
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold mt-1 uppercase italic tracking-widest">{task.assignedMember ? task.assignedMember.name : 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-[2px] italic border
                        ${task.priority === 'critical' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                          task.priority === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                          'bg-slate-700/30 text-slate-400 border-slate-700'}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center space-y-2 min-w-[120px]">
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${task.progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full relative ${task.status === 'done' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}
                          >
                             <div className="absolute top-0 right-0 h-full w-4 bg-white/20 blur-sm" />
                          </motion.div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 italic tracking-widest">{task.progress}% COMPLETE</span>
                      </div>
                    </td>
                    <td className="pr-4 py-5 text-right">
                      {task.status === 'blocked' && (
                        <div className="group relative inline-block">
                           <AlertCircle className="text-rose-500 w-4 h-4 cursor-help" />
                           <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                              <p className="text-[10px] text-rose-200 font-bold italic leading-relaxed">{task.blockedReason || 'Reason not specified.'}</p>
                           </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottlenecks / Workload */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white italic flex items-center space-x-2">
             <BarChart3 className="text-purple-400 w-5 h-5" />
             <span>Team Status</span>
          </h3>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 overflow-hidden relative">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-purple-500/5 blur-[40px] rounded-full" />
            
            {members.map((member, i) => {
              const activeTasks = tasks.filter(t => t.assignedMember?._id === member._id && t.status !== 'done').length;
              const loadPercent = Math.min(activeTasks * 20, 100); // Simple load math
              return (
                <div key={member._id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-200 italic">{member.name}</span>
                      <span className="text-[10px] text-slate-500 font-bold px-2 py-0.5 bg-slate-800 rounded-full italic">{activeTasks} UNITS</span>
                    </div>
                    <span className={`text-[10px] font-bold tracking-[1px] ${loadPercent > 80 ? 'text-rose-400' : 'text-slate-400'}`}>{loadPercent}% CAPACITY</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${loadPercent}%` }}
                      className={`h-full ${loadPercent > 80 ? 'bg-rose-500' : loadPercent > 50 ? 'bg-blue-500' : 'bg-emerald-500'}`}
                    />
                  </div>
                </div>
              );
            })}
            
            <div className="pt-4 border-t border-slate-800 mt-2">
               <div className="p-4 bg-blue-600/5 rounded-2xl border border-blue-500/10 flex items-start space-x-3">
                  <Clock className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                  <p className="text-[10px] text-blue-200/80 leading-relaxed font-medium italic">
                    Capacity is calculated based on active operational units assigned to each personnel member.
                  </p>
               </div>
            </div>

            <button className="w-full flex items-center justify-center space-x-2 text-[10px] text-blue-400 font-bold py-2 hover:text-blue-300 transition-colors group uppercase tracking-widest leading-loose">
              <span>View All Personnel</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <AddTaskModal 
        isOpen={isAddTaskOpen} 
        onClose={() => setAddTaskOpen(false)} 
        onAdd={handleAddTask} 
        members={members}
      />
    </div>
  );
};

export default AdminDashboard;
