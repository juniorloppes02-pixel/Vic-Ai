import { 
  ArrowRight, 
  BrainCircuit, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Menu
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import Logo from "../components/Logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-50 selection:bg-brand-100 selection:text-brand-900">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-white/70 backdrop-blur-md border-b border-brand-100/50">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <Logo />

          <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <a href="#features" className="hover:text-brand-600 transition-colors">Recursos</a>
            <a href="#about" className="hover:text-brand-600 transition-colors">Sobre</a>
            <Link to="/login" className="text-brand-600 font-bold hover:underline underline-offset-4">Entrar</Link>
          </div>

          <button className="md:hidden text-slate-900">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-6xl md:text-7xl heading leading-tight text-slate-900 tracking-tighter mb-8">
                Vic AI: <span className="text-brand-600">Desperta o Potencial</span> de Cada Aluno
              </h1>
              <p className="text-xl text-slate-500 leading-relaxed mb-10 max-w-2xl font-medium">
                Sistema Vic IA focado em auxiliar pais e educadores no planejamento de aulas para crianças com TEA. Uma abordagem gentil, estruturada e baseada em dados.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="primary px-10 py-5 text-lg flex items-center justify-center gap-2 group">
                  Começar Agora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="secondary px-10 py-5 text-lg flex items-center justify-center">
                  Ver Demonstração
                </Link>
              </div>
              
              <div className="mt-12 flex items-center gap-6 text-slate-400">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <img 
                      key={i}
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                      alt="User"
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold tracking-wide">+2.000 educadores já utilizam a Vic IA</span>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white"
            >
              <img 
                src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80" 
                alt="Child learning" 
                className="w-full aspect-[4/5] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <p className="text-white font-medium italic text-lg mb-2">"A Vic transformou a forma como preparo minhas aulas."</p>
                <p className="text-white/80 text-sm font-bold uppercase tracking-widest">— Profª. Carla Mendes</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="bg-white py-32 border-y border-brand-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-20 text-center max-w-3xl mx-auto">
              <h2 className="text-brand-600 font-bold tracking-[0.2em] uppercase text-sm mb-4">A Ciência do Cuidado</h2>
              <p className="text-4xl md:text-5xl heading text-slate-900">Recursos desenvolvidos para simplificar o extraordinário.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 bg-brand-50 p-12 rounded-[2rem] border border-brand-100 hover:border-brand-200 transition-all group">
                <BrainCircuit className="w-12 h-12 text-brand-600 mb-8 transform group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl heading text-slate-900 mb-4">Gerador de Planos de Aula IA</h3>
                <p className="text-slate-600 leading-relaxed text-lg font-medium">
                  Crie roteiros pedagógicos personalizados em segundos. Nossa IA entende as necessidades sensoriais e cognitivas específicas de cada aluno através do sistema Vic IA.
                </p>
                <div className="mt-10 flex items-center gap-2 text-brand-600 font-bold cursor-pointer">
                  Explorar ferramenta <ArrowRight className="w-5 h-5" />
                </div>
              </div>

              <div className="md:col-span-4 bg-brand-600 p-12 rounded-[2rem] text-white shadow-xl shadow-brand-600/20 flex flex-col justify-between">
                <div>
                  <Users className="w-12 h-12 mb-8 text-brand-100" />
                  <h3 className="text-2xl heading text-white mb-4">Gestão de Alunos</h3>
                  <p className="text-brand-100 font-medium leading-relaxed">
                    Centralize o histórico de evolução, laudos e preferências em um ambiente seguro e organizado para toda a rede escolar.
                  </p>
                </div>
                <div className="mt-8 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/70">Status Rede</span>
                  <p className="text-xl font-bold mt-1">Conectado</p>
                </div>
              </div>

              <div className="md:col-span-4 bg-brand-50 p-12 rounded-[2rem] border border-brand-100">
                <MessageSquare className="w-10 h-10 text-brand-600 mb-6" />
                <h3 className="text-xl heading text-slate-900 mb-4">Chat Integrado</h3>
                <p className="text-slate-600 font-medium">
                  Comunicação fluida entre pais e escola para um acompanhamento 360º do desenvolvimento do aluno.
                </p>
              </div>

              <div className="md:col-span-8 bg-slate-900 p-12 rounded-[2rem] text-white relative overflow-hidden group">
                <div className="relative z-10 md:w-1/2">
                  <BarChart3 className="w-12 h-12 text-brand-400 mb-8" />
                  <h3 className="text-2xl heading text-white mb-4">Relatórios Visuais</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">
                    Acompanhe o progresso através de gráficos intuitivos que facilitam a tomada de decisão pedagógica e o ajuste de objetivos.
                  </p>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-brand-600/20 to-transparent flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border-8 border-brand-600/30 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-8 border-brand-600 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-6xl mx-auto px-6 py-28 text-center">
          <div className="bg-brand-600 p-16 md:p-24 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -mr-32 -mt-32 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-900/10 -ml-32 -mb-32 rounded-full blur-3xl" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <h2 className="text-4xl md:text-6xl heading text-white mb-10 tracking-tight">Pronto para transformar o ensino?</h2>
              <p className="text-xl text-brand-100 mb-12 max-w-2xl mx-auto font-medium">
                Junte-se a milhares de profissionais que estão mudando vidas através da tecnologia e empatia.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link to="/register" className="bg-white text-brand-600 px-12 py-5 rounded-2xl font-bold text-xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                  Criar Conta Gratuita
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-brand-100 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="mb-8">
              <Logo />
            </div>
            <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
              O Elo Gentil na Educação. Especialistas em ferramentas digitais para educação inclusiva e suporte ao autismo.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-brand-900 mb-6 uppercase tracking-widest text-xs">Links Úteis</h4>
            <ul className="space-y-4 text-slate-500 font-medium">
              <li><a href="#" className="hover:text-brand-600 transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Funcionalidades</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Contatos</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-brand-900 mb-6 uppercase tracking-widest text-xs">Suporte</h4>
            <ul className="space-y-4 text-slate-500 font-medium">
              <li><a href="#" className="hover:text-brand-600 transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">FAQ</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-brand-100 text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            © 2026 Vic AI - O Elo Gentil na Educação. Desenvolvido com amor e IA.
          </p>
        </div>
      </footer>
    </div>
  );
}
