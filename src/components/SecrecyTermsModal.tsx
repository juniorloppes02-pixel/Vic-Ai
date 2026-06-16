import { ShieldCheck, FileText, Check, X, AlertTriangle, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface SecrecyTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export default function SecrecyTermsModal({ isOpen, onClose, onAgree }: SecrecyTermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-[#2c7a7a]/20 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-[#2c7a7a]/10 bg-gradient-to-r from-[#2c7a7a]/10 to-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#2c7a7a]/10 rounded-2xl flex items-center justify-center text-[#214343]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl heading text-slate-900 font-bold">Termo de Sigilo e Responsabilidade</h3>
              <p className="text-xs text-[#2c7a7a] font-bold uppercase tracking-widest mt-0.5">Confidencialidade sob a LGPD</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-650 text-sm leading-relaxed scrollbar-thin">
          <div className="flex gap-3 bg-red-50/50 p-4 border border-red-100 rounded-2xl">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5 animate-pulse" />
            <p className="text-xs text-red-900 font-medium">
              Este termo visa regular o acesso e estabelecer o dever absoluto e ético de <strong>Sigilo Definitivo</strong> sobre todas as informações sensíveis de crianças e adolescentes neurodivergentes cadastradas no sistema.
            </p>
          </div>

          <section className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 bg-[#2c7a7a]/10 text-[#214343] rounded-full flex items-center justify-center text-xs font-bold font-mono">1</span>
              Do Preâmbulo e Definições
            </h4>
            <p className="pl-7">
              Ao utilizar a plataforma <strong>Vic AI</strong> (Plataforma Inteligente de Apoio Pedagógico), o usuário ("Usuário"), sendo este profissional de educação (professor, coordenador pedagógico, psicopedagogo), profissional de saúde, terapeuta de apoio ou responsável, assume integralmente e de forma irrevogável as obrigações e deveres descritos sob leis brasileiras.
            </p>
            <p className="pl-7">
              A <strong>Vic AI</strong> realiza o processamento especializado de dados sensíveis relativos a estudantes com Transtorno do Espectro Autista (TEA) e neurodiversidades associadas, abrangendo informações clínicas, diagnósticos (CID/DSM), relatórios de evolução pedagógica (RPI), percursos sensíveis e histórico comportamental.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-5">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 bg-[#2c7a7a]/10 text-[#214343] rounded-full flex items-center justify-center text-xs font-bold font-mono">2</span>
              Do Objeto e Confidencialidade Absoluta
            </h4>
            <div className="pl-7 space-y-2">
              <p className="font-semibold text-slate-800">O Usuário compromete-se a:</p>
              <ul className="list-disc pl-5 space-y-2 text-xs font-medium">
                <li>
                  <strong>NÃO COMPARTILHAR</strong>, ceder, fotografar, expor, publicar em mídias de comunicação interna, grupos de mensagens eletrônicas (por exemplo, WhatsApp, Telegram) ou redes sociais quaisquer capturas de tela, nomes, diagnósticos, códigos de identificação médica ou relatórios gerados pela Inteligência Artificial e emitidos pelo sistema.
                </li>
                <li>
                  Utilizar os dados exclusivamente para a formulação de <strong>atividades de inclusão</strong> e adaptações pedagógicas dentro do ambiente estritamente institucional da escola em que o estudante está matriculado.
                </li>
                <li>
                  Manter as credenciais de autenticação (usuário e senha de acesso) guardadas em absoluto sigilo pessoal, sendo expressamente vetado o compartilhamento do perfil de login com outros profissionais.
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-5">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 bg-[#2c7a7a]/10 text-[#214343] rounded-full flex items-center justify-center text-xs font-bold font-mono">3</span>
              Do Enquadramento Legal (LGPD nº 13.709/18)
            </h4>
            <p className="pl-7">
              Em conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD)</strong>, Lei nº 13.709/2018, as informações relativas à saúde, deficiências, comportamentos e neurodesenvolvimento constituem <strong>Dados Pessoais Sensíveis</strong> (Artigo 5º, Inciso II).
            </p>
            <p className="pl-7">
              O Artigo 11 e o Artigo 14 da referida Lei preveem sanções severas para dados de crianças e adolescentes. O descumprimento enseja sanções administrativas da ANPD, sem prejuízo de reparações civis, criminais e perdas e danos de natureza material e moral.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-5">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 bg-[#2c7a7a]/10 text-[#214343] rounded-full flex items-center justify-center text-xs font-bold font-mono">4</span>
              Das Responsabilidades e Penalidades
            </h4>
            <p className="pl-7">
              Em caso de vazamento, divulgação não autorizada ou uso indevido resultante de negligência, dolo, imprudência ou cessão de credenciais por parte do Usuário, este responderá individualmente de forma civil, administrativa e penal perante os órgãos competentes. A violação acarretará o bloqueio imediato e sumário do seu acesso à plataforma.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-5">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 bg-[#2c7a7a]/10 text-[#214343] rounded-full flex items-center justify-center text-xs font-bold font-mono">5</span>
              Da Vigência Temporal e Irrevogabilidade
            </h4>
            <p className="pl-7 font-semibold text-[#214343]">
              As obrigações de sigilo e não divulgação contempladas neste Termo de Responsabilidade permanecem válidas e em vigor de maneira VITALÍCIA e perpétua, mesmo após a desvinculação institucional do profissional.
            </p>
          </section>
        </div>

        {/* Footer actions */}
        <div className="p-8 border-t border-slate-100 bg-slate-55 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center sm:text-left mb-2 sm:mb-0">
            Documento Digital Permanente Vic AI
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              id="secrecy-cancel"
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-2xl transition-all cursor-pointer w-full sm:w-auto text-center font-sans"
            >
              Voltar
            </button>
            <button
              id="secrecy-agree-btn"
              type="button"
              onClick={() => {
                onAgree();
                onClose();
              }}
              className="px-6 py-3 bg-[#2c7a7a] hover:bg-[#214343] active:scale-95 text-white text-xs font-extrabold rounded-2xl shadow-xl shadow-brand-900/10 transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto font-sans"
            >
              <Check className="w-4 h-4" />
              Concordar e Aceitar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
