import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { BrainCircuit, Loader2, Sparkles, Mail, Lock, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import Logo from "../components/Logo";

export default function Login() {
  const [email, setEmail] = useState("admin@educaflow.com");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col">
      <header className="w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-start">
        <Logo />
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-[2rem] shadow-2xl bg-white border border-brand-100">
          
          {/* Branding/Image Section */}
          <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#2c7a7a] to-[#214343] text-white relative overflow-hidden">
            <div className="relative z-10">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl heading leading-tight mb-4 text-white"
              >
                Inteligência e Empatia na Educação
              </motion.h2>
              <p className="text-brand-100 text-lg max-w-md font-light leading-relaxed">
                Acesse a Vic IA para planejar aulas personalizadas e acompanhar o progresso de seus alunos neurodivergentes.
              </p>
            </div>

            <div className="relative z-10 mt-12 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">Relatórios Gerados por IA</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">Planos de Aula Adaptativos</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">Gestão Administrativa Completa</span>
              </div>
            </div>

            <div className="absolute inset-0 z-0 opacity-20 mix-blend-overlay">
              <img 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80" 
                alt="Educação Especial" 
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl heading text-slate-900 mb-2">Acessar Plataforma</h1>
              <p className="text-slate-500 text-sm font-medium">Bem-vindo de volta! Entre com suas credenciais.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 ml-1">Email Institucional</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="professor@escola.gov.br"
                    className="w-full has-icon"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

              <button 
                type="submit" 
                disabled={isLoading}
                className="primary w-full py-4 flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Entrar Agora
                    <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-brand-50">
              <div className="text-center lg:text-left mb-6">
                <p className="text-slate-500 text-sm font-medium">
                  Não tem conta? {" "}
                  <Link to="/register" className="text-brand-600 font-bold hover:underline underline-offset-4 transition-all">
                    Criar conta gratuita
                  </Link>
                </p>
              </div>

              <div className="bg-brand-50/50 p-4 rounded-2xl border border-brand-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3 text-center">Acesso Rápido (Demo)</p>
                <div className="flex gap-2 justify-center">
                  <button 
                    type="button"
                    onClick={() => setEmail("admin@educaflow.com")}
                    className="text-[10px] bg-white border border-brand-200 px-3 py-2 rounded-xl hover:bg-brand-50 transition-all font-bold text-brand-700 shadow-sm"
                  >
                    ADMIN
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEmail("professor@escola.com")}
                    className="text-[10px] bg-white border border-brand-200 px-3 py-2 rounded-xl hover:bg-brand-50 transition-all font-bold text-brand-700 shadow-sm"
                  >
                    PROFESSOR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 px-6 text-center">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
          © 2026 Vic AI - O Elo Gentil na Educação
        </p>
      </footer>
    </div>
  );
}

