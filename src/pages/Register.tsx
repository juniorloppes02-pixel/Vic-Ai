import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Bot, 
  BookOpen,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "../components/Logo";
import TermsOfUseModal from "../components/TermsOfUseModal";

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas inseridas não coincidem.");
      return;
    }
    if (!acceptedTerms) {
      setError("Você precisa ler e aceitar os Termos de Uso e Política de Privacidade para criar uma conta.");
      return;
    }
    setError("");
    setIsLoading(true);
    // Simulação de cadastro
    setTimeout(() => {
      setIsLoading(false);
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col">
      {/* Brand Header */}
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
                Bem-vindo à Vic IA
              </motion.h2>
              <p className="text-brand-100 text-lg max-w-md font-light leading-relaxed">
                A plataforma inteligente desenhada para apoiar educadores e pais na jornada do desenvolvimento neurodivergente.
              </p>
            </div>

            <div className="relative z-10 mt-12 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">IA especializada em TEA</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">Planos de aula adaptados</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">Acompanhamento em tempo real</span>
              </div>
            </div>

            {/* Decorative Background Image Overlay */}
            <div className="absolute inset-0 z-0 opacity-20 mix-blend-overlay">
              <img 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80" 
                alt="Educação Inclusiva" 
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl heading text-slate-900 mb-2">Criar sua conta</h1>
              <p className="text-slate-500 text-sm font-medium">Preencha os dados abaixo para começar sua jornada.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full has-icon"
                    placeholder="Como prefere ser chamado?"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 ml-1">Email Institucional</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full has-icon"
                    placeholder="email@escola.gov.br"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 ml-1">Senha</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input 
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full has-icon"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 ml-1">Confirmar Senha</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <input 
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full has-icon"
                      placeholder="••••••••"
                    />
                  </div>
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
                    if (e.target.checked && (error.includes("Termos de Uso") || error.includes("precisa ler"))) {
                      setError("");
                    }
                  }}
                  className="w-5 h-5 mt-0.5 rounded-lg border-slate-250 text-brand-600 focus:ring-brand-500 accent-brand-600 cursor-pointer"
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

              {error && <p className="text-red-500 text-xs font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="primary w-full py-4 flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Cadastrar
                      <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-10 pt-8 border-t border-brand-50 text-center">
              <p className="text-slate-500 text-sm font-medium">
                Já tem conta? {" "}
                <Link to="/login" className="text-brand-600 font-bold hover:underline underline-offset-4 transition-all">
                  Faça login
                </Link>
              </p>
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
      </AnimatePresence>
    </div>
  );
}
