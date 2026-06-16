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
  Bot,
  History,
  Download,
  Filter,
  AlertCircle,
  MessageSquare,
  Info,
  Sparkles,
  TrendingUp,
  Menu,
  X,
  Database,
  ShieldAlert
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
import Backups from "./pages/Backups";
import Security from "./pages/Security";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import EvolutionReports from "./pages/EvolutionReports";
import PlansHistory from "./pages/PlansHistory";
import TermoSigilo from "./pages/TermoSigilo";

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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          if (parsed.type) {
            parsed.type = String(parsed.type).toUpperCase() as UserType;
          }
        }
        return parsed;
      }
      return null;
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
        const normalizedUser = {
          ...data.user,
          type: String(data.user.type || "PROFESSOR").toUpperCase() as UserType
        };
        setUser(normalizedUser);
        localStorage.setItem("educaflow_user", JSON.stringify(normalizedUser));
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

// --- Tooltip Component for informative popups ---
export const Tooltip = ({ 
  content, 
  children, 
  position = "right",
  className = ""
}: { 
  content: string; 
  children: React.ReactNode; 
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}) => {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2 origin-top",
    left: "right-full top-1/2 -translate-y-1/2 mr-2 origin-right",
    right: "left-full top-1/2 -translate-y-1/2 ml-2 origin-left"
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 -mt-1 border-t-slate-900/95",
    bottom: "bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-slate-900/95",
    left: "left-full top-1/2 -translate-y-1/2 -ml-1 border-l-slate-900/95",
    right: "right-full top-1/2 -translate-y-1/2 -mr-1 border-r-slate-900/95"
  };

  return (
    <div className={`relative group/tooltip flex items-center ${className}`}>
      {children}
      <div className={`absolute ${positionClasses[position]} hidden group-hover/tooltip:flex flex-col items-center z-50 pointer-events-none transition-all duration-200 scale-95 group-hover/tooltip:scale-100 opacity-0 group-hover/tooltip:opacity-100`}>
        <div className="bg-slate-900/95 backdrop-blur-xs text-white text-[11px] leading-relaxed font-semibold px-3 py-2 rounded-xl shadow-lg border border-slate-800 flex items-center gap-2 w-52 sm:w-60 text-left whitespace-normal">
          <Info className="w-3.5 h-3.5 text-brand-300 shrink-0" />
          <span>{content}</span>
        </div>
        <div className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}></div>
      </div>
    </div>
  );
};

const getMenuItemDescription = (label: string): string => {
  switch (label) {
    case "Dashboard":
      return "Painel principal com relatórios de alerta ativos, atalhos rápidos e resumo estatístico.";
    case "Evolução":
      return "Acompanhamento detalhado do crescimento das habilidades socioemocionais e acadêmicas.";
    case "Escolas":
      return "Espaço de gerenciamento e vinculação de salas de aula e dados das instituições.";
    case "Alunos":
      return "Fichas completas dos estudantes com históricos, CIDs e opções de geração inteligente.";
    case "Novo Professor":
      return "Credenciamento estruturado de professores e atribuição em turmas educacionais.";
    case "Usuários":
      return "Painel de controle de permissões de acesso e segurança de servidores pedagógicos.";
    case "Histórico Planos":
      return "Historial com todos os registros, planejamentos e estratégias sensoriais salvas.";
    case "Auditoria":
      return "Verificação de logs das atividades e auditoria completa de alterações em conformidade com a LGPD.";
    case "Backup Automático":
      return "Gerenciamento de redundância, congelamento instantâneo do sistema e downloads de segurança.";
    case "Dashboard de Segurança":
      return "Métricas em tempo real sobre integridade do sistema, tráfego e consumo de tokens da Vic IA.";
    case "Chat Vic IA":
      return "Nossa assistente dedicada de educação inclusiva especializada em TEA e TDAH.";
    case "Sobre a Vic":
      return "Mais informações sobre a metodologia, termos e diretrizes de inclusão pedagógica.";
    default:
      return "Acessar menu " + label;
  }
};

// --- Layout Components ---

