import { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  School as SchoolIcon, 
  LayoutDashboard, 
  Baby, 
  FileText, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  Bell, 
  ChevronRight,
  BrainCircuit,
  History,
  Download,
  Filter,
  AlertCircle,
  MessageSquare,
  Info,
  Brain,
  Sparkles,
  TrendingUp,
  Menu,
  X
} from "lucide-react";
import { User, UserType, Student } from "./types";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Schools from "./pages/Schools";
import AllStudents from "./pages/AllStudents";
import StudentDetails from "./pages/StudentDetails";
import NewStudent from "./pages/NewStudent";
import NewTeacher from "./pages/NewTeacher";
import UsersManagement from "./pages/UsersManagement";
import Audit from "./pages/Audit";
import Register from "./pages/Register";
import Home from "./pages/Home";
import About from "./pages/About";
import Chat from "./pages/Chat";
import EvolutionReports from "./pages/EvolutionReports";
import PlansHistory from "./pages/PlansHistory";

import Logo from "./components/Logo";
import FeedbackModal from "./components/FeedbackModal";

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("educaflow_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem("educaflow_user");
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("educaflow_user", JSON.stringify(data.user));
      } else {
        throw new Error(data.error || "Erro ao fazer login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("educaflow_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Layout Components ---

const Sidebar = ({ onOpenFeedback, onCloseMobileMenu }: { onOpenFeedback: () => void; onCloseMobileMenu?: () => void }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.type === UserType.ADMIN;

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", roles: ["ADMIN", "PROFESSOR"] },
    { label: "Evolução", icon: TrendingUp, path: "/evolution", roles: ["ADMIN", "PROFESSOR"] },
    { label: "Escolas", icon: SchoolIcon, path: "/schools", roles: ["ADMIN"] },
    { label: "Alunos", icon: Baby, path: "/students", roles: ["ADMIN", "PROFESSOR"] },
    { label: "Novo Professor", icon: Plus, path: "/teachers/new", roles: ["ADMIN"] },
    { label: "Usuários", icon: Users, path: "/users", roles: ["ADMIN"] },
    { label: "Histórico Planos", icon: Brain, path: "/plans-history", roles: ["ADMIN", "PROFESSOR"] },
    { label: "Auditoria", icon: History, path: "/audit", roles: ["ADMIN"] },
    { label: "Chat Vic IA", icon: Brain, path: "/chat", roles: ["ADMIN", "PROFESSOR"] },
    { label: "Sobre a Vic", icon: Info, path: "/about", roles: ["ADMIN", "PROFESSOR"] },
  ].filter(item => item.roles.includes(user?.type || ""));

  return (
    <div className="w-64 bg-white border-r border-brand-100 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center justify-between">
        <Logo className="scale-90 origin-left" />
        {onCloseMobileMenu && (
          <button 
            type="button"
            onClick={onCloseMobileMenu}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onCloseMobileMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-all group"
          >
            <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
        
        <button
          onClick={() => {
            onOpenFeedback();
            onCloseMobileMenu?.();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-all group"
        >
          <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Feedback</span>
        </button>
      </nav>

      <div className="p-4 border-t border-brand-50">
        <div className="bg-brand-50 rounded-2xl p-4 mb-4">
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">{user?.type}</p>
          <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sair do Sistema
        </button>
      </div>
    </div>
  );
};

const Header = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchValue.trim()) {
      try {
        const res = await fetch("/api/admin/students");
        const students: Student[] = await res.json();
        
        const found = students.find(s => 
          s.name.toLowerCase().includes(searchValue.toLowerCase()) || 
          s.code.toLowerCase() === searchValue.toLowerCase()
        );

        if (found) {
          navigate(`/students/${found.id}`);
          setSearchValue("");
        } else {
          alert(`Nenhum aluno encontrado com "${searchValue}"`);
        }
      } catch (error) {
        console.error("Erro na busca:", error);
      }
    }
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-brand-50 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10 gap-4">
      <div className="flex items-center gap-3 flex-1 lg:flex-initial">
        {onMenuClick && (
          <button 
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors flex-shrink-0"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-brand-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar alunos..." 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full has-icon pl-12 pr-4 py-2.5 bg-slate-50 border border-brand-100 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-500/5 rounded-xl hover:bg-slate-100 placeholder:text-slate-400 transition-all outline-none text-sm font-medium shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-xs text-brand-600 font-medium">Bem-vindo de volta</p>
          </div>
          <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center border-2 border-white overflow-hidden shadow-sm flex-shrink-0">
            <div className="w-full h-full bg-brand-500 flex items-center justify-center text-white font-bold">
              {user?.name.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const PrivateRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-brand-50 gap-4">
      <Logo iconOnly className="animate-bounce" />
      <span className="font-display font-bold text-brand-600 animate-pulse uppercase tracking-[0.2em] text-[10px]">Carregando...</span>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.type)) {
    return <Navigate to="/dashboard" />;
  }
  return <>{children}</>;
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex bg-brand-50 min-h-screen relative overflow-x-hidden">
      {/* Sidebar - off-canvas on mobile, static on desktop */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 transform lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <Sidebar 
          onOpenFeedback={() => {
            setIsFeedbackOpen(true);
            setIsMobileMenuOpen(false);
          }} 
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />
      </div>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </div>
  );
};

// --- Error Boundary ---
import React from 'react';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) { console.error(error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-brand-50 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 mb-2">Ops! Algo deu errado.</h1>
          <p className="text-slate-500 mb-8 max-w-md">O sistema encontrou um erro inesperado. Tente recarregar a página.</p>
          <button onClick={() => window.location.reload()} className="primary">Recarregar Vic AI</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <MainLayout><Dashboard /></MainLayout>
              </PrivateRoute>
            } />
          <Route path="/schools" element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <MainLayout><Schools /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/students" element={
            <PrivateRoute>
              <MainLayout><AllStudents /></MainLayout>
              </PrivateRoute>
          } />
          <Route path="/students/new" element={
            <PrivateRoute>
              <MainLayout><NewStudent /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/students/:id" element={
            <PrivateRoute>
              <MainLayout><StudentDetails /></MainLayout>
              </PrivateRoute>
          } />
          <Route path="/users" element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <MainLayout><UsersManagement /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/teachers/new" element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <MainLayout><NewTeacher /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/users/new" element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <MainLayout><NewTeacher /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/audit" element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <MainLayout><Audit /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/about" element={
            <PrivateRoute>
              <MainLayout><About /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/chat" element={
            <PrivateRoute>
              <MainLayout><Chat /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/evolution" element={
            <PrivateRoute>
              <MainLayout><EvolutionReports /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/plans-history" element={
            <PrivateRoute>
              <MainLayout><PlansHistory /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
  );
}
