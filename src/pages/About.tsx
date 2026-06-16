import { motion } from "motion/react";
import { 
  Target, 
  Users, 
  Cpu, 
  Heart, 
  ShieldCheck, 
  Globe,
  Sparkles,
  ChevronRight
} from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Cpu,
      title: "Tecnologia de Ponta",
      description: "IA avançada para análise preditiva e personalização pedagógica.",
      color: "brand"
    },
    {
      icon: Heart,
      title: "Olhar Humanizado",
      description: "Foco no bem-estar e no potencial único de cada estudante.",
      color: "rose"
    },
    {
      icon: Users,
      title: "Colaboração",
      description: "Conectando escola, família e terapeutas em um só lugar.",
      color: "blue"
    },
    {
      icon: ShieldCheck,
      title: "Segurança de Dados",
      description: "Proteção rigorosa das informações sensíveis dos alunos.",
      color: "emerald"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-full text-xs font-bold uppercase tracking-widest"
        >
          <Sparkles className="w-4 h-4" /> Nossa Propósito
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl heading text-slate-900"
        >
          Redefinindo a <span className="text-brand-600">Inclusão</span> <br />através da Inteligência.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
        >
          A Vic IA nasceu para apoiar educadores na jornada complexa e recompensadora de ensinar alunos com TEA e outras necessidades específicas.
        </motion.p>
      </section>

      {/* Spoken Text Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative p-12 bg-white rounded-[3rem] shadow-2xl shadow-brand-900/5 border border-brand-50 overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Cpu className="w-64 h-64 text-brand-600" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white">
            <Target className="w-8 h-8" />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl heading text-slate-900">Sobre a Vic IA</h2>
            <div className="space-y-4 text-lg text-slate-600 leading-relaxed font-medium">
              <p>
                Nós nascemos com uma missão clara: transformar a educação inclusiva por meio da união entre tecnologia de ponta e o olhar humano. 
                Nosso sistema de Prontuário Pedagógico Inteligente não é apenas uma ferramenta de registro; é uma ponte que conecta educadores, famílias e especialistas.
              </p>
              <p>
                Em um cenário onde a neurodiversidade exige atenção personalizada, a Vic IA atua como uma assistente estratégica, utilizando inteligência artificial para analisar relatórios, identificar padrões de desenvolvimento e sugerir planos de aula que respeitam o tempo e a individualidade de cada aluno.
              </p>
              <p>
                Acreditamos que cada progresso, por menor que pareça, é uma grande vitória que merece ser celebrada e documentada. 
                Vic IA: Tecnologia que entende, educação que inclui.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Values Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {values.map((value, idx) => (
          <motion.div
            key={value.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="p-8 bg-white rounded-[2rem] border border-slate-100 hover:border-brand-200 transition-all group"
          >
            <div className={`w-12 h-12 rounded-xl bg-${value.color}-50 flex items-center justify-center text-${value.color}-600 mb-6 group-hover:scale-110 transition-transform`}>
              <value.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{value.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{value.description}</p>
          </motion.div>
        ))}
      </section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-12 bg-slate-900 rounded-[3rem] text-center text-white"
      >
        <Globe className="w-12 h-12 text-brand-400 mx-auto mb-6" />
        <h2 className="text-3xl heading mb-4">Junte-se ao Futuro da Educação</h2>
        <p className="text-slate-400 mb-8 max-w-xl mx-auto">
          Estamos apenas começando nossa jornada para tornar o ensino inclusivo um padrão, não uma exceção.
        </p>
        <a 
          href="https://wa.me/5585921589258?text=Ol%C3%A1!%20Estou%20no%20sistema%20da%20Vic%20AI%20e%20gostaria%20de%20acessar%20a%20Central%20de%20Ajuda%20no%20WhatsApp."
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-500 hover:bg-brand-400 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-2 mx-auto transition-all shadow-xl shadow-brand-500/20 w-fit cursor-pointer"
        >
          Nossa Central de Ajuda <ChevronRight className="w-5 h-5" />
        </a>
      </motion.section>
    </div>
  );
}
