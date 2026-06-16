import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { Bot, Loader2, Sparkles, Mail, Lock, ArrowRight, BookOpen, CheckCircle2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "../components/Logo";
import TermsOfUseModal from "../components/TermsOfUseModal";
import SecrecyTermsModal from "../components/SecrecyTermsModal";

export default function Login() {
  const [email, setEmail] = useState("admin@vicai.com");
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [acceptedSecrecy, setAcceptedSecrecy] = useState(false);
  const [showSecrecyModal, setShowSecrecyModal] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("Você precisa ler e aceitar os Termos de Uso e Política de Privacidade para acessar a plataforma.");
      return;
    }
    if (!acceptedSecrecy) {
      setError("Você precisa ler e aceitar o Termo de Sigilo e Responsabilidade para acessar a plataforma.");
      return;
    }
    setError("");
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
                  <Bot className="w-5 h-5 text-white" />
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

              {/* Checkbox de Termos de Uso e LGPD */}
              <div className="bg-slate-50/70 p-4 border border-slate-100 rounded-2xl flex items-start gap-4 select-none">
                <input 
                  id="checkbox-terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (e.target.checked && error.includes("Termos de Uso")) {
                      setError("");
                    }
                  }}
                  className="w-5 h-5 mt-0.5 rounded-lg border-slate-200 text-brand-600 focus:ring-brand-500 accent-brand-600 cursor-pointer"
                />
                <div className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Declaro que li e concordo inteiramente com os{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-brand-650 hover:text-brand-700 font-bold hover:underline font-sans cursor-pointer bg-transparent inline-block p-0 outline-none text-left"
                  >
                    Termos de Uso e Diretrizes da LGPD da Vic IA
                  </button>.
                </div>
              </div>

              {/* Checkbox de Termo de Sigilo e Responsabilidade */}
              <div className="bg-[#2c7a7a]/5 p-4 border border-[#2c7a7a]/15 rounded-2xl flex items-start gap-4 select-none">
                <input 
                  id="checkbox-secrecy"
                  type="checkbox"
                  checked={acceptedSecrecy}
                  onChange={(e) => {
                    setAcceptedSecrecy(e.target.checked);
                    if (e.target.checked && error.includes("Termo de Sigilo")) {
                      setError("");
                    }
                  }}
                  className="w-5 h-5 mt-0.5 rounded-lg border-slate-200 text-[#2c7a7a] focus:ring-[#2c7a7a] accent-[#2c7a7a] cursor-pointer"
                />
                <div className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Declaro que li e aceito o{" "}
                  <button
                    type="button"
                    onClick={() => setShowSecrecyModal(true)}
                    className="text-[#2c7a7a] hover:text-[#214343] font-bold hover:underline font-sans cursor-pointer bg-transparent inline-block p-0 outline-none text-left"
                  >
                    Termo de Sigilo e Responsabilidade
                  </button>{" "}
                  do sistema, garantindo a confidencialidade absoluta no tratamento de dados sensíveis de todos os alunos cadastrados.
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
                    onClick={() => setEmail("admin@vicai.com")}
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

      {/* Reusable TermsOfUseModal overlay popup with smooth presentation */}
      <AnimatePresence>
        {showTermsModal && (
          <TermsOfUseModal
            isOpen={showTermsModal}
            onClose={() => setShowTermsModal(false)}
            onAgree={() => {
              setAcceptedTerms(true);
              if (error.includes("Termos de Uso") || error.includes("precisa ler")) {
                setError("");
              }
            }}
          />
        )}
        {showSecrecyModal && (
          <SecrecyTermsModal
            isOpen={showSecrecyModal}
            onClose={() => setShowSecrecyModal(false)}
            onAgree={() => {
              setAcceptedSecrecy(true);
              if (error.includes("Termo de Sigilo") || error.includes("precisa ler")) {
                setError("");
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

