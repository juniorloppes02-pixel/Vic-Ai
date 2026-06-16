import { 
  ArrowRight, 
  Bot, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Menu,
  MessageCircle,
  Target,
  Cpu,
  Heart,
  ShieldCheck,
  Globe,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import Logo from "../components/Logo";

export default function Home() {
  useEffect(() => {
    const handleScrollToHash = () => {
      const hash = window.location.hash;
      if (hash === "#about") {
        const element = document.getElementById("about");
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      } else if (hash === "#features") {
        const element = document.getElementById("features");
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      }
    };

    handleScrollToHash();

    window.addEventListener("hashchange", handleScrollToHash);
    return () => window.removeEventListener("hashchange", handleScrollToHash);
  }, []);

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
                <Bot className="w-12 h-12 text-brand-600 mb-8 transform group-hover:scale-110 transition-transform duration-300" />
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

            {/* Custom WhatsApp Contact Section styled after reference */}
            <div className="mt-20 flex flex-col items-center justify-center text-center space-y-6 pt-12 border-t border-brand-100/50">
              <div className="max-w-xl mx-auto">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-4 py-2 rounded-full border border-brand-100">
                  Dúvidas ou Suporte?
                </span>
                <h3 className="text-3xl sm:text-4xl heading text-slate-900 mt-4 mb-3">
                  Fale com a equipe da Vic AI
                </h3>
                <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed mb-8">
                  Nós ajudamos você a impulsionar o aprendizado especializado e a tirar o máximo proveito do sistema.
                </p>
                <div className="flex justify-center">
                  <a 
                    href="https://wa.me/5585921589258?text=Ol%C3%A1!%20Estou%20no%20site%20da%20Vic%20AI%20e%20gostaria%20de%20falar%20com%20um%20atendente."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-brand-600 text-white font-bold rounded-full py-4.5 px-9 inline-flex items-center gap-3.5 shadow-lg shadow-brand-600/20 hover:bg-brand-700 active:scale-95 transition-all text-base sm:text-lg border border-brand-700/10 cursor-pointer"
                  >
                    <MessageCircle className="w-6 h-6 fill-white text-white shrink-0" />
                    <span>Fale Conosco no WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* About Section */}
        <section id="about" className="bg-brand-50 py-32 border-b border-brand-100">
          <div className="max-w-7xl mx-auto px-6 space-y-20">
            {/* Header */}
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-800 rounded-full text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-brand-600 animate-pulse" /> Nosso Propósito
              </div>
              <h2 className="text-5xl md:text-6xl heading tracking-tight text-slate-900 leading-tight">
                Redefinindo a <span className="text-brand-600">Inclusão</span> <br />através da Inteligência.
              </h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                A Vic IA nasceu para apoiar educadores na jornada complexa e recompensadora de ensinar alunos com TEA e outras necessidades específicas.
              </p>
            </div>

            {/* Inner Content Block */}
            <div className="relative p-8 md:p-16 bg-white rounded-[3rem] shadow-xl shadow-brand-900/5 border border-brand-50 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Cpu className="w-64 h-64 text-brand-600" />
              </div>
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
                  <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
                    <Target className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl heading text-slate-900 font-bold">Sobre a Vic IA</h3>
                  <p className="text-slate-400 font-bold font-mono uppercase tracking-[0.2em] text-xs">O Elo Gentil na Educação</p>
                </div>

                <div className="lg:col-span-8 space-y-6 text-slate-600 font-medium leading-relaxed">
                  <p>
                    Nós nascemos com uma missão clara: transformar a educação inclusiva por meio da união entre tecnologia de ponta e o olhar humano. 
                    Nosso sistema de Prontuário Pedagógico Inteligente não é apenas uma ferramenta de registro; é uma ponte que conecta educadores, famílias e especialistas.
                  </p>
                  <p>
                    Em um cenário onde a neurodiversidade exige atenção personalizada, a Vic IA atua como uma assistente estratégica, utilizando inteligência artificial para analisar relatórios, identificar padrões de desenvolvimento e sugerir planos de aula que respeitam o tempo e a individualidade de cada aluno.
                  </p>
                  <p>
                    Acreditamos que cada progresso, por menor que pareça, é uma grande vitória que merece ser celebrada and documentada. 
                    <strong> Vic IA: Tecnologia que entende, educação que inclui.</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Core Values */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Card 1 */}
              <div className="p-8 bg-white rounded-3xl border border-slate-100 hover:border-brand-200 hover:shadow-lg transition-all group duration-300">
                <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Tecnologia de Ponta</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-semibold">IA avançada para análise preditiva e personalização pedagógica de alta fidelidade.</p>
              </div>

              {/* Card 2 */}
              <div className="p-8 bg-white rounded-3xl border border-slate-100 hover:border-rose-200 hover:shadow-lg transition-all group duration-300">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  <Heart className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Olhar Humanizado</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-semibold">Foco centrado no bem-estar integral e no potencial inato de cada estudante.</p>
              </div>

              {/* Card 3 */}
              <div className="p-8 bg-white rounded-3xl border border-slate-100 hover:border-sky-200 hover:shadow-lg transition-all group duration-300">
                <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Colaboração</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-semibold">Tecendo laços fortes e conectando a escola, a família e terapeutas em tempo real.</p>
              </div>

              {/* Card 4 */}
              <div className="p-8 bg-white rounded-3xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all group duration-300">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Segurança de Dados</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-semibold">Proteção de nível institucional em total consonância com as normas da LGPD.</p>
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

      {/* Floating WhatsApp Button matching second attached image */}
      <motion.a
        href="https://wa.me/5585921589258?text=Ol%C3%A1!%20Conheci%20o%20sistema%20Vic%20AI%20e%20gostaria%20de%20falar%20com%20um%20atendente%20no%20suporte."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl shadow-emerald-500/30 transition-all border border-white/20 hover:scale-110 active:scale-95 group cursor-pointer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <span className="absolute -top-10 right-0 bg-slate-900 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-md">
          WhatsApp Suporte
        </span>
        <MessageCircle className="w-7 h-7 fill-white text-white translate-y-[0.5px]" />
      </motion.a>
    </div>
  );
}
