import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  MoreVertical, 
  Search,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  Target
} from 'lucide-react';
import api from '../api/axios';

const AdminUsers = () => {
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState({
    username: '',
    password: 'password123', // Default for demo
    name: '',
    role: 'member',
    skills: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, tasksRes] = await Promise.all([
        api.get('/tasks/members'),
        api.get('/tasks')
      ]);
      setMembers(membersRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', {
        ...newMember,
        skills: newMember.skills.split(',').map(s => s.trim()).filter(s => s)
      });
      setIsAdding(false);
      setNewMember({ username: '', password: 'password123', name: '', role: 'member', skills: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to register');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Syncing Personnel Database...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12 font-inter">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white italic flex items-center space-x-3">
            <Users className="text-blue-400" />
            <span>Personnel Grid</span>
          </h2>
          <p className="text-slate-400 mt-1 text-sm font-medium italic uppercase tracking-widest leading-loose">Real-time capacity and asset allocation</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/20 font-bold uppercase tracking-widest leading-none text-xs group"
        >
          <UserPlus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
          Deploy Personnel
        </button>
      </div>

      {isAdding && (
         <motion.div 
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden group"
         >
            <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest italic mb-6">Initialize New Agent</h3>
            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <input 
                  required
                  placeholder="Full Name" 
                  className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white italic outline-none focus:border-blue-500/50 shadow-inner"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
               />
               <input 
                  required
                  placeholder="Username / Agent ID" 
                  className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white italic outline-none focus:border-blue-500/50 shadow-inner"
                  value={newMember.username}
                  onChange={(e) => setNewMember({...newMember, username: e.target.value})}
               />
               <input 
                  required
                  type="password"
                  placeholder="Access Password" 
                  className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white italic outline-none focus:border-blue-500/50 shadow-inner"
                  value={newMember.password}
                  onChange={(e) => setNewMember({...newMember, password: e.target.value})}
               />
               <input 
                  placeholder="Sector Skills (React, UI...)" 
                  className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white italic outline-none focus:border-blue-500/50 shadow-inner"
                  value={newMember.skills}
                  onChange={(e) => setNewMember({...newMember, skills: e.target.value})}
               />
            </form>
            <div className="mt-6 flex justify-end">
              <button type="submit" onClick={handleRegister} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl text-xs uppercase tracking-[2px] italic transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                Authorize & Deploy Agent
              </button>
            </div>
         </motion.div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/20">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 w-full md:w-96 focus-within:border-blue-500/50 transition-all">
            <Search className="w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Filter assets by unit name or skill sector..." 
              className="bg-transparent border-none outline-none text-xs ml-3 w-full text-slate-300 italic"
            />
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic bg-slate-800/40 px-4 py-2 rounded-xl">
             <Target size={12} className="text-blue-500" />
            <span>Operational Personnel:</span>
            <span className="text-white">{members.length}</span>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map((member, i) => {
               const activeTasks = tasks.filter(t => t.assignedMember?._id === member._id && t.status !== 'done').length;
               return (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-slate-800/10 border border-transparent hover:border-blue-500/30 rounded-3xl p-6 transition-all group relative overflow-hidden backdrop-blur-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.05)] border-slate-800/50"
                  style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(59,130,246,0.03) 0%, transparent 70%)' }}
                >
                  <div className="absolute top-0 right-0 p-4">
                    <button className="p-2 text-slate-600 hover:text-white transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-2xl uppercase italic group-hover:scale-105 transition-transform">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white flex items-center space-x-2 italic tracking-tight uppercase">
                         <span>{member.name}</span>
                         {member.role === 'admin' && <Shield size={14} className="text-purple-400" />}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic mt-1 italic">Agent ID: {member.username}</p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-2">
                    {(member.skills && member.skills.length > 0) ? member.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[9px] font-bold text-slate-500 uppercase tracking-widest italic border-slate-700/50 hover:text-blue-400 hover:border-blue-500/30 transition-all">
                        {skill}
                      </span>
                    )) : <span className="text-[9px] text-slate-600 uppercase font-bold italic tracking-widest">No sector training</span>}
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-800/50 flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                       <div className="space-y-1">
                          <p className="text-[9px] font-bold text-slate-500 uppercase italic tracking-widest">Active Units</p>
                          <p className="text-lg font-bold text-white italic">{activeTasks}</p>
                       </div>
                       <div className="text-right space-y-1">
                          <p className="text-[9px] font-bold text-slate-500 uppercase italic tracking-widest">Capability</p>
                          <div className="flex items-center space-x-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${activeTasks > 5 ? 'bg-rose-500' : 'bg-emerald-500'} shadow-[0_0_8px_rgba(16,185,129,0.3)]`} />
                            <span className={`text-[10px] font-bold uppercase italic tracking-widest ${activeTasks > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                               {activeTasks > 5 ? 'Overloaded' : 'Operational'}
                            </span>
                          </div>
                       </div>
                    </div>
                  </div>
                </motion.div>
               );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
