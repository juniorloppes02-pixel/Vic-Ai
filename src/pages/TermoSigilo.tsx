import { motion } from "motion/react";
import { ShieldCheck, Printer, X, FileText, CheckCircle2 } from "lucide-react";

export default function TermoSigilo() {
  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    if (window.opener || window.history.length > 1) {
      window.close();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden print:shadow-none print:border-none print:rounded-none">
        
        {/* Header (hidden on print if we want, but let's keep it styled nicely for both screen and print) */}
        <div className="bg-gradient-to-r from-[#2c7a7a] to-[#214343] p-8 text-white flex justify-between items-center print:bg-none print:text-black print:p-0 print:border-b print:pb-6 print:border-slate-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 print:hidden">
              <ShieldCheck className="w-6 h-6 text-brand-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display tracking-tight print:text-2xl print:text-slate-950">Vic AI</h1>
              <p className="text-brand-100 text-xs font-semibold uppercase tracking-wider mt-0.5 print:text-slate-500">Termo de Sigilo e Responsabilidade</p>
            </div>
          </div>
          
          {/* Action buttons (hidden on print) */}
          <div className="flex items-center gap-3 print:hidden">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              title="Imprimir documento"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            <button 
              onClick={handleClose}
              className="w-10 h-10 rounded-xl bg-black/15 hover:bg-black/30 flex items-center justify-center transition-all text-white/80 hover:text-white"
              title="Fechar termo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contract Paper Body */}
        <div className="p-10 sm:p-14 space-y-8 text-slate-800 leading-relaxed font-sans text-justify print:p-0 print:text-xs print:leading-normal">
          <div className="text-center space-y-3 pb-8 border-b border-slate-100 print:pb-4 print:border-slate-200">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-slate-900 uppercase">
              Termo de Compromisso, Confidencialidade e Sigilo
            </h2>
            <p className="text-sm sm:text-base font-bold text-slate-500 tracking-wider">
              TRATAMENTO DE DADOS SENSÍVEIS - LEI GERAL DE PROTEÇÃO DE DADOS (LGPD)
            </p>
          </div>

          <section className="space-y-4">
            <h3 className="font-bold text-slate-900 border-l-4 border-brand-500 pl-3 uppercase tracking-wider text-sm print:text-xs">
              1. Do Preâmbulo e Definições
            </h3>
            <p>
              Ao utilizar a plataforma <strong>Vic AI</strong> (Plataforma Inteligente de Apoio Pedagógico), o usuário ("Usuário"), sendo este profissional de educação (professor, coordenador pedagógico, psicopedagogo), profissional de saúde, terapeuta de apoio ou responsável, assume integralmente e de forma irrevogável as obrigações e deveres descritos neste instrumento particular sob leis brasileiras.
            </p>
            <p>
              A <strong>Vic AI</strong> realiza o processamento especializado de dados sensíveis relativos a estudantes com Transtorno do Espectro Autista (TEA) e neurodiversidades associadas, abrangendo informações clínicas, diagnósticos (CID/DSM), relatórios de evolução pedagógica (RPI), percursos sensíveis e histórico comportamental.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="font-bold text-slate-900 border-l-4 border-brand-500 pl-3 uppercase tracking-wider text-sm print:text-xs">
              2. Do Objeto e Confidencialidade Absoluta
            </h3>
            <p>
              Este termo visa regular o acesso e o dever ético de <strong>Sigilo Definitivo</strong> sobre todas as informações sensíveis de crianças e adolescentes cadastrados no sistema. 
            </p>
            <p className="font-semibold text-slate-900">
              O Usuário concorda expressamente e compromete-se a:
            </p>
            <ul className="list-disc pl-6 space-y-2.5">
              <li>
                <strong>NÃO COMPARTILHAR</strong>, ceder, fotografar, expor, publicar em mídias de comunicação interna, grupos de mensagens eletrônicas (por exemplo, WhatsApp, Telegram) ou redes sociais quaisquer capturas de tela, nomes, diagnósticos, códigos de identificação médica ou relatórios gerados pela Inteligência Artificial e emitidos pelo sistema.
              </li>
              <li>
                Utilizar os dados exclusivamente para a formulação de <strong>atividades de inclusão</strong> e adaptações pedagógicas dentro do ambiente estritamente institucional da escola em que o estudante está matriculado.
              </li>
              <li>
                Manter as credenciais de autenticação (usuário e senha de acesso) guardadas em absoluto sigilo pessoal, sendo expressamente vetado o compartilhamento do perfil de login com outros profissionais da escola ou de fora dela.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="font-bold text-slate-900 border-l-4 border-brand-500 pl-3 uppercase tracking-wider text-sm print:text-xs">
              3. Do Enquadramento Legal (LGPD nº 13.709/18)
            </h3>
            <p>
              Em conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD)</strong>, Lei nº 13.709/2018, as informações relativas à saúde, deficiências, comportamentos e neurodesenvolvimento constituem <strong>Dados Pessoais Sensíveis</strong> (Artigo 5º, Inciso II). 
            </p>
            <p>
              O Artigo 11 e o Artigo 14 da referida Lei preveem sanções severas e condições rigorosas de tratamento para dados de crianças e adolescentes. O descumprimento de tais regulamentos enseja sanções administrativas por parte da ANPD (Autoridade Nacional de Proteção de Dados), sem prejuízo de reparações civis, criminais e perdas e danos de natureza material e moral.
            </p>
            <p>
              Adicionalmente, as condutas violadoras deste instrumento infringem o contido no <strong>Estatuto da Criança e do Adolescente (ECA)</strong> e o Código de Ética Profissional correspondente à categoria ativa do profissional.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="font-bold text-slate-900 border-l-4 border-brand-500 pl-3 uppercase tracking-wider text-sm print:text-xs">
              4. Das Responsabilidades e Penalidades
            </h3>
            <p>
              Em caso de vazamento, divulgação não autorizada ou uso indevido resultante de negligência, dolo, imprudência ou cessão de credenciais de login por parte do Usuário, este responderá individualmente de forma civil, administrativa e penal perante os órgãos competentes e a equipe jurídica da instituição escolar ou municipal.
            </p>
            <p>
              Desta forma, o Usuário concorda que a violação do sigilo acarretará o bloqueio imediato e sumário do seu acesso à plataforma, ensejando justa de demissão se aplicável, rescisão de contrato de trabalho público, suspensão de registro profissional perante seus respectivos conselhos, e abertura de inquérito administrativo civil de reparação.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="font-bold text-slate-900 border-l-4 border-brand-500 pl-3 uppercase tracking-wider text-sm print:text-xs">
              5. Da Vigência Temporal e Irrevogabilidade
            </h3>
            <p>
              As obrigações de sigilo e não divulgação contempladas neste Termo de Responsabilidade regulam a relação pós-utilização, permanecendo válidas e em vigor de maneira <strong>vitalícia</strong> e perpétua, mesmo após a desvinculação institucional do profissional com a rede de ensino ou ao término do seu período letivo de atribuição.
            </p>
          </section>

          <div className="pt-10 border-t border-slate-100 flex flex-col items-center justify-center space-y-6 print:pt-4 print:border-slate-200">
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider print:text-black print:bg-none print:px-0">
              <CheckCircle2 className="w-4 h-4 print:hidden" />
              <span>Documento Digital Permanente Vic AI</span>
            </div>
            
            <p className="text-xs text-slate-400 text-center font-medium max-w-sm print:text-[8px]">
              Este documento é registrado eletronicamente mediante a aceitação do termo no ato de submissão do formulário de cadastro.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
