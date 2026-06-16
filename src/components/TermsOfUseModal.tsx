import { Shield, FileText, Check, X, AlertOctagon, HeartHandshake } from "lucide-react";
import { motion } from "motion/react";

interface TermsOfUseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export default function TermsOfUseModal({ isOpen, onClose, onAgree }: TermsOfUseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
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
        className="relative bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-brand-100 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-brand-50 bg-gradient-to-r from-brand-50 to-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-700">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl heading text-slate-900 font-bold">Termos de Uso e LGPD</h3>
              <p className="text-xs text-brand-600 font-bold uppercase tracking-widest mt-0.5">Contrato de Uso e Privacidade</p>
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

        {/* Scalable Scrollable Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-650 text-sm leading-relaxed scrollbar-thin">
          <div className="flex gap-3 bg-brand-50/50 p-4 border border-brand-100 rounded-2xl">
            <HeartHandshake className="w-6 h-6 text-brand-600 shrink-0 mt-0.5" />
            <p className="text-xs text-brand-900 font-medium">
              Bem-vindo à <strong>Vic IA</strong>! Nosso compromisso é o desenvolvimento ético, seguro e humanizado de planejamentos pedagógicos e acompanhamentos de alunos neurodivergentes. Por favor, leia atentamente estes termos antes de prosseguir.
            </p>
          </div>

          <section className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center text-xs">1</span>
              Objetivo e Escopo Pedagógico
            </h4>
            <p className="pl-7">
              A <strong>Vic IA</strong> é uma inteligência de apoio à educação inclusiva focada em TEA (Transtorno do Espectro Autista), TDAH (Transtorno do Déficit de Atenção com Hiperatividade) e outras neurodivergências. Ela atua como copiloto intelectual do educador facilitando a formatação de relatórios quinzenais RPI e planos de aula estruturados.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-5">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center text-xs">2</span>
              Inteligência Artificial e Diagnósticos
            </h4>
            <p className="pl-7">
              As sugestões, estímulos sensoriais e insights gerados pela Vic IA são baseados em prompts informados de boa-fé. O usuário declara compreender que a ferramenta <strong>não substitui laudos médicos de neuropediatras, psicólogos ou fonoaudiólogos</strong>, sendo de papel do educador a devida homologação técnica das estratégias.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-5">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center text-xs">3</span>
              Conformidade com a LGPD
            </h4>
            <div className="pl-7 space-y-2">
              <p>
                Os dados cadastrados de menores de idade estão protegidos em conformidade rígida com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs font-medium">
                <li>Nenhum dado é comercializado com terceiros.</li>
                <li>As informações são armazenadas em nuvem segura com redundância periódica automatizada.</li>
                <li>Toda e qualquer alteração crítica de alunos e planejamentos é monitorada na nossa <strong className="text-slate-800">Trilha de Auditoria</strong> interna para garantir rastreabilidade completa.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-5">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center text-xs">4</span>
              Auditoria e Backups Seguros
            </h4>
            <p className="pl-7">
              Para salvaguardar dados pedagógicos das instituições associadas contra desastres e perdas acidentais, mantemos uma rotina automática de backup da base correspondente. O acesso a essas exportações e aos logs de auditoria de uso crítico está reservado aos administradores da plataforma da sua escola.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-5">
            <div className="flex gap-3 bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-900 text-xs font-semibold">
              <AlertOctagon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                O descumprimento, uso indevido para fins difamatórios ou carregamento de payloads contendo injúrias aos direitos fundamentais de privacidade da criança acarretará suspensão imediata da credencial de uso.
              </div>
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div className="p-8 border-t border-slate-100 bg-slate-55 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center sm:text-left mb-2 sm:mb-0">
            Última atualização: Junho de 2026
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              id="terms-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-2xl transition-all cursor-pointer w-full sm:w-auto text-center font-sans"
            >
              Voltar
            </button>
            <button
              id="terms-accept-btn"
              type="button"
              onClick={() => {
                onAgree();
                onClose();
              }}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-extrabold rounded-2xl shadow-xl shadow-brand-900/10 transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto font-sans"
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
