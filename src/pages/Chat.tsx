import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  Bot, 
  User as UserIcon,
  Loader2,
  Sparkles,
  Trash2,
  Maximize2,
  Minimize2,
  Brain,
  FileDown,
  Save,
  Search,
  Plus
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { useAuth, Tooltip } from "../App";
import jsPDF from "jspdf";
import ReactMarkdown from "react-markdown";
import { Student, Report } from "../types";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      role: "model",
      text: "Olá! Sou a **Vic**, sua assistente pedagógica. Minha especialidade é a **Educação Inclusiva**, com um foco dedicado ao **Transtorno do Espectro Autista (TEA)** e ao **Transtorno do Déficit de Atenção com Hiperatividade (TDAH)**.\n\nMeu objetivo principal é ser um braço direito para professores, coordenadores e equipes técnicas no dia a dia. Posso auxiliar com:\n\n* Elaboração de Planos de Atendimento Educacional Especializado (PAEE)\n* Adaptações de atividades e recursos didáticos estruturados baseados no hiperfoco do aluno\n* Estratégias pedagógicas focadas em aumentar a concentração e o engajamento (essencial para TDAH)\n* Dicas práticas de manejo sensorial, rotinas previsíveis e autorregulação comportamental.\n\nComo posso ajudar você hoje?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // States for Sidebar student search list & selection context
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedReports, setSelectedReports] = useState<Report[]>([]);

  useEffect(() => {
    if (selectedStudent) {
      fetch(`/api/admin/reports/student/${selectedStudent.id}`)
        .then(res => res.json())
        .then(data => {
          setSelectedReports(Array.isArray(data) ? data : []);
        })
        .catch(err => {
          console.error("Error loading student reports in chat:", err);
          setSelectedReports([]);
        });
    } else {
      setSelectedReports([]);
    }
  }, [selectedStudent]);

  useEffect(() => {
    fetch("/api/admin/students")
      .then(res => res.json())
      .then(data => {
        setStudents(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Error loading students in chat:", err);
        setStudents([]);
      });
  }, []);

  const getAvatarStyle = (name: string) => {
    const charCode = name.charCodeAt(0) || 0;
    const index = charCode % 5;
    const styles = [
      { bg: "bg-teal-50 text-teal-700", border: "border-teal-100" },
      { bg: "bg-blue-50 text-blue-700", border: "border-blue-100" },
      { bg: "bg-purple-50 text-purple-700", border: "border-purple-100" },
      { bg: "bg-amber-50 text-amber-700", border: "border-amber-100" },
      { bg: "bg-rose-50 text-rose-700", border: "border-rose-100" },
    ];
    return styles[index];
  };

  const filteredStudents = students.filter(s => {
    const sName = s.name || "";
    const sCode = s.code || "";
    const sCondition = s.condition || "";
    const sGrade = s.grade || "";

    const matchesSearch = sName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sCondition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sGrade.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Restrict student view for teachers
    const isTeacherOfStudent = s.teacherId === user?.id || (s.teacherName && user?.name && s.teacherName === user.name);
    const residesInSameSchool = !(!user?.schoolId || s.schoolId !== user.schoolId);
    const matchesTeacher = user?.type !== "PROFESSOR" || isTeacherOfStudent || residesInSameSchool;

    return matchesSearch && matchesTeacher;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (rawText: string) => {
    const textToSubmit = rawText.trim();
    if (!textToSubmit || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: textToSubmit,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      let studentContext = "";
      if (selectedStudent) {
        const reportsText = selectedReports && selectedReports.length > 0 
          ? selectedReports.map((r, idx) => `
  - Registro de Evolução #${idx + 1} (${r.date || "Sem data"}):
    * Progresso: ${r.progress || "Não informado"}
    * Participação: ${r.participation || "Não informado"}
    * Comportamento Geral: ${r.behavior || "Não informado"}
    * Frequência/Status de Crises: ${r.crises || "Não informado"}
    * Leitura: ${r.reading || "Não informado"}
    * Escrita: ${r.writing || "Não informado"}
    * Raciocínio Lógico: ${r.logic || "Não informado"}
    * Tarefas Pendentes: ${r.pendingTasks || "Não informado"}
    * Observações/Recomendações: ${r.difficulties || "Não informado"}
`).join("\n")
          : "Nenhum histórico de evolução pedagógica registrado até o momento.";

        studentContext = `
DADOS DO ALUNO COMPLETOS (ACESSADOS EM TEMPO REAL):
--------------------------------------------------
- ID do Aluno: ${selectedStudent.id}
- Código: ${selectedStudent.code}
- Nome: ${selectedStudent.name}
- Idade: ${selectedStudent.age} anos
- Gênero: ${selectedStudent.gender || "Não informado"}
- Escola ID: ${selectedStudent.schoolId}
- Série/Ano: ${selectedStudent.grade}
- Responsável: ${selectedStudent.responsible}
- Telefone: ${selectedStudent.phone || "Não informado"}
- Nível de TEA/Suporte: ${selectedStudent.teaLevel || "Não estabelecido"}
- Condição Principal: ${selectedStudent.condition || "TEA"}
- Subtipo TDAH: ${selectedStudent.adhdSubtype || "Não se aplica"}
- Intensidade TDAH: ${selectedStudent.adhdIntensity || "Não se aplica"}
- Status do Aluno: ${selectedStudent.status || "Ativo"}
- Diagnóstico Escolar/Clínico Completo: ${selectedStudent.diagnosis || "Não informado"}
- Profissional Responsável pelo Laudo: ${selectedStudent.professional || "Não informado"}
- Período escolar: ${selectedStudent.period || "Não informado"}
- Tempo de Matrícula: ${selectedStudent.enrolmentTime || "Não informado"}
- Possui Professor de Apoio: ${selectedStudent.supportTeacher || "Não informado"}
- Frequenta Sala de Recursos Multi-Uso: ${selectedStudent.resourceRoom || "Não informado"}
- Possui PEI (Plano de Ensino Individualizado) Ativo: ${selectedStudent.pei || "Não informado"}
- Adaptações Curriculares Atuais: ${selectedStudent.adaptations || "Não informado"}
- Histórico Acadêmico Anterior: ${selectedStudent.academicHistory || "Não informado"}

DADOS DE DESENVOLVIMENTO PEDAGÓGICO & COMPORTAMENTAL:
- Comunicação e Linguagem: ${selectedStudent.communication || "Não informado"}
- Atenção, Foco e Concentração: ${selectedStudent.attention || "Não informado"}
- Sensibilidade e Respostas Sensoriais: ${selectedStudent.sensitivity || "Não informado"}
- Comportamento de Desorganização ou Crises: ${selectedStudent.crises || "Não informado"}
- Memória e Retenção: ${selectedStudent.memory || "Não informado"}
- Compreensão e Raciocínio Geral: ${selectedStudent.comprehension || "Não informado"}
- Motricidade (Fina/Ampla): ${selectedStudent.motricity || "Não informado"}
- Vínculo com o Professor: ${selectedStudent.teacherBond || "Não informado"}
- Desempenho Escolar Atual: ${selectedStudent.performance || "Não informado"}
- Hiperfoco do Aluno (Foco de Interesse Intenso): ${selectedStudent.hyperfocus || "Não especificado"}
- Objetivo Pedagógico Principal Estabelecido: ${selectedStudent.pedagogicalObjective || "Não especificado"}

HISTÓRICO ATUALIZADO DE RESTRUTURAÇÃO PEDAGÓGICA (REGISTROS DE EVOLUÇÃO):
${reportsText}

DADOS DO USUÁRIO OPERANDO O SISTEMA (PROFESSOR/COORDENADOR):
--------------------------------------------------
- Nome do Usuário: ${user?.name || "Não informado"}
- E-mail: ${user?.email || "Não informado"}
- Tipo de Perfil: ${user?.type || "Não informado"}
- Escola Associada ID: ${user?.schoolId || "Sem escola associada"}

DIRETRIZES DE ATUAÇÃO E GERAÇÃO DE CONTEÚDO (MANDATÓRIO):
--------------------------------------------------
Ao responder o usuário sobre este aluno, você tem acesso COMPLETO a todos os dados do banco de dados descritos acima. 
Você DEVE utilizar plenamente estes dados para:
1. Elaboração e detalhamento de Planos de Atendimento Educacional Especializado (PAEE) e Planos de Ensino Individualizado (PEI) que atendam perfeitamente ao diagnóstico, nível de suporte e objetivo pedagógico do aluno.
2. Projetar e estruturar de forma extremamente prática Adaptações de Atividades e Recursos Didáticos Estruturados (folhas de atividades, pareamento visual, rotinas em tópicos) que se fundamentem especificamente no hiperfoco do aluno (${selectedStudent.hyperfocus || "geral"}) para maximizar sua atenção.
3. Desenvolver Estratégias Pedagógicas focadas em aumentar a concentração, retenção e engajamento, com ênfase especial nas necessidades de TDAH se aplicável (estratégias de pausas ativas, quebra de tarefas complexas em etapas simples, checklists visuais).
4. Propor Dicas Práticas e Personalizadas de Manejo Sensorial (minimizar luzes/ruídos, fones de abafamento), Rotinas Previsíveis (quadro de rotina visual antes-depois, transições sinalizadas) e estratégias de Autorregulação Comportamental (técnicas de respiração, cantinho da calma, regulação socioemocional).
5. Elaborar e formular Relatórios de Evolução, Pareceres Pedagógicos Inclusivos e Pareceres Finais estruturados de forma profissional e científica para envio a clínicos ou responsáveis.

Sempre incorpore esses dados em suas respostas de forma direta ou sutil (citando elementos específicos do cadastro dele), provendo respostas verdadeiramente personalizadas e baseadas em evidências científicas de inclusão.
        `;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          ...history,
          { role: "user", parts: [{ text: textToSubmit }] }
        ],
        config: {
          systemInstruction: `Você é Vic, Assistente Educacional Especializada em Inclusão Escolar, Planejamento Pedagógico e Adaptações Curriculares para estudantes neurodivergentes, incluindo TEA (Transtorno do Espectro Autista), TDAH (Transtorno do Déficit de Atenção e Hiperatividade) e outras condições do neurodesenvolvimento.
          Seu objetivo é apoiar pais, responsáveis, professores, coordenadores, psicopedagogos e instituições educacionais na criação de estratégias pedagógicas, planos de aula, atividades adaptadas, rotinas estruturadas e recursos educacionais.
          Sempre atue de forma segura, ética, inclusiva, baseada em evidências, respeitosa, humanizada, não capacitista e não discriminatória.

          LIMITES DE ATUAÇÃO E PROIBIÇÃO DE DIAGNÓSTICOS E PRESCRIÇÕES:
          - Você NÃO é médico, psiquiatra, neurologista, psicólogo clínico, fonoaudiólogo, terapeuta ocupacional nem formulador de diagnósticos clínicos. Jamais se apresente como profissional responsável pelo acompanhamento da criança.
          - É TERMINANTEMENTE PROIBIDO diagnosticar, confirmar ou descartar TEA, TDAH, deficiência intelectual, transtornos emocionais ou psiquiátricos.
          - Se o usuário perguntar "Meu filho tem autismo?" ou similar, responda EXATAMENTE com: "Não é possível determinar a presença ou ausência de autismo por meio desta plataforma. A avaliação deve ser realizada por profissionais qualificados utilizando instrumentos e procedimentos apropriados."
          - Se o usuário pedir confirmação ou descarte de qualquer diagnóstico, responda EXATAMENTE com: "Não posso confirmar ou descartar diagnósticos. Caso existam preocupações sobre o desenvolvimento da criança, recomenda-se procurar avaliação especializada."
          - É PROIBIDO indicar medicamentos, sugerir doses ou alterações. Se perguntado sobre remédios ou tratamentos clínicos, responda EXATAMENTE com: "Questões relacionadas a medicamentos, diagnósticos ou tratamentos clínicos devem ser discutidas com profissionais de saúde habilitados."
          - Defina claramente: "O uso desta plataforma complementa o trabalho educacional e não substitui avaliações ou acompanhamentos realizados por profissionais especializados."

          SEGURANÇA PEDAGÓGICA E LINGUAGEM INCLUSIVA:
          - Todas as propostas devem ser seguras fisicamente, adequadas à faixa etária, ao tempo de atenção e hiperfocos, realizáveis na escola ou no lar.
          - Jamais sugira castigos, punições, isolamento punitivo, humilhações ou privações básicas.
          - Use linguagem inclusiva e adequada ("criança autista", "criança com TDAH", "neurodivergente", "necessidades de apoio"). Evite termos como "sofre de autismo", "portador", "doente", "anormal".

          GERAÇÃO DE PLANOS DE AULA:
          - Todo plano deve conter: Objetivo geral, Objetivos específicos, Habilidades trabalhadas, Materiais, Desenvolvimento, Estratégias de adaptação e Avaliação. Os objetivos devem ser claros, mensuráveis e compatíveis com a idade.

          CONTROLE DE ALUCINAÇÃO E DADOS:
          - Nunca invente leis, decretos, pesquisas fictícias ou dados diagnósticos. Se faltar informação confiável, responda: "Não possuo informações suficientes para responder com segurança."
          - Não peça CPF, RG, dados bancários ou residenciais.

          RESPOSTA PADRÃO OBRIGATÓRIA:
          Ao final de qualquer plano, atividade ou orientação educacional que você gerar, inclua automaticamente e sem exceções o seguinte rodapé em parágrafo destacado:
          "Este conteúdo possui finalidade exclusivamente educacional e não substitui avaliações, diagnósticos ou acompanhamentos realizados por profissionais de saúde ou educação especializados. As estratégias sugeridas devem ser adaptadas às necessidades individuais da criança e ao contexto em que serão aplicadas."

          CONTEXTO DO ESTUDANTE ATUAL SOBRE O QUAL FALAREMOS:
          ${studentContext}`
        }
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: response.text || "Desculpe, não consegui processar sua solicitação agora.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);

      // Report dynamic AI token and prompt consumption
      try {
        const usage = (response as any).usageMetadata || {};
        fetch("/api/admin/ai-consumption", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            promptTokens: usage.promptTokenCount || 1200,
            responseTokens: usage.candidatesTokenCount || 850
          })
        }).catch(() => {});
      } catch (logErr) {
        // Safe fail
      }
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: "Houve um erro técnico. Por favor, tente novamente em instantes.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const clearChat = () => {
    if (confirm("Deseja realmente limpar o histórico da conversa?")) {
      setMessages([
        {
          id: "welcome-message",
          role: "model",
          text: "Olá! Sou a **Vic**, sua assistente pedagógica. Minha especialidade é a **Educação Inclusiva**, com um foco dedicado ao **Transtorno do Espectro Autista (TEA)** e ao **Transtorno do Déficit de Atenção com Hiperatividade (TDAH)**.\n\nMeu objetivo principal é ser um braço direito para professores, coordenadores e equipes técnicas no dia a dia. Posso auxiliar com:\n\n* Elaboração de Planos de Atendimento Educacional Especializado (PAEE)\n* Adaptações de atividades e recursos didáticos estruturados baseados no hiperfoco do aluno\n* Estratégias pedagógicas focadas em aumentar a concentração e o engajamento (essencial para TDAH)\n* Dicas práticas de manejo sensorial, rotinas previsíveis e autorregulação comportamental.\n\nComo posso ajudar você hoje?",
          timestamp: new Date()
        }
      ]);
    }
  };

  const exportToPDF = (text: string) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pageHeight = 297;
    const bottomMargin = 25;
    const topMargin = 25;
    const leftMargin = 20;
    const printableWidth = 170;

    let y = 30; // Start below top margin

    const addNewPageIfNeeded = (requiredHeight: number) => {
      if (y + requiredHeight > pageHeight - bottomMargin) {
        doc.addPage();
        y = topMargin;
      }
    };

    const parseMarkdownInline = (raw: string) => {
      const regex = /\*\*([^*]+)\*\*/g;
      const segments: { text: string; bold: boolean }[] = [];
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(raw)) !== null) {
        if (match.index > lastIndex) {
          segments.push({
            text: raw.substring(lastIndex, match.index),
            bold: false
          });
        }
        segments.push({
          text: match[1],
          bold: true
        });
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < raw.length) {
        segments.push({
          text: raw.substring(lastIndex),
          bold: false
        });
      }
      return segments;
    };

    const wrapStyledSegments = (docInstance: any, segments: { text: string; bold: boolean }[], maxWidth: number) => {
      const wrappedLines: { segments: { text: string; bold: boolean }[] }[] = [];
      let currentLineSegments: { text: string; bold: boolean }[] = [];
      let currentLineWidth = 0;

      for (const segment of segments) {
        const words = segment.text.split(/(\s+)/);
        docInstance.setFont("helvetica", segment.bold ? "bold" : "normal");

        for (const word of words) {
          if (word === "") continue;
          const wordWidth = docInstance.getTextWidth(word);
          
          if (currentLineWidth + wordWidth > maxWidth) {
            if (word.trim() === "") {
              continue;
            }
            if (currentLineSegments.length > 0) {
              wrappedLines.push({ segments: currentLineSegments });
            }
            currentLineSegments = [];
            currentLineWidth = 0;
          }
          
          const lastSeg = currentLineSegments[currentLineSegments.length - 1];
          if (lastSeg && lastSeg.bold === segment.bold) {
            lastSeg.text += word;
          } else {
            currentLineSegments.push({ text: word, bold: segment.bold });
          }
          currentLineWidth += wordWidth;
        }
      }
      
      if (currentLineSegments.length > 0) {
        wrappedLines.push({ segments: currentLineSegments });
      }
      
      return wrappedLines;
    };

    // Split text into lines
    let linesRaw = text.split(/\r?\n/);
    
    // Skip introductory greetings of the model if any
    let startIndex = 0;
    for (let i = 0; i < linesRaw.length; i++) {
      const line = linesRaw[i].trim();
      if (line.startsWith("#") || line.toUpperCase().includes("PLANO") || line.toUpperCase().includes("ATIVIDADE") || line.startsWith("**")) {
        startIndex = i;
        break;
      }
    }
    const contentLines = linesRaw.slice(startIndex);

    for (let lineIndex = 0; lineIndex < contentLines.length; lineIndex++) {
      let rawLine = contentLines[lineIndex].trim();
      if (rawLine === "" || rawLine === "---") {
        if (rawLine === "---") {
          addNewPageIfNeeded(8);
          doc.setDrawColor(226, 232, 240); // slate-200
          doc.setLineWidth(0.4);
          doc.line(20, y + 2, 190, y + 2);
          y += 8;
        } else {
          y += 4;
        }
        continue;
      }

      // Check for Heading 1 (e.g. # TITLE)
      if (rawLine.startsWith("#")) {
        const cleanTitle = rawLine.replace(/^#+\s*/, "");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(44, 122, 122); // brand-600
        
        const wrappedTitle = doc.splitTextToSize(cleanTitle, printableWidth);
        const requiredHeight = wrappedTitle.length * 7 + 8;
        addNewPageIfNeeded(requiredHeight);

        y += 4;
        wrappedTitle.forEach((textLine: string) => {
          doc.text(textLine, 20, y);
          y += 7;
        });
        y += 4;
        continue;
      }

      // Check for Heading 2 or completely bold lines as subtitles
      const isH2 = rawLine.startsWith("##") || 
                   (rawLine.startsWith("**") && rawLine.endsWith("**") && !rawLine.substring(2, rawLine.length - 2).includes("**"));

      if (isH2) {
        const cleanHeader = rawLine.replace(/^##+\s*/, "").replace(/\*\*/g, "");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42); // slate-900

        const wrappedHeader = doc.splitTextToSize(cleanHeader, printableWidth);
        const requiredHeight = wrappedHeader.length * 6 + 7;
        addNewPageIfNeeded(requiredHeight);

        y += 5;
        wrappedHeader.forEach((textLine: string) => {
          doc.text(textLine, 20, y);
          y += 6;
        });
        y += 3;
        continue;
      }

      // Check for bullets
      let isBullet = false;
      let indent = 0;
      if (rawLine.startsWith("* ") || rawLine.startsWith("- ") || rawLine.startsWith("• ")) {
        isBullet = true;
        indent = 6;
        rawLine = rawLine.replace(/^[*•-]\s*/, "");
      }

      const segments = parseMarkdownInline(rawLine);
      const wrappedLines = wrapStyledSegments(doc, segments, printableWidth - indent);
      
      const lineHeight = 6;
      const totalParaHeight = wrappedLines.length * lineHeight + (isBullet ? 2 : 1);

      addNewPageIfNeeded(totalParaHeight);

      if (isBullet) {
        doc.setFillColor(44, 122, 122); // brand-600
        doc.circle(21, y + 2.8, 0.7, "F");
      }

      wrappedLines.forEach((wrapLine) => {
        let drawX = 20 + indent;
        wrapLine.segments.forEach((seg) => {
          doc.setFont("helvetica", seg.bold ? "bold" : "normal");
          doc.setFontSize(10);
          
          if (seg.bold) {
            doc.setTextColor(30, 41, 59); // slate-800
          } else {
            doc.setTextColor(71, 85, 105); // slate-600
          }
          
          doc.text(seg.text, drawX, y + 4.5);
          drawX += doc.getTextWidth(seg.text);
        });
        y += lineHeight;
      });

      y += 1.5;
    }

    // Pass 2: Add dynamic page decoration & headers/footers to all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Running Header (only on page 2 onwards)
      if (i > 1) {
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.3);
        doc.line(20, 16, 190, 16);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text("PLANO DE AULA INDIVIDUALIZADO - VIC IA", 20, 11);
      } else {
        // Page 1 header top border accent
        doc.setFillColor(44, 122, 122); // brand-600
        doc.rect(20, 15, 170, 3, "F");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(44, 122, 122);
        doc.text("VIC IA - ASSISTENTE PEDAGÓGICA DE EDUCAÇÃO INCLUSIVA", 20, 24);
      }

      // Page Footer (on ALL pages)
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.3);
      doc.line(20, 280, 190, 280);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text("Plano de Aula Personalizado - Gerado por Vic IA", 20, 286);
      doc.text(`Página ${i} de ${totalPages}`, 190, 286, { align: "right" });
    }

    doc.save(`plano-aula-vic-ia-${Date.now()}.pdf`);
  };

  const savePlanToDB = async (text: string) => {
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "chat-generated",
          studentName: "Gerado via Chat",
          objective: "Planejamento via Chat",
          activities: [text],
          sensoryTips: [],
          date: new Date().toISOString()
        })
      });
      if (res.ok) alert("Plano salvo no histórico com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar plano.");
    }
  };

  return (
    <div className={`max-w-7xl mx-auto h-[calc(100vh-140px)] flex rounded-[2rem] overflow-hidden bg-white shadow-xl border border-slate-100 ${isExpanded ? 'fixed inset-0 z-50 max-w-none bg-brand-50 p-6 h-screen' : ''}`}>
      
      {/* LEFT SIDEBAR: Search & Students list */}
      <div className="w-80 border-r border-slate-100 bg-white flex flex-col shrink-0 h-full overflow-hidden p-6 gap-4">
        {/* Header */}
        <div className="flex flex-col gap-0.5 text-left shrink-0">
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Vic IA
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-1" />
          </div>
          <p className="text-xs text-slate-500 font-medium">Sua assistente pedagógica</p>
        </div>

        {/* Status Indicator Card */}
        <div className="bg-brand-700 rounded-2xl p-4 text-white flex items-center gap-3 shadow-md shadow-brand-700/10 shrink-0 text-left">
          <div className="w-10 h-10 bg-brand-600/50 backdrop-blur-md rounded-xl flex items-center justify-center text-white shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-white leading-tight">Chat IA</div>
            <div className="text-[10px] font-semibold text-brand-100 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Ativo agora
            </div>
          </div>
        </div>

        {/* Section: Students list */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-left">
            ALUNOS
          </div>
          
          {/* Search Input Bar */}
          <div className="relative mb-4 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar aluno..."
              className="w-full has-icon bg-slate-50 border border-slate-200/60 rounded-xl py-2.5 pl-12 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/15 focus:border-brand-500 text-slate-700 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Scrollable Students Feed */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nenhum aluno cadastrado</p>
              </div>
            ) : (
              filteredStudents.map((s) => {
                const avatarStyle = getAvatarStyle(s.name);
                const isSelected = selectedStudent?.id === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      const willSelect = !isSelected;
                      setSelectedStudent(willSelect ? s : null);
                      if (willSelect) {
                        const conditionDisplay = s.condition || "TEA";
                        setMessages(prev => [
                          ...prev,
                          {
                            id: `selected-${s.id}-${Date.now()}`,
                            role: "model",
                            text: `Agora, como posso ajudar com as necessidades de **${s.name}** (${s.grade} - ${conditionDisplay})? \n\nPosso te ajudar a planejar atividades adaptadas usando o hiperfoco dele(a) em **${s.hyperfocus || "geral"}**, propor manejos visuais e apoiar sua regulação de comportamento. O que gostaria de desenvolver hoje?`,
                            timestamp: new Date()
                          }
                        ]);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                      isSelected 
                        ? "bg-brand-50/50 border-brand-200 text-brand-900 shadow-sm"
                        : "bg-white border-slate-100 hover:bg-slate-50/80 text-slate-800"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border uppercase ${avatarStyle.bg} ${avatarStyle.border}`}>
                      {s.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="font-bold text-xs truncate text-slate-800">{s.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                        <span>{s.grade}</span>
                        <span>•</span>
                        <span className="text-slate-500 font-extrabold uppercase">{s.condition || "TEA"}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT CHAT CONTAINER */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/10 overflow-hidden relative">
        {/* Right Top Header */}
        <div className="bg-white p-6 border-b border-slate-100 flex items-center justify-between shadow-sm shrink-0 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-800 rounded-full flex items-center justify-center text-white shadow-md shadow-brand-800/10 shrink-0">
              <Bot className="w-5.5 h-5.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                {selectedStudent ? selectedStudent.name : "Vic IA"}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {selectedStudent 
                  ? `${selectedStudent.grade} • Especialista em ${selectedStudent.condition || "TEA"}` 
                  : "Especialista em TEA e TDAH - Online"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Tooltip content="Limpar todo o histórico de conversas e reiniciar a sessão de orientação pedagógica." position="left">
                <button 
                  onClick={clearChat}
                  className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-100"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </Tooltip>
            )}
            <Tooltip content={isExpanded ? "Sair da visualização ampliada e retornar para a tela padrão." : "Expandir a interface da conversa da Vic IA para ocupar toda a largura e facilitar a leitura pedagógica."} position="left">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border font-bold text-xs ${
                  isExpanded 
                    ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-105" 
                    : "bg-brand-50 text-brand-700 border-brand-100 hover:bg-brand-105"
                }`}
              >
                {isExpanded ? (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    <span>Tela Normal</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    <span>Modo Tela Cheia</span>
                  </>
                )}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Selected Student Banner (Clear Action) */}
        {selectedStudent && (
          <div className="bg-brand-50/55 border-b border-brand-100 px-6 py-2 shrink-0 flex items-center justify-between text-xs text-brand-850 font-semibold shadow-sm text-left">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
              <span>
                Vic IA está focada em como posso ajudar com base no histórico de <strong>{selectedStudent.name}</strong> para responder de forma totalmente personalizada.
              </span>
            </div>
            <button 
              onClick={() => setSelectedStudent(null)}
              className="text-brand-650 hover:text-brand-800 underline font-bold cursor-pointer transition-all shrink-0 ml-4"
            >
              Limpar Diagnóstico
            </button>
          </div>
        )}

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
          <div className="space-y-8">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  message.role === "user" ? "bg-slate-100 text-slate-600" : "bg-brand-600 text-white"
                }`}>
                  {message.role === "user" ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`max-w-[80%] p-5 rounded-[1.5rem] shadow-sm text-left ${
                  message.role === "user" 
                    ? "bg-slate-900 text-white rounded-tr-none" 
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                }`}>
                  <div className="text-sm leading-relaxed font-sans markdown-content whitespace-pre-line text-left">
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>
                  
                  {message.role === "model" && message.id !== "welcome-message" && (
                    <div className="flex gap-2.5 mt-4 pt-4 border-t border-slate-200/60">
                      <Tooltip content="Gerar e fazer download do plano de aula ou orientações pedagógicas em um PDF estruturado." position="top">
                        <button 
                          onClick={() => exportToPDF(message.text)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          PDF
                        </button>
                      </Tooltip>
                      
                      <Tooltip content="Armazenar este plano pedagógico ou de intervenção no banco de dados para consulta posterior." position="top">
                        <button 
                          onClick={() => savePlanToDB(message.text)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          SALVAR
                        </button>
                      </Tooltip>
                    </div>
                  )}
                  
                  <p className={`text-[10px] mt-2 font-bold uppercase opacity-40 ${message.role === "user" ? "text-right" : "text-left"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-white p-5 rounded-[1.5rem] rounded-tl-none border border-slate-100 shadow-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                </div>
              </div>
            )}

            {/* Suggestions Pane */}
            {messages.length === 1 && (
              <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6 py-6 border-t border-brand-50 mt-12 bg-white/60 p-6 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sugestões de temas</p>
                </div>
                <div className="flex flex-col w-full gap-3">
                  {[
                    "Como elaborar objetivos para TEA nível 2?",
                    "Quais estratégias usar com aluno não verbal?"
                  ].map(suggestion => (
                    <button 
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setInput(suggestion);
                        setTimeout(() => handleSendMessage(suggestion), 50);
                      }}
                      className="w-full text-center p-3.5 bg-white hover:bg-brand-50/50 border border-slate-100 hover:border-brand-200 rounded-2xl text-xs font-bold text-slate-700 transition-all shadow-sm focus:outline-none cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white p-6 border-t border-slate-100 shrink-0">
          <form onSubmit={handleSend} className="relative bg-slate-50 border border-slate-150 rounded-2xl flex items-center p-1.5 focus-within:ring-2 focus-within:ring-brand-500/10 transition-all">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Como posso ajudar no plano de aula..."
              className="flex-grow bg-transparent border-none py-3 pl-4 pr-16 text-sm font-medium focus:outline-none focus:ring-0 text-slate-700 placeholder:text-slate-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl disabled:opacity-50 transition-all font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md shadow-brand-600/15 cursor-pointer ml-2"
            >
              <span>Enviar</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <p className="text-[10px] text-center mt-3 text-slate-400 font-bold uppercase tracking-widest">
            Vic IA pode cometer erros. Verifique informações importantes.
          </p>
        </div>
      </div>
    </div>
  );
}
