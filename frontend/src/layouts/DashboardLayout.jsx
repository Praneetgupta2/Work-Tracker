import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  GitBranch, 
  LogOut,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarLink = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group
      ${active 
        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
  >
    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? 'text-blue-400' : 'text-slate-500'}`} />
    <span className="font-medium">{label}</span>
  </Link>
);

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return <Navigate to="/login" />;

  const isAdmin = user.role === 'admin';

  const menuItems = isAdmin ? [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/tasks', icon: CheckSquare, label: 'Task Management' },
    { to: '/admin/users', icon: Users, label: 'Team Members' },
    { to: '/admin/dependencies', icon: GitBranch, label: 'Work Flow' },
    { to: '/member', icon: LayoutDashboard, label: 'Member Preview' },
  ] : [
    { to: '/member', icon: LayoutDashboard, label: 'My Dashboard' },
    { to: '/member/tasks', icon: CheckSquare, label: 'My Tasks' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">WPT</h1>
        <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 p-6 
        transition-transform duration-300 md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="mb-10 px-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              WorkTracker
            </h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold italic">Process Management</p>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <SidebarLink 
                key={item.to} 
                {...item} 
                active={location.pathname === item.to} 
              />
            ))}
          </nav>

          <div className="pt-6 border-t border-slate-800 mt-auto">
            <div className="flex items-center space-x-3 px-4 py-3 mb-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate text-white">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-colors group"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <header className="hidden md:flex h-20 items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md border-b border-slate-800/50 sticky top-0 z-40">
          <div className="flex items-center bg-slate-800/50 rounded-2xl px-4 py-2 border border-slate-700/50 group focus-within:border-blue-500/50 transition-all w-96">
            <Search className="w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search tasks, members, repositories..." 
              className="bg-transparent border-none outline-none text-sm ml-3 w-full placeholder:text-slate-600 text-slate-300"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors bg-slate-800/50 rounded-xl border border-slate-700/50">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-900" />
            </button>
            <div className="h-8 w-[1px] bg-slate-800 mx-2" />
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium">Workspace</p>
              <p className="text-sm font-bold text-white tracking-wide">Development Team</p>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