const Sidebar = ({ onOpenFeedback, onCloseMobileMenu }: { onOpenFeedback: () => void; onCloseMobileMenu?: () => void }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.type === UserType.ADMIN;

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", roles: ["ADMIN", "COORDENADOR", "PROFESSOR", "SECRETARIA"] },
    { label: "Evolução", icon: TrendingUp, path: "/evolution", roles: ["ADMIN", "COORDENADOR", "PROFESSOR", "SECRETARIA"] },
    { label: "Escolas", icon: SchoolIcon, path: "/schools", roles: ["ADMIN", "COORDENADOR", "SECRETARIA"] },
    { label: "Alunos", icon: Baby, path: "/students", roles: ["ADMIN", "COORDENADOR", "PROFESSOR", "SECRETARIA"] },
    { label: "Novo Professor", icon: Plus, path: "/teachers/new", roles: ["ADMIN", "COORDENADOR", "SECRETARIA"] },
    { label: "Usuários", icon: Users, path: "/users", roles: ["ADMIN", "COORDENADOR", "SECRETARIA"] },
    { label: "Histórico Planos", icon: Bot, path: "/plans-history", roles: ["ADMIN", "COORDENADOR", "PROFESSOR", "SECRETARIA"] },
    { label: "Auditoria", icon: History, path: "/audit", roles: ["ADMIN", "COORDENADOR", "SECRETARIA"] },
    { label: "Backup Automático", icon: Database, path: "/backups", roles: ["ADMIN"] },
    { label: "Dashboard de Segurança", icon: ShieldAlert, path: "/security", roles: ["ADMIN"] },
    { label: "Chat Vic IA", icon: Bot, path: "/chat", roles: ["ADMIN", "COORDENADOR", "PROFESSOR", "SECRETARIA"] },
  ].filter(item => item.roles.includes(user?.type || ""));

  const formattedRole = user?.type === UserType.ADMIN 
    ? "Administrador" 
    : user?.type === UserType.COORDENADOR 
      ? "Coordenador" 
      : user?.type === UserType.SECRETARIA 
        ? "Secretaria" 
        : "Professor";

  return (
    <div className="w-64 bg-white border-r border-brand-100 flex flex-col h-screen sticky top-0 sidebar no-print">
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

      <nav className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <Tooltip key={item.path} content={getMenuItemDescription(item.label)} position="right" className="w-full">
            <Link
              to={item.path}
              onClick={onCloseMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-all group w-full text-left"
            >
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-brand-600" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          </Tooltip>
        ))}
        
        <Tooltip content="Envie ideias ou problemas de usabilidade para o nosso suporte técnico." position="right" className="w-full">
          <button
            onClick={() => {
              onOpenFeedback();
              onCloseMobileMenu?.();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-all group text-left cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-brand-600" />
            <span className="font-medium text-sm">Feedback</span>
          </button>
        </Tooltip>
      </nav>

      <div className="p-4 border-t border-brand-50">
        <div className="bg-brand-50 rounded-2xl p-4 mb-4">
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">{formattedRole}</p>
          <p className="text-sm font-bold text-slate-800 truncate">{user?.name || "Usuário"}</p>
        </div>
        <Tooltip content="Encerre sua sessão de forma segura seguindo as leis LGPD." position="right" className="w-full">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium text-left cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
            <span className="text-sm">Sair do Sistema</span>
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

const Header = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/admin/students")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStudents(data);
        }
      })
      .catch(err => console.error("Erro ao carregar alunos no Header:", err));
  }, []);

  const getRpiStatus = (student: Student) => {
    if (!student.lastRpiDate) {
      return { 
        status: "pending", 
        label: "RPI Pendente", 
        message: "Nenhum RPI gerado ainda", 
        color: "text-amber-700 bg-amber-50 border-amber-200", 
        daysLeft: null 
      };
    }

    const lastDate = new Date(student.lastRpiDate + "T00:00:00");
    const expiryDate = new Date(lastDate);
    expiryDate.setMonth(lastDate.getMonth() + 6); // 6 meses de vigência padrão

    const today = new Date();
    today.setHours(0,0,0,0);
    expiryDate.setHours(0,0,0,0);

    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        status: "expired", 
        label: "RPI Vencido", 
        message: `Vencido há ${Math.abs(diffDays)} dias`, 
        color: "text-rose-700 bg-rose-50 border-rose-200", 
        daysLeft: diffDays 
      };
    } else if (diffDays <= 30) {
      return { 
        status: "warning", 
        label: "Vence em Breve", 
        message: `Vence em ${diffDays} dias`, 
        color: "text-amber-700 bg-amber-50 border-amber-200", 
        daysLeft: diffDays 
      };
    }

    return null; // Regular / atualizado, sem alerta
  };

  const activeNotifications = students
    .map(student => ({ student, rpi: getRpiStatus(student) }))
    .filter(item => item.rpi !== null);

  const alertCount = activeNotifications.length;

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
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-brand-50 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10 gap-4 no-print">
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
        <div className="relative">
          <Tooltip content="Alertas de vigência e prazos de expiração dos Relatórios de Planejamento Individual (RPI)." position="bottom">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-all flex items-center justify-center cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {alertCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full border border-white flex items-center justify-center animate-pulse">
                  {alertCount}
                </span>
              )}
            </button>
          </Tooltip>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden z-50 text-left"
              >
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">Alertas de Relatórios RPI</span>
                  <span className="text-xs font-semibold text-brand-600 bg-brand-50/70 px-2.5 py-1 rounded-full">
                    {alertCount} pendentes
                  </span>
                </div>

                <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
                  {activeNotifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                       <p className="text-sm font-medium">Nenhum RPI vencido ou próximo ao vigência.</p>
                    </div>
                  ) : (
                    activeNotifications.map(({ student, rpi }) => {
                      if (!rpi) return null;
                      return (
                        <button
                          key={student.id}
                          onClick={() => {
                            navigate(`/students/${student.id}`);
                            setShowNotifications(false);
                          }}
                          className="w-full p-4 hover:bg-slate-50 transition-colors flex items-start gap-3 text-left cursor-pointer"
                        >
                          <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center border-2 border-white overflow-hidden shadow-sm flex-shrink-0">
                            {student.photoUrl ? (
                              <img src={student.photoUrl} alt={student.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
                                {student.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{student.name}</p>
                            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{student.grade}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rpi.color}`}>
                                {rpi.label}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold truncate leading-none">
                                {rpi.message}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
                {activeNotifications.length > 0 && (
                  <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold">Clique no aluno para gerar ou atualizar o RPI</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-tight">{user?.name || "Usuário"}</p>
            <p className="text-xs text-brand-600 font-medium">Bem-vindo de volta</p>
          </div>
          <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center border-2 border-white overflow-hidden shadow-sm flex-shrink-0">
            <div className="w-full h-full bg-brand-500 flex items-center justify-center text-white font-bold">
              {(user?.name || "U").charAt(0)}
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
          fixed inset-y-0 left-0 z-50 transform lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out no-print
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

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, errorInfo: any) { console.error(error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-brand-50 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 mb-2">Ops! Algo deu errado.</h1>
          <p className="text-slate-500 mb-4 max-w-md">O sistema encontrou um erro inesperado. Tente recarregar a página.</p>
          {this.state.error && (
            <div className="text-left bg-red-50 text-red-700 p-4 rounded-xl mb-6 max-w-lg overflow-auto border border-red-100 font-mono text-xs w-full">
              <strong className="block mb-1">Erro técnico:</strong>
              <div className="whitespace-pre-wrap">{this.state.error.message || String(this.state.error)}</div>
            </div>
          )}
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
            <Route path="/termo-de-sigilo" element={<TermoSigilo />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <MainLayout><Dashboard /></MainLayout>
              </PrivateRoute>
            } />
          <Route path="/schools" element={
            <PrivateRoute allowedRoles={["ADMIN", "COORDENADOR", "SECRETARIA"]}>
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
            <PrivateRoute allowedRoles={["ADMIN", "COORDENADOR", "SECRETARIA"]}>
              <MainLayout><UsersManagement /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/teachers/new" element={
            <PrivateRoute allowedRoles={["ADMIN", "COORDENADOR", "SECRETARIA"]}>
              <MainLayout><NewTeacher /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/users/new" element={
            <PrivateRoute allowedRoles={["ADMIN", "COORDENADOR", "SECRETARIA"]}>
              <MainLayout><NewTeacher /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/audit" element={
            <PrivateRoute allowedRoles={["ADMIN", "COORDENADOR", "SECRETARIA"]}>
              <MainLayout><Audit /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/backups" element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <MainLayout><Backups /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/security" element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <MainLayout><Security /></MainLayout>
            </PrivateRoute>
          } />
          <Route path="/about" element={<Navigate to="/#about" replace />} />
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
