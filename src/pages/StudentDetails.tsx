import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Baby,
  Calendar,
  MapPin,
  Phone,
  User as UserIcon,
  UserCircle2,
  Bot,
  FileText,
  Activity,
  History,
  Plus,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
  Target,
  Sparkles,
  Loader2,
  Link,
  Copy,
  Mail,
  Check,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  Settings,
  Focus,
  ListChecks,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ComposedChart,
  Line,
  Bar,
  Legend,
} from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { Student, School, Report } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import { useAuth } from "../App";

const progressMap = {
  excelente: 100,
  evoluindo: 80,
  estável: 60,
  estavel: 60,
  alerta: 30,
};
const behaviorMap = { "muito calmo": 100, calmo: 80, agitado: 50, crise: 20 };
const participationMap = {
  "muito ativa": 100,
  "muito ativo": 100,
  ativa: 80,
  ativo: 80,
  passiva: 40,
  passivo: 40,
  nula: 10,
  nulo: 10,
};
const skillMap = {
  excelente: 100,
  ótimo: 100,
  otimo: 100,
  bom: 80,
  "em desenvolvimento": 60,
  "em progresso": 60,
  regular: 50,
  "dificuldade acentuada": 30,
  fraco: 20,
};

const mapScoreLocal = (
  value: string | undefined,
  mapping: Record<string, number>,
  defaultValue = 50,
): number => {
  if (!value) return defaultValue;
  const normalized = value.trim().toLowerCase();
  for (const key of Object.keys(mapping)) {
    if (normalized.includes(key)) {
      return mapping[key];
    }
  }
  return defaultValue;
};

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState("perfil");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "progresso",
    "comportamento",
    "participacao",
    "leitura",
    "escrita",
    "raciocinio",
  ]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdatingStudent, setIsUpdatingStudent] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Student>>({});
  const [editModalTab, setEditModalTab] = useState("pessoal");
  const [isExportingEvolution, setIsExportingEvolution] = useState(false);

  // Form State for New Evolution Report
  const [reportFormData, setReportFormData] = useState({
    behavior: "Focado e cooperativo",
    participation: "Ativa",
    progress: "Evoluindo",
    difficulties: "Leve dificuldade de concentração",
    crises: "Nenhuma",
    reading: "Excelente",
    writing: "Em desenvolvimento",
    logic: "Bom",
    pendingTasks: "Nenhuma",
  });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setIsSubmittingReport(true);
    try {
      const response = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reportFormData,
          studentId: student.id,
        }),
      });
      if (response.ok) {
        const newReport = await response.json();
        setReports((prev) => [newReport, ...prev]);
        setIsReportModalOpen(false);
        // Reset form
        setReportFormData({
          behavior: "Focado e cooperativo",
          participation: "Ativa",
          progress: "Evoluindo",
          difficulties: "Leve dificuldade de concentração",
          crises: "Nenhuma",
          reading: "Excelente",
          writing: "Em desenvolvimento",
          logic: "Bom",
          pendingTasks: "Nenhuma",
        });
      } else {
        alert("Erro ao adicionar o registro. Tente novamente.");
      }
    } catch (error) {
      console.error("Error creating report:", error);
      alert("Erro de conexão ao adicionar registro.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // RPI State
  const [rpiStep, setRpiStep] = useState(1);
  const [isGeneratingRPI, setIsGeneratingRPI] = useState(false);
  const [generatedRPI, setGeneratedRPI] = useState<string | null>(null);
  const [rpiForm, setRpiForm] = useState({
    comportamento: {
      atencao: "Focalizada",
      distracao: "Externa",
      estereotipias: "",
      interacaoProfessores: "Responde quando solicitado",
      interacaoPares: "Brinca paralelamente",
      crisesFrequencia: "Raro",
      crisesGatilhos: "",
    },
    academico: {
      portugues: {
        desempenho: "Em desenvolvimento",
        adaptacoes: "Apoio visual",
      },
      matematica: {
        desempenho: "Em desenvolvimento",
        adaptacoes: "Material concreto",
      },
      ciencias: {
        desempenho: "Interesse moderado",
        adaptacoes: "Vídeos e fotos",
      },
      historiaGeografia: {
        desempenho: "Em desenvolvimento",
        adaptacoes: "Mapas mentais",
      },
      artes: {
        desempenho: "Excelente engajamento",
        adaptacoes: "Livre expressão",
      },
      educacaoFisica: {
        desempenho: "Participa com apoio",
        adaptacoes: "Comandos curtos",
      },
    },
    comunicacao: {
      tipo: "Verbal",
      ecolalias: "Ocasional",
      compreensao: "Compreende comandos simples",
      funcoes: ["Pedir", "Interagir"],
    },
    sensorial: {
      hipersensibilidades: student?.sensitivity ? [student.sensitivity] : [],
      buscaEvita: "Evita barulhos altos",
      motricidadeFina: "Dificuldade leve",
      motricidadeAmpla: "Preservada",
    },
    avancos: "",
    desafios: "",
    recomendacoes: ["Uso de antecipação visual", "Fragmentação de tarefas"],
    encaminhamentos: "",
    reavaliacao: "6 meses",
  });

  // AI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<{
    activities: { title: string; content: string }[];
    sensoryTips: { title: string; content: string }[];
  } | null>(null);
  const [planFeedback, setPlanFeedback] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState({
    detailLevel: "Médio",
    activityTypes: ["Visual", "Acadêmica"],
    focusAreas: ["Comunicação", "Socialização"],
  });

  useEffect(() => {
    fetch("/api/admin/students")
      .then((res) => res.json())
      .then((students) => {
        const s = students.find((st: Student) => st.id === id);
        setStudent(s);
        if (s) {
          fetch("/api/admin/schools")
            .then((res) => res.json())
            .then((schoolsList) => {
              setSchools(schoolsList);
              setSchool(
                schoolsList.find((sch: School) => sch.id === s.schoolId),
              );
            });
        }
      });
    fetch(`/api/admin/reports/student/${id}`)
      .then((res) => res.json())
      .then(setReports);
  }, [id]);

  const openEditModal = () => {
    if (student) {
      setEditFormData({ ...student });
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateStudent = async () => {
    if (!editFormData.name?.trim()) {
      alert("Por favor, preencha o Nome Completo do aluno antes de salvar.");
      return;
    }

    setIsUpdatingStudent(true);
    try {
      const res = await fetch(`/api/admin/students/${student?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      if (res.ok) {
        const updated = await res.json();
        setStudent(updated);
        if (schools.length > 0) {
          setSchool(schools.find((sch) => sch.id === updated.schoolId) || null);
        }
        setIsEditModalOpen(false);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(
          errData.error ||
            "Ocorreu um erro ao atualizar os dados do aluno. Verifique se os dados estão corretos ou tente novamente.",
        );
      }
    } catch (err) {
      console.error("Update student error:", err);
      alert(
        "Falha de comunicação com o servidor. Tente novamente em instantes.",
      );
    } finally {
      setIsUpdatingStudent(false);
    }
  };

  const generateLessonPlan = async () => {
    if (!student) return;

    setIsGenerating(true);
    setPlanFeedback(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const lastReports = reports
        .slice(0, 3)
        .map(
          (r) =>
            `- Data: ${r.date}, Progress: ${r.progress}, Difficulties: ${r.difficulties}, Logic: ${r.logic}`,
        )
        .join("\n");

      const prompt = `
        Você é um especialista altamente capacitado em educação inclusiva para TEA (Transtorno do Espectro Autista) e TDAH (Transtorno de Déficit de Atenção com Hiperatividade).
        Crie um plano de aula dinâmico e personalizado para o seguinte aluno:
        
        Nome: ${student.name}
        Idade: ${student.age}
        Condição / Neurodivergência: ${student.condition || "TEA"}
        ${student.condition === "TEA" || student.condition === "TEA + TDAH" || !student.condition ? `Nível de Suporte (TEA): ${student.teaLevel}` : ""}
        ${student.condition === "TDAH" || student.condition === "TEA + TDAH" ? `Subtipo TDAH: ${student.adhdSubtype || "Misto"} | Intensidade TDAH: ${student.adhdIntensity || "Moderado"}` : ""}
        Diagnóstico: ${student.diagnosis}
        Comunicação: ${student.communication}
        Hipersensibilidade: ${student.sensitivity}
        Hiperfoco/Interesses: ${student.hyperfocus}
        Objetivo Pedagógico: ${student.pedagogicalObjective}
        Desempenho: ${student.performance}
        
        Configurações de Geração:
        - Nível de Detalhamento: ${aiConfig.detailLevel}
        - Tipos de Atividade Preferidos: ${aiConfig.activityTypes.join(", ")}
        - Áreas de Foco Prioritárias: ${aiConfig.focusAreas.join(", ")}
        
        Relatórios de progresso recentes:
        ${lastReports}
        
        O plano deve conter:
        1. Duas atividades propostas focadas nos interesses do aluno (incluindo hiperfoco se especulado), objetivos pedagógicos e nas ÁREAS DE FOCO selecionadas. Para TDAH, adicione pausas ativas e estimulação de atenção focada. Para TEA, foque em comunicação e metodologia baseada em interesses visuais.
        2. Duas dicas de manejo adaptativo e sensorial baseadas nas sensibilidades dele e no NÍVEL DE DETALHAMENTO solicitado.
        
        Responda EXCLUSIVAMENTE em formato JSON com a seguinte estrutura:
        {
          "activities": [
            { "title": "Título da Atividade", "content": "Descrição detalhada conforme o nível de detalhamento solicitado" },
            { "title": "Título da Atividade", "content": "Descrição detalhada conforme o nível de detalhamento solicitado" }
          ],
          "sensoryTips": [
            { "title": "Título do Manejo", "content": "Descrição detalhada" },
            { "title": "Título do Manejo", "content": "Descrição detalhada" }
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const result = JSON.parse(cleaned);
      setGeneratedPlan(result);

      // Save to database
      fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          studentName: student.name,
          objective: student.pedagogicalObjective,
          activities: result.activities,
          sensoryTips: result.sensoryTips,
          date: new Date().toISOString(),
        }),
      }).catch((err) => console.error("Error saving plan:", err));
    } catch (error) {
      console.error("Failed to generate lesson plan:", error);
      alert("Erro ao gerar plano com IA. Tente novamente em instantes.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRPIFullBody = async () => {
    if (!student) return;
    setIsGeneratingRPI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        Como Vic IA, especialista em educação especial inclusiva, gere um Relatório Pedagógico Individualizado (RPI) para um aluno com ${student.condition || "TEA"}.
        O relatório deve ser formal, estruturado e em tom profissional, seguindo estritamente o modelo de Relatório Descritivo Pedagógico sem marcadores de tópicos (como asteriscos, hífens ou listas numeradas) nas seções descritivas.
        
        DADOS DO ALUNO:
        Nome: ${student.name}
        Idade: ${student.age}
        Ano/Turma: ${student.grade}
        Período: ${student.period || "Manhã"}
        Escola: ${school?.name}
        Professor(a): ${student.teacherName || "Não informado"}
        Condição / Neurodivergência: ${student.condition || "TEA"}
        ${student.condition === "TEA" || student.condition === "TEA + TDAH" || !student.condition ? `Nível de Suporte (TEA): ${student.teaLevel}` : ""}
        ${student.condition === "TDAH" || student.condition === "TEA + TDAH" ? `Subtipo TDAH: ${student.adhdSubtype || "Misto"} | Intensidade TDAH: ${student.adhdIntensity || "Moderado"}` : ""}
        Tempo de Matrícula: ${student.enrolmentTime || "Não informado"}
        Professor de Apoio: ${student.supportTeacher || "Não informado"}
        Sala de Recursos: ${student.resourceRoom || "Não informado"}
        PEI: ${student.pei || "Não informado"}
        Adaptações Prévias: ${student.adaptations || "Nenhuma registrada"}
        Histórico: ${student.academicHistory || "Nenhum histórico registrado"}
        
        DADOS INFORMADOS AGORA PELO PROFESSOR:
        Comportamento: ${JSON.stringify(rpiForm.comportamento)}
        Acadêmico: ${JSON.stringify(rpiForm.academico)}
        Comunicação: ${JSON.stringify(rpiForm.comunicacao)}
        Sensorial: ${JSON.stringify(rpiForm.sensorial)}
        Avanços: ${rpiForm.avancos}
        Desafios: ${rpiForm.desafios}
        Recomendações: ${rpiForm.recomendacoes.join(", ")}
        Encaminhamentos: ${rpiForm.encaminhamentos}
        Reavaliação: ${rpiForm.reavaliacao}
        
        ESTRUTURA OBRIGATÓRIA E EXCLUSIVA DO TEXTO FINAL:
        
        Escreva o relatório exatamente com a seguinte estrutura de seções. Não adicione números como "1.", "2.", etc., antes das seções do corpo descritivo. Os parágrafos do corpo descritivo devem ser fluidos, contínuos, sem marcadores de tópicos (bullets ou listas).
        Todas os tópicos internos nas seções descritivas devem vir integrados dentro do texto corrido (por exemplo, "Raciocínio e Memória: [desenvolvimento...]. Uso do Hiperfoco: [desenvolvimento...]").

        Escreva exatamente assim:

        RELATÓRIO DESCRITIVO PEDAGÓGICO

        IDENTIFICAÇÃO DO ALUNO:
        ${student.name}, ${student.age} anos, ${student.grade}, período ${student.period || "Manhã"}.
        Escola: ${school?.name || "Escola Municipal"}. Professor(a): ${student.teacherName || "Não informado"}.
        Diagnóstico: Condição de ${student.condition || "Transtorno do Espectro Autista"} ${student.condition === "TEA" || student.condition === "TEA + TDAH" || !student.condition ? `- Nível de suporte ${student.teaLevel}` : ""} ${student.condition === "TDAH" || student.condition === "TEA + TDAH" ? `- Subtipo TDAH: ${student.adhdSubtype || "Misto"}, Intensidade: ${student.adhdIntensity || "Moderado"}` : ""}.
        Data do relatório: ${new Date().toLocaleDateString("pt-BR")}.

        DESENVOLVIMENTO COGNITIVO E PROCESSO DE APRENDIZAGEM
        [Escreva um parágrafo longo, denso, rico e contínuo descrevendo o desenvolvimento cognitivo e processo de aprendizagem, unindo atenção, racatividades, memória, uso de hiperfoco e motricidade em parágrafos narrativos. Integre as sub-etapas como "Raciocínio e Memória: ... Uso do Hiperfoco: ... Motricidade: ..."]

        COMUNICAÇÃO E LINGUAGEM
        [Escreva um parágrafo longo, contínuo e denso descrevendo a linguagem e no aspecto comunicativo da criança, incluindo comunicação expressiva e receptiva de forma corrida.]

        ASPECTOS SOCIOEMOCIONAIS, SENSORIAIS E COMPORTAMENTAIS
        [Escreva um parágrafo contínuo, fluido e denso unificando vínculo pedagógico da criança, o manejo sensorial, autorregulação e as estratégias de controle emocional adotadas.]

        DIRETRIZES E OBJETIVOS PEDAGÓGICOS (METAS DO PEI EM CONSTRUÇÃO)
        [Descreva de modo fluido as propostas e intervenções pedagógicas direcionadas do aluno, integrando no texto "Análise de Tarefas (Task Analysis): ... Uso Sistemático do Hiperfoco: ... Sinalização Visual e Previsibilidade: ... Pausas Ativas Reguladoras: ..."]

        CONSIDERAÇÕES FINAIS
        [Escreva considerações gerais correlacionando a evolução provável, a sensibilidade pedagógica e a integração escola, sala de recursos AEE e família.]

        Reavaliação sugerida: ${rpiForm.reavaliacao}.
        Encaminhamentos externos: ${rpiForm.encaminhamentos || "Nenhum no momento"}.
        Local e data: ${school?.region || "Centro"}, ${new Date().toLocaleDateString("pt-BR")}.
        Professor(a): ${student.teacherName || user?.name || "Não informado"}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      setGeneratedRPI(response.text || "");
      setRpiStep(3);

      // Auto-update student's last RPI date as today
      const todayString = new Date().toISOString().split("T")[0];
      try {
        await fetch(`/api/admin/students/${student.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...student,
            lastRpiDate: todayString,
          }),
        });
        setStudent((prev) =>
          prev ? { ...prev, lastRpiDate: todayString } : null,
        );
      } catch (e) {
        console.warn("Failed to auto-update RPI date in backend:", e);
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar relatório. Tente novamente.");
    } finally {
      setIsGeneratingRPI(false);
    }
  };

  const exportRPIToPDF = () => {
    if (!generatedRPI) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageHeight = 297;
    const pageWidth = 210;
    const bottomMargin = 12.7;
    const topMargin = 12.7;
    const leftMargin = 12.7;
    const rightMargin = 12.7;
    const printableWidth = pageWidth - leftMargin - rightMargin; // 184.6 mm

    let y = topMargin + 5; // Start rendering content offset slightly from top margin

    const addNewPageIfNeeded = (requiredHeight: number) => {
      if (y + requiredHeight > pageHeight - bottomMargin) {
        doc.addPage();
        y = topMargin + 5;
      }
    };

    const parseMarkdownInline = (text: string) => {
      const regex = /\*\*([^*]+)\*\*/g;
      const segments: { text: string; bold: boolean }[] = [];
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          segments.push({
            text: text.substring(lastIndex, match.index),
            bold: false,
          });
        }
        segments.push({
          text: match[1],
          bold: true,
        });
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < text.length) {
        segments.push({
          text: text.substring(lastIndex),
          bold: false,
        });
      }
      return segments;
    };

    const drawParagraphJustified = (paragraphText: string) => {
      const segments = parseMarkdownInline(paragraphText);
      const styledWords: { text: string; bold: boolean }[] = [];

      segments.forEach((seg) => {
        const parts = seg.text.split(/(\s+)/);
        parts.forEach((part) => {
          if (part.trim() !== "") {
            styledWords.push({ text: part, bold: seg.bold });
          }
        });
      });

      if (styledWords.length === 0) return;

      const wrappedLines: { text: string; bold: boolean }[][] = [];
      let currentLine: { text: string; bold: boolean }[] = [];
      let currentLineWidth = 0;

      doc.setFont("helvetica", "normal");
      const standardSpaceWidth = doc.getTextWidth(" ");

      for (let i = 0; i < styledWords.length; i++) {
        const word = styledWords[i];
        doc.setFont("helvetica", word.bold ? "bold" : "normal");
        const wordWidth = doc.getTextWidth(word.text);

        const spaceOffset = currentLine.length > 0 ? standardSpaceWidth : 0;

        if (currentLineWidth + spaceOffset + wordWidth > printableWidth) {
          if (currentLine.length > 0) {
            wrappedLines.push(currentLine);
          }
          currentLine = [word];
          currentLineWidth = wordWidth;
        } else {
          currentLine.push(word);
          currentLineWidth += spaceOffset + wordWidth;
        }
      }
      if (currentLine.length > 0) {
        wrappedLines.push(currentLine);
      }

      const lineHeight = 5.2; // Clean, perfect spacing

      wrappedLines.forEach((lineWords, lineIndex) => {
        const requiredHeight = lineHeight;
        addNewPageIfNeeded(requiredHeight);

        const isLastLine = lineIndex === wrappedLines.length - 1;
        const isSingleWord = lineWords.length === 1;

        if (isLastLine || isSingleWord) {
          // Draw standard left-aligned
          let xPos = leftMargin;
          lineWords.forEach((word) => {
            doc.setFont("helvetica", word.bold ? "bold" : "normal");
            doc.setFontSize(10.5);
            if (word.bold) {
              doc.setTextColor(15, 23, 42); // slate-900 / dark
            } else {
              doc.setTextColor(51, 65, 85); // slate-700
            }
            doc.text(word.text, xPos, y);
            xPos += doc.getTextWidth(word.text) + standardSpaceWidth;
          });
        } else {
          // Draw justified text holding exact margins (left and right)
          let totalWordsWidth = 0;
          lineWords.forEach((word) => {
            doc.setFont("helvetica", word.bold ? "bold" : "normal");
            totalWordsWidth += doc.getTextWidth(word.text);
          });

          const remainingSpace = printableWidth - totalWordsWidth;
          const spacing = remainingSpace / (lineWords.length - 1);

          let xPos = leftMargin;
          lineWords.forEach((word) => {
            doc.setFont("helvetica", word.bold ? "bold" : "normal");
            doc.setFontSize(10.5);
            if (word.bold) {
              doc.setTextColor(15, 23, 42);
            } else {
              doc.setTextColor(51, 65, 85);
            }
            doc.text(word.text, xPos, y);
            xPos += doc.getTextWidth(word.text) + spacing;
          });
        }
        y += lineHeight;
      });

      y += 5; // space between paragraph blocks
    };

    // Parse the generated RPI into logical blocks separated by double-newlines
    const blocksRaw = generatedRPI.split(/\n\s*\n/);
    const contentBlocks = blocksRaw
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    contentBlocks.forEach((block) => {
      // 1. Center main title
      if (block.toUpperCase().includes("RELATÓRIO DESCRITIVO PEDAGÓGICO")) {
        addNewPageIfNeeded(12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        const titleWidth = doc.getTextWidth("RELATÓRIO DESCRITIVO PEDAGÓGICO");
        const xCenter = (pageWidth - titleWidth) / 2;
        doc.text("RELATÓRIO DESCRITIVO PEDAGÓGICO", xCenter, y);
        y += 8;
        return;
      }

      // 2. Bold section titles
      const cleanHeading = block
        .replace(/^##+\s*/, "")
        .replace(/\*\*/g, "")
        .trim();
      const isHeading = [
        "IDENTIFICAÇÃO DO ALUNO:",
        "DETALHES DO ESTUDANTE:",
        "DESENVOLVIMENTO COGNITIVO E PROCESSO DE APRENDIZAGEM",
        "COMUNICAÇÃO E LINGUAGEM",
        "ASPECTOS SOCIOEMOCIONAIS, SENSORIAIS E COMPORTAMENTAIS",
        "DIRETRIZES E OBJETIVOS PEDAGÓGICOS (METAS DO PEI EM CONSTRUÇÃO)",
        "CONSIDERAÇÕES FINAIS",
      ].includes(cleanHeading.toUpperCase());

      if (isHeading) {
        addNewPageIfNeeded(10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);

        // Center all headings except "IDENTIFICAÇÃO DO ALUNO"
        if (cleanHeading.toUpperCase() === "IDENTIFICAÇÃO DO ALUNO:") {
          doc.text(cleanHeading.toUpperCase(), leftMargin, y);
        } else {
          const headingWidth = doc.getTextWidth(cleanHeading.toUpperCase());
          const xCenter = (pageWidth - headingWidth) / 2;
          doc.text(cleanHeading.toUpperCase(), xCenter, y);
        }
        y += 7;
        return;
      }

      // 3. User info lines block or end fields (formatted line-by-line)
      const isMetadataOrEndFields =
        block.includes("Escola:") ||
        block.includes("Diagnóstico:") ||
        block.includes("Reavaliação sugerida:") ||
        block.includes("Encaminhamentos externos:") ||
        block.includes("Local e data:") ||
        block.includes("Professor(a):") ||
        block.startsWith("Reavaliação sugerida:") ||
        block.startsWith("Encaminhamentos externos:");

      if (isMetadataOrEndFields) {
        const lines = block.split(/\r?\n/);
        lines.forEach((line) => {
          const trimmedLine = line.trim();
          if (!trimmedLine) return;

          addNewPageIfNeeded(6);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10.5);
          doc.setTextColor(51, 65, 85);

          // Find matches for subfields and make their prefix bold
          const labelReg =
            /^(Escola:|Diagnóstico:|Data do relatório:|Reavaliação sugerida:|Encaminhamentos externos:|Local e data:|Professor\(a\):)/;
          const match = trimmedLine.match(labelReg);

          if (match) {
            const label = match[1];
            const valueContent = trimmedLine.replace(label, "").trim();
            doc.setFont("helvetica", "bold");
            doc.text(label, leftMargin, y);
            const labelWidth = doc.getTextWidth(label + " ");
            doc.setFont("helvetica", "normal");
            doc.text(valueContent, leftMargin + labelWidth, y);
          } else {
            doc.text(trimmedLine, leftMargin, y);
          }
          y += 5.5;
        });
        y += 3; // segment space
        return;
      }

      // 4. Default to standard descriptive narrative paragraph rendered justified
      drawParagraphJustified(block);
    });

    // Pass 2: Add page footer numbering on all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.3);
      doc.line(
        leftMargin,
        pageHeight - bottomMargin - 5,
        pageWidth - rightMargin,
        pageHeight - bottomMargin - 5,
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(
        "Prontuário de Educação Especial - Emitido por Vic IA",
        leftMargin,
        pageHeight - bottomMargin,
      );
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth - rightMargin,
        pageHeight - bottomMargin,
        { align: "right" },
      );
    }

    doc.save(`RPI_${student?.name.replace(/\s+/g, "_")}.pdf`);
  };

  const exportCompleteProfile = async () => {
    if (!student) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(24);
      doc.setTextColor(44, 122, 122); // brand-600
      doc.text("Prontuário Pedagógico Vic IA", 14, 25);

      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(
        `Documento gerado em: ${new Date().toLocaleString("pt-BR")}`,
        14,
        32,
      );

      // Student Header Section
      doc.setDrawColor(241, 245, 249); // brand-50
      doc.setFillColor(248, 250, 252); // slate-50
      doc.roundedRect(14, 40, pageWidth - 28, 45, 3, 3, "F");

      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(student.name, 20, 52);

      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(`Código: ${student.code}`, 20, 60);
      doc.text(`Escola: ${school?.name || "N/A"}`, 20, 66);
      doc.text(
        `Idade: ${student.age} anos | Gênero: ${student.gender}`,
        20,
        72,
      );
      doc.text(
        `Nível de Suporte (TEA): ${student.teaLevel || "Não informado"}`,
        20,
        78,
      );

      // Clinical Details Section
      doc.setFontSize(14);
      doc.setTextColor(44, 122, 122);
      doc.text("Informações Clínicas e de Suporte", 14, 100);

      const clinicalData = [
        ["Diagnóstico", student.diagnosis || "Não informado"],
        ["Profissional", student.professional || "Não informado"],
        [
          "Professor Responsável",
          student.teacherName
            ? `Professor(a) ${student.teacherName}`
            : "Não informado",
        ],
        ["Comunicação", student.communication || "Não informado"],
        ["Atenção", student.attention || "Não informado"],
        ["Hipersensibilidade", student.sensitivity || "Não informado"],
        ["Crises", student.crises || "Não informado"],
        ["Desempenho Geral", student.performance || "Não informado"],
      ];

      autoTable(doc, {
        startY: 105,
        body: clinicalData,
        theme: "striped",
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          0: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 50 },
          1: { textColor: [51, 65, 85] },
        },
        margin: { left: 14, right: 14 },
      });

      // Profile Section
      const profileY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setTextColor(44, 122, 122);
      doc.text("Perfil de Desenvolvimento", 14, profileY);

      const cognitiveData = [
        [
          "Memória",
          student.memory || "Não informado",
          "Compreensão",
          student.comprehension || "Não informado",
        ],
        [
          "Motricidade",
          student.motricity || "Não informado",
          "Vínculo Professor",
          student.teacherBond || "Não informado",
        ],
      ];

      autoTable(doc, {
        startY: profileY + 5,
        body: cognitiveData,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: "bold", textColor: [100, 116, 139] },
          2: { fontStyle: "bold", textColor: [100, 116, 139] },
        },
      });

      // Objectives & Hyperfocus
      const objY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setTextColor(44, 122, 122);
      doc.text("Interesses e Objetivos", 14, objY);

      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text("HIPERFOCO / INTERESSES", 14, objY + 8);
      doc.setTextColor(51, 65, 85);
      doc.text(student.hyperfocus || "Não informado", 14, objY + 14);

      doc.setTextColor(148, 163, 184);
      doc.text("OBJETIVO PEDAGÓGICO PRIMÁRIO", 14, objY + 24);
      doc.setTextColor(51, 65, 85);
      const splitObjective = doc.splitTextToSize(
        student.pedagogicalObjective || "Não informado",
        pageWidth - 28,
      );
      doc.text(splitObjective, 14, objY + 30);

      // Reports History
      if (reports.length > 0) {
        doc.addPage();
        doc.setFontSize(18);
        doc.setTextColor(44, 122, 122);
        doc.text("Histórico de Relatórios Pedagógicos", 14, 25);

        const reportsTable = reports.map((r) => [
          new Date(r.date).toLocaleDateString("pt-BR"),
          r.progress,
          r.behavior,
          r.participation,
          r.pendingTasks,
        ]);

        autoTable(doc, {
          startY: 35,
          head: [
            [
              "Data",
              "Progresso",
              "Comportamento",
              "Participação",
              "Pendências",
            ],
          ],
          body: reportsTable,
          headStyles: { fillColor: [44, 122, 122], fontSize: 9 },
          styles: { fontSize: 8 },
          alternateRowStyles: { fillColor: [248, 250, 252] },
        });
      }

      doc.save(`Prontuario_${student.name.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Houve um erro ao gerar o PDF. Verifique os logs do console.");
    }
  };

  const exportReportToPDF = (report: Report) => {
    if (!student) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(44, 122, 122); // brand-600
      doc.text("Relatório de Acompanhamento Quinzenal", 14, 25);

      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(
        `Gerado por Vic IA em: ${new Date().toLocaleString("pt-BR")}`,
        14,
        32,
      );

      // Student Section
      doc.setDrawColor(241, 245, 249); // brand-50
      doc.setFillColor(248, 250, 252); // slate-50
      doc.roundedRect(14, 38, pageWidth - 28, 38, 3, 3, "F");

      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(student.name, 20, 48);

      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(
        `Código: ${student.code}  |  Série/Ano: ${student.grade}`,
        20,
        55,
      );
      doc.text(
        `Nível de Suporte/Condição: ${student.teaLevel || "Não cadastrado"} (${student.condition || "TEA"})`,
        20,
        61,
      );
      doc.text(
        `Data do Registro: ${new Date(report.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}`,
        20,
        67,
      );

      // Report Metrics Section
      doc.setFontSize(13);
      doc.setTextColor(44, 122, 122);
      doc.text("Métricas Pedagógicas e de Conduta", 14, 90);

      const metricsData = [
        ["Desempenho/Progresso", report.progress || "Não informado"],
        ["Comportamento Geral", report.behavior || "Não informado"],
        ["Participação", report.participation || "Não informado"],
        ["Frequência de Crises", report.crises || "Não informado"],
        ["Tarefas Pendentes", report.pendingTasks || "Não informado"],
      ];

      autoTable(doc, {
        startY: 94,
        body: metricsData,
        theme: "striped",
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          0: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 60 },
          1: { textColor: [51, 65, 85] },
        },
        margin: { left: 14, right: 14 },
      });

      // Cognitive/Subject Metrics Section
      const nextY = (doc as any).lastAutoTable.finalY + 12;
      doc.setFontSize(13);
      doc.setTextColor(44, 122, 122);
      doc.text("Desenvolvimento de Habilidades", 14, nextY);

      const cognitiveData = [
        ["Leitura", report.reading || "Não informado"],
        ["Escrita", report.writing || "Não informado"],
        ["Raciocínio Lógico", report.logic || "Não informado"],
      ];

      autoTable(doc, {
        startY: nextY + 4,
        body: cognitiveData,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          0: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 60 },
          1: { textColor: [51, 65, 85] },
        },
        margin: { left: 14, right: 14 },
      });

      // Observations
      const lastY = (doc as any).lastAutoTable.finalY + 12;
      doc.setFontSize(13);
      doc.setTextColor(44, 122, 122);
      doc.text("Parecer Descritivo e Recomendações", 14, lastY);

      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const splitDifficulties = doc.splitTextToSize(
        report.difficulties ||
          "Nenhuma observação ou recomendação adicional registrada.",
        pageWidth - 28,
      );
      doc.text(splitDifficulties, 14, lastY + 6);

      // Signature line at bottom
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(14, pageHeight - 30, pageWidth - 14, pageHeight - 30);

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(
        "Este documento é um registro de acompanhamento quinzenal emitido eletronicamente pela assistente pedagógica Vic IA",
        14,
        pageHeight - 24,
      );
      doc.text(
        "Validação e assinatura digital pedagógica efetuada em conformidade com as diretivas inclusivas da instituição.",
        14,
        pageHeight - 20,
      );

      doc.save(
        `Registro_Evolucao_${student.name.replace(/\s+/g, "_")}_${new Date(report.date).toLocaleDateString().replace(/\//g, "_")}.pdf`,
      );
    } catch (error) {
      console.error("Single Pedagogical Report PDF Export Error:", error);
      alert("Houve um erro ao gerar o PDF. Verifique os logs do console.");
    }
  };

  const exportPlanToPDF = () => {
    if (!student || !generatedPlan) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(44, 122, 122); // brand-600
      doc.text("Plano Estratégico Vic IA", 14, 25);

      // Date
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(
        `Documento gerado em: ${new Date().toLocaleString("pt-BR")}`,
        14,
        32,
      );

      // Student Info Box
      doc.setDrawColor(241, 245, 249); // brand-50
      doc.setFillColor(248, 250, 252); // slate-50
      doc.roundedRect(14, 40, pageWidth - 28, 40, 3, 3, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(`Aluno: ${student.name}`, 20, 50);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(
        `Código: ${student.code} | Escola: ${school?.name || "N/A"}`,
        20,
        57,
      );
      doc.text(
        `Professor Responsável: ${student.teacherName ? `Professor(a) ${student.teacherName}` : "Não informado"}`,
        20,
        63,
      );

      const wrappedObjective = doc.splitTextToSize(
        `Objetivo Pedagógico: ${student.pedagogicalObjective || "Não informado"}`,
        pageWidth - 40,
      );
      doc.text(wrappedObjective, 20, 69);

      let currentY = 90;

      // 1. Percurso Pedagógico
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(44, 122, 122);
      doc.text("1. Percurso Pedagógico", 14, currentY);
      currentY += 6;

      const activitiesData = generatedPlan.activities.map((act, idx) => [
        `Atividade ${idx + 1}: ${act.title}`,
        act.content,
      ]);

      autoTable(doc, {
        startY: currentY,
        body: activitiesData,
        theme: "striped",
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: {
          0: { fontStyle: "bold", textColor: [44, 122, 122], cellWidth: 50 },
          1: { textColor: [51, 65, 85] },
        },
        margin: { left: 14, right: 14 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;

      // Check page break
      if (currentY + 50 > pageHeight) {
        doc.addPage();
        currentY = 25;
      }

      // 2. Protocolo de Acomodação
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(44, 122, 122);
      doc.text("2. Protocolo de Acomodação", 14, currentY);
      currentY += 6;

      const sensoryData = generatedPlan.sensoryTips.map((tip, idx) => [
        `Dica ${idx + 1}: ${tip.title}`,
        tip.content,
      ]);

      autoTable(doc, {
        startY: currentY,
        body: sensoryData,
        theme: "striped",
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: {
          0: { fontStyle: "bold", textColor: [194, 65, 12], cellWidth: 50 },
          1: { textColor: [51, 65, 85] },
        },
        margin: { left: 14, right: 14 },
      });

      doc.save(`Plano_Estrategico_${student.name.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Plan PDF Export Error:", error);
      alert("Houve um erro ao gerar o PDF. Verifique os logs do console.");
    }
  };

  const exportEvolutionReportToPDF = async () => {
    if (!student) return;
    setIsExportingEvolution(true);

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // 1. Header
      doc.setFontSize(22);
      doc.setTextColor(44, 122, 122); // brand-600 #2c7a7a
      doc.setFont("helvetica", "bold");
      doc.text("Relatório de Curva de Evolução - Vic IA", 14, 25);

      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFont("helvetica", "normal");
      doc.text(
        `Documento gerado em: ${new Date().toLocaleString("pt-BR")}`,
        14,
        32,
      );

      // 2. Student Info Box
      doc.setDrawColor(241, 245, 249); // slate-100
      doc.setFillColor(248, 250, 252); // slate-50
      doc.roundedRect(14, 38, pageWidth - 28, 38, 3, 3, "F");

      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont("helvetica", "bold");
      doc.text(student.name, 20, 48);

      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.setFont("helvetica", "normal");
      doc.text(`Código: ${student.code}`, 20, 54);
      doc.text(`Escola: ${school?.name || "Não informada"}`, 20, 60);
      doc.text(
        `Professor(a): ${student.teacherName || "Não informado"} | Idade: ${student.age} anos`,
        20,
        66,
      );
      doc.text(
        `Nível de Suporte (TEA): ${student.teaLevel || "Não informado"} | Diagnóstico: ${student.diagnosis || "Não informado"}`,
        20,
        71,
      );

      // 3. Stats Calculation (like in render)
      const sortedReportsLocal = [...reports].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      let progressDiffText = "0%";
      if (sortedReportsLocal.length >= 2) {
        const firstScore = mapScoreLocal(sortedReportsLocal[0].progress, progressMap, 60);
        const lastScore = mapScoreLocal(sortedReportsLocal[sortedReportsLocal.length - 1].progress, progressMap, 60);
        const diff = lastScore - firstScore;
        progressDiffText = `${diff >= 0 ? "+" : ""}${diff}%`;
      } else if (sortedReportsLocal.length === 1) {
        const score = mapScoreLocal(sortedReportsLocal[0].progress, progressMap, 60);
        progressDiffText = `${score}%`;
      }

      const avgBehaviorLocal = reports.length > 0
        ? Math.round(reports.reduce((acc, r) => acc + mapScoreLocal(r.behavior, behaviorMap, 70), 0) / reports.length)
        : 75;

      const avgParticipationLocal = reports.length > 0
        ? Math.round(reports.reduce((acc, r) => acc + mapScoreLocal(r.participation, participationMap, 65), 0) / reports.length)
        : 70;

      const avgReadingLocal = reports.length > 0
        ? Math.round(reports.reduce((acc, r) => acc + mapScoreLocal(r.reading, skillMap, 50), 0) / reports.length)
        : 60;

      const avgWritingLocal = reports.length > 0
        ? Math.round(reports.reduce((acc, r) => acc + mapScoreLocal(r.writing, skillMap, 50), 0) / reports.length)
        : 60;

      const avgLogicLocal = reports.length > 0
        ? Math.round(reports.reduce((acc, r) => acc + mapScoreLocal(r.logic, skillMap, 50), 0) / reports.length)
        : 60;

      // Render Stat boxes manually in PDF
      doc.setFontSize(11);
      doc.setTextColor(44, 122, 122);
      doc.setFont("helvetica", "bold");
      doc.text("Resumo de Indicadores Gerais", 14, 86);

      // We draw 6 boxes in total (2 rows of 3 boxes)
      const boxW = (pageWidth - 28 - 10) / 3;
      const boxH = 18;
      const startX = 14;
      const startY = 91;

      // Box 1: Crescimento de Foco
      doc.setFillColor(240, 253, 250); // emerald-50
      doc.roundedRect(startX, startY, boxW, boxH, 2, 2, "F");
      doc.setFontSize(8);
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.text("CRESCIMENTO DE FOCO", startX + 4, startY + 6);
      doc.setFontSize(14);
      doc.setTextColor(4, 120, 87); // emerald-700
      doc.text(progressDiffText, startX + 4, startY + 14);

      // Box 2: Estabilidade Comportamental
      const b2X = startX + boxW + 5;
      doc.setFillColor(239, 246, 255); // blue-50
      doc.roundedRect(b2X, startY, boxW, boxH, 2, 2, "F");
      doc.setFontSize(8);
      doc.setTextColor(37, 99, 235); // blue-600
      doc.text("ESTABILIDADE COMP.", b2X + 4, startY + 6);
      doc.setFontSize(14);
      doc.setTextColor(29, 78, 216); // blue-700
      doc.text(`${avgBehaviorLocal}%`, b2X + 4, startY + 14);

      // Box 3: Participação Geral
      const b3X = startX + (boxW + 5) * 2;
      doc.setFillColor(254, 243, 199); // amber-50
      doc.roundedRect(b3X, startY, boxW, boxH, 2, 2, "F");
      doc.setFontSize(8);
      doc.setTextColor(217, 119, 6); // amber-600
      doc.text("PARTICIPAÇÃO GERAL", b3X + 4, startY + 6);
      doc.setFontSize(14);
      doc.setTextColor(180, 83, 9); // amber-700
      doc.text(`${avgParticipationLocal}%`, b3X + 4, startY + 14);

      // ROW 2: Leitura, Escrita, Raciocínio
      const row2Y = startY + boxH + 4; // 113

      // Box 4: Média Leitura
      doc.setFillColor(238, 242, 255); // indigo-50
      doc.roundedRect(startX, row2Y, boxW, boxH, 2, 2, "F");
      doc.setFontSize(8);
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text("DESEMPENHO LEITURA", startX + 4, row2Y + 6);
      doc.setFontSize(14);
      doc.setTextColor(67, 56, 202); // indigo-700
      doc.text(`${avgReadingLocal}%`, startX + 4, row2Y + 14);

      // Box 5: Média Escrita
      doc.setFillColor(253, 242, 248); // pink-50
      doc.roundedRect(b2X, row2Y, boxW, boxH, 2, 2, "F");
      doc.setFontSize(8);
      doc.setTextColor(219, 39, 119); // pink-600
      doc.text("DESEMPENHO ESCRITA", b2X + 4, row2Y + 6);
      doc.setFontSize(14);
      doc.setTextColor(190, 24, 74); // pink-700
      doc.text(`${avgWritingLocal}%`, b2X + 4, row2Y + 14);

      // Box 6: Média Raciocínio
      doc.setFillColor(250, 245, 255); // purple-50
      doc.roundedRect(b3X, row2Y, boxW, boxH, 2, 2, "F");
      doc.setFontSize(8);
      doc.setTextColor(147, 51, 234); // purple-600
      doc.text("MÉDIA RACIOCÍNIO", b3X + 4, row2Y + 6);
      doc.setFontSize(14);
      doc.setTextColor(126, 34, 206); // purple-700
      doc.text(`${avgLogicLocal}%`, b3X + 4, row2Y + 14);

      // Let's add the Recharts graph image if available
      const chartEl = document.getElementById("evolution-chart-pdf-target");
      if (chartEl) {
        doc.setFontSize(11);
        doc.setTextColor(44, 122, 122);
        doc.setFont("helvetica", "bold");
        doc.text("Gráfico de Evolução Quinzenal", 14, 137);

        // Capture canvas
        const canvas = await html2canvas(chartEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          onclone: (clonedDoc) => {
            // Replace oklch() color codes which break html2canvas' CSS parser
            const styles = clonedDoc.getElementsByTagName("style");
            for (let i = 0; i < styles.length; i++) {
              const s = styles[i];
              if (s.textContent) {
                s.textContent = s.textContent.replace(/oklch\([^)]+\)/g, "rgb(44, 122, 122)");
              }
            }
            const allElements = clonedDoc.getElementsByTagName("*");
            for (let i = 0; i < allElements.length; i++) {
              const el = allElements[i] as HTMLElement;
              if (el && el.style) {
                const inlineStyle = el.getAttribute("style");
                if (inlineStyle && inlineStyle.includes("oklch")) {
                  el.setAttribute("style", inlineStyle.replace(/oklch\([^)]+\)/g, "rgb(44, 122, 122)"));
                }
              }
            }
          }
        });
        const chartImg = canvas.toDataURL("image/png");
        
        // Let's preserve aspect ratio of the chart, say width is 182mm
        const cWidth = pageWidth - 28;
        const cHeight = (canvas.height * cWidth) / canvas.width;
        // Cap the height to 75mm to fit perfectly
        const finalHeight = Math.min(cHeight, 75);

        doc.addImage(chartImg, "PNG", 14, 142, cWidth, finalHeight);

        // Add some legend info context below the chart
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.setFont("helvetica", "italic");
        doc.text(
          `* Legenda das Métricas Visíveis no momento do download: ${selectedMetrics
            .map((m) => {
              if (m === "progresso") return "Progresso Geral";
              if (m === "comportamento") return "Comportamento";
              if (m === "participacao") return "Participação";
              if (m === "leitura") return "Leitura";
              if (m === "escrita") return "Escrita";
              if (m === "raciocinio") return "Raciocínio";
              return m;
            })
            .join(", ")}`,
          14,
          142 + finalHeight + 5,
        );
      }

      // 4. Add raw database records as a table in a new page
      doc.addPage();
      
      doc.setFontSize(14);
      doc.setTextColor(44, 122, 122);
      doc.setFont("helvetica", "bold");
      doc.text("Histórico de Registros Clinico-Pedagógicos (RPI)", 14, 20);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Tabela cronológica resumida contendo o progresso e avaliações multidimensionais para anotação em prontuário de papel.",
        14,
        25,
      );

      // Let's compile table rows from sorted reports
      const tableHeaders = [
        "Data",
        "Progresso",
        "Comporta.",
        "Particip.",
        "Leitura",
        "Escrita",
        "Raciocínio"
      ];
      const tableRows = [...sortedReportsLocal].reverse().map((r) => {
        const d = new Date(r.date + "T00:00:00");
        const formattedDate = d.toLocaleDateString("pt-BR");
        return [
          formattedDate,
          r.progress || "N/A",
          r.behavior || "N/A",
          r.participation || "N/A",
          r.reading || "N/A",
          r.writing || "N/A",
          r.logic || "N/A"
        ];
      });

      autoTable(doc, {
        startY: 29,
        head: [tableHeaders],
        body: tableRows,
        theme: "striped",
        headStyles: { fillColor: [44, 122, 122], textColor: [255, 255, 255], fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 3, font: "helvetica" },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 22 },
          1: { cellWidth: 24 },
          2: { cellWidth: 24 },
          3: { cellWidth: 24 },
          4: { cellWidth: 24 },
          5: { cellWidth: 24 },
          6: { cellWidth: 24 }
        },
        margin: { left: 14, right: 14 },
      });

      // Signature/Footer Area
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      
      // Let's check page overflow on finalY
      if (finalY + 40 > pageHeight) {
        doc.addPage();
        // and reset Y
      }
      
      const sigY = Math.max(finalY + 20, pageHeight - 40);

      doc.setDrawColor(203, 213, 225);
      doc.line(14, sigY, (pageWidth / 2) - 10, sigY);
      doc.line((pageWidth / 2) + 10, sigY, pageWidth - 14, sigY);

      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "bold");
      doc.text("Assinatura do Profissional / Professor", 14, sigY + 4);
      doc.text("Assinatura da Coordenação / Direção", (pageWidth / 2) + 10, sigY + 4);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text("Data: ____ / ____ / ________", 14, sigY + 9);
      doc.text("Data: ____ / ____ / ________", (pageWidth / 2) + 10, sigY + 9);

      doc.save(`Evolucao_${student.name.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Evolution PDF Export Error:", error);
      alert("Houve um erro ao gerar a curva de evolução em PDF. Verifique os logs.");
    } finally {
      setIsExportingEvolution(false);
    }
  };

  if (!student)
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        <p className="text-slate-400 font-medium">Carregando prontuário...</p>
      </div>
    );

  const tabs = [
    { id: "perfil", label: "Perfil Completo", icon: UserIcon },
    { id: "relatorios", label: "Registros de Evolução", icon: FileText },
    { id: "evolucao", label: "Curva de Evolução", icon: Activity },
    { id: "ia", label: "Plano Vic IA", icon: Bot },
    { id: "rpi", label: "Relatório RPI", icon: FileText },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Persistent Sticky Header */}
      <div className="sticky top-0 z-30 -mt-8 pt-8 pb-4 bg-brand-50/80 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/students")}
              className="p-3 bg-white rounded-2xl border border-brand-100 text-slate-400 hover:text-brand-600 hover:border-brand-300 transition-all shadow-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl heading text-slate-900">
                  {student.name}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border ${
                    student.teaLevel.includes("1")
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : student.teaLevel.includes("2")
                        ? "bg-amber-50 text-amber-700 border-amber-100"
                        : "bg-red-50 text-red-700 border-red-100"
                  }`}
                >
                  {student.teaLevel}
                </span>
              </div>
              <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                <span className="font-mono text-brand-600 font-bold tracking-tight">
                  {student.code}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">
                  {school?.name}
                  <span className="text-slate-300">|</span>
                  {student.grade}
                </span>
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={openEditModal}
              className="secondary flex items-center gap-2 py-3 px-6 h-fit bg-white hover:bg-slate-50 border border-brand-100 rounded-2xl shadow-sm text-sm font-bold text-slate-700 transition-all"
            >
              <Settings className="w-5 h-5 text-brand-600" /> Editar Perfil
            </button>
            <button
              onClick={exportCompleteProfile}
              className="secondary flex items-center gap-2 py-3 px-6 h-fit bg-white hover:bg-slate-50 border border-brand-100 rounded-2xl shadow-sm text-sm font-bold text-slate-700 transition-all"
            >
              <Download className="w-5 h-5 text-brand-600" /> Exportar
            </button>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="primary flex items-center gap-2 py-3 px-6 h-fit bg-brand-600 hover:bg-brand-700 text-white rounded-2xl shadow-lg shadow-brand-600/20 text-sm font-bold transition-all"
            >
              <Plus className="w-5 h-5" /> Novo Registro
            </button>
          </div>
        </div>

        {/* Tab Navigation with Animated Indicator */}
        <div className="mt-8 flex items-center p-1.5 bg-white border border-brand-100 rounded-[2rem] shadow-sm relative w-fit mx-auto lg:mx-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-bold transition-all z-10 ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-slate-500 hover:text-brand-600"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-brand-600 rounded-[1.5rem] shadow-lg shadow-brand-600/30"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
              <span className="relative z-20 flex items-center gap-2">
                <tab.icon
                  className={`w-4 h-4 ${activeTab === tab.id ? "text-white" : "text-brand-400"}`}
                />
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-soft p-8 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <Share2
                onClick={() => setIsShareModalOpen(true)}
                className="w-5 h-5 text-slate-300 hover:text-brand-600 cursor-pointer transition-all hover:scale-110"
              />
            </div>
            <div className="w-32 h-32 bg-brand-50 rounded-3xl mx-auto mb-6 flex items-center justify-center border-4 border-white shadow-xl shadow-brand-900/5 overflow-hidden">
              <div className="w-full h-full bg-brand-500 flex items-center justify-center text-white text-4xl font-bold">
                {student.name.charAt(0)}
              </div>
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900 truncate px-4">
              {student.name}
            </h3>
            <p className="text-sm font-medium text-slate-500 mb-8">
              {student.age} anos • {student.gender}
            </p>

            <div className="space-y-4 text-left border-t border-brand-50 pt-6">
              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                  <UserIcon className="w-4 h-4 text-brand-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Responsável
                  </p>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {student.responsible}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                  <Phone className="w-4 h-4 text-brand-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Contato
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {student.phone || "Não informado"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                  <MapPin className="w-4 h-4 text-brand-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Região
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {school?.region}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card-soft p-8 bg-brand-50 border-brand-200"
          >
            <h4 className="text-sm font-bold text-brand-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Bot className="w-4 h-4 text-brand-600" /> Resumo Vic IA
            </h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm text-brand-900 font-medium leading-relaxed italic opacity-80">
                  "
                  {(() => {
                    const firstName = student
                      ? student.name.split(" ")[0]
                      : "O aluno";
                    if (
                      student?.hyperfocus &&
                      student.hyperfocus.trim().toLowerCase() !==
                        "não possui" &&
                      student.hyperfocus.trim() !== "-"
                    ) {
                      return `O ${firstName} demonstra excelente afinidade com ${student.hyperfocus.toLowerCase()}. Use este tema para estimular o raciocínio lógico, memória e engajamento em atividades escolares.`;
                    }
                    if (student?.pedagogicalObjective) {
                      return `Focar no objetivo pedagógico do ${firstName}: "${student.pedagogicalObjective}". Utilize reforçadores positivos e rotinas estruturadas.`;
                    }
                    return `O ${firstName} responde muito bem a rotinas previsíveis e apoios visuais personalizados. Fortaleça o vínculo diário para maximizar o progresso.`;
                  })()}
                  "
                </p>
              </div>
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-brand-900 font-medium leading-relaxed italic opacity-80">
                  "
                  {(() => {
                    const firstName = student
                      ? student.name.split(" ")[0]
                      : "O aluno";
                    if (
                      student?.sensitivity &&
                      student.sensitivity.trim().toLowerCase() !==
                        "não possui" &&
                      student.sensitivity.trim() !== "-"
                    ) {
                      const sens = student.sensitivity.toLowerCase();
                      if (
                        sens.includes("som") ||
                        sens.includes("barulho") ||
                        sens.includes("ruído") ||
                        sens.includes("auditiva")
                      ) {
                        return `Evitar pátio ou refeitório nos horários de recreio coletivo devido à hipersensibilidade a barulhos/sons, ou oferecer abafador infantil de ruído.`;
                      }
                      return `Monitore sinais de sobrecarga sensorial relacionados a ${sens}. Providencie uma zona de refúgio silenciosa se houver crise.`;
                    }
                    if (
                      student?.adaptations &&
                      student.adaptations.trim().toLowerCase() !== "nenhuma" &&
                      student.adaptations.trim() !== "-"
                    ) {
                      return `Aplicar adaptação recomendada: ${student.adaptations.toLowerCase()}. Ofereça pausas estruturadas após tarefas complexas.`;
                    }
                    return `Evitar quebras abruptas na rotina do ${firstName}. Avise com antecedência (usando rotina visual) caso ocorram mudanças de professores ou espaços.`;
                  })()}
                  "
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === "rpi" && (
              <motion.div
                key="rpi"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="card-soft p-12 min-h-[600px] flex flex-col"
              >
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-3xl heading text-slate-900">
                      Relatório Pedagógico (RPI)
                    </h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      Gere relatórios estruturados para acompanhamento clínico e
                      escolar
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={exportRPIToPDF}
                      disabled={!generatedRPI}
                      className={`px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all border ${
                        generatedRPI
                          ? "bg-brand-600 text-white hover:bg-brand-700 border-brand-700/10 shadow-lg shadow-brand-600/15 active:scale-95 cursor-pointer"
                          : "bg-slate-100 border-slate-200 text-slate-400 disabled:opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <Download className="w-4 h-4" /> Exportar PDF
                    </button>
                  </div>
                </div>

                {!generatedRPI ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 p-12">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl shadow-slate-200/50">
                      <FileText className="w-12 h-12 text-brand-600" />
                    </div>
                    <div className="max-w-md">
                      <h4 className="text-xl font-bold text-slate-800 mb-3">
                        Tudo pronto para começar?
                      </h4>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        A Vic IA cruzará o perfil de {student.name}, o histórico
                        escolar e os últimos {reports.length} relatórios para
                        gerar um RPI estruturado.
                      </p>
                    </div>
                    <button
                      onClick={generateRPIFullBody}
                      disabled={isGeneratingRPI}
                      className="primary px-12 py-4 rounded-[1.5rem] shadow-2xl shadow-brand-600/30 flex items-center gap-4 text-base font-bold"
                    >
                      {isGeneratingRPI ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Sparkles className="w-6 h-6" />
                      )}
                      GERAR RELATÓRIO AGORA
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar">
                    <div className="bg-white p-12 rounded-[3rem] border border-brand-100 shadow-sm relative group">
                      <button
                        onClick={() => setGeneratedRPI(null)}
                        className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                      <div className="prose prose-slate max-w-none whitespace-pre-wrap font-sans text-slate-700 leading-[2] text-sm">
                        {generatedRPI}
                      </div>

                      {/* Bottom PDF Export Button Panel */}
                      <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50 -mx-12 -mb-12 p-8 sm:p-12 rounded-b-[3rem]">
                        <div className="max-w-md text-left">
                          <div className="flex items-center gap-2 text-brand-600 font-bold text-sm">
                            <FileText className="w-5 h-5 animate-pulse" />
                            <span>Relatório RPI Pronto</span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                            O documento estruturado pela Vic IA foi formatado
                            seguindo todas as diretrizes pedagógicas e está
                            pronto para ser impresso, salvo como PDF ou
                            compartilhado de forma segura.
                          </p>
                        </div>
                        <button
                          onClick={exportRPIToPDF}
                          className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-brand-600/20 active:scale-95 transition-all text-sm border border-brand-700/10 cursor-pointer shrink-0"
                        >
                          <Download className="w-5 h-5" /> Salvar Relatório
                          (PDF)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "perfil" && (
              <motion.div
                key="perfil"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="card-soft p-10 min-h-[600px] space-y-12 overflow-y-auto custom-scrollbar"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <section className="space-y-8">
                    <div>
                      <h4 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-6 pb-2 border-b border-brand-50 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Perfil Clínico e
                        Suporte
                      </h4>
                      <div className="grid grid-cols-1 gap-5">
                        <div className="flex justify-between items-center text-sm p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-slate-500 font-medium">
                            Diagnóstico
                          </span>
                          <span className="font-bold text-slate-800">
                            {student.diagnosis}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-slate-500 font-medium">
                            Neurodivergência
                          </span>
                          <span className="font-bold text-brand-600">
                            {student.condition || "TEA"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {(student.condition === "TEA" ||
                            student.condition === "TEA + TDAH" ||
                            !student.condition) && (
                            <div className="flex flex-col gap-1 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                Nível TEA
                              </span>
                              <span className="text-sm font-bold text-brand-600">
                                {student.teaLevel}
                              </span>
                            </div>
                          )}
                          {(student.condition === "TDAH" ||
                            student.condition === "TEA + TDAH") && (
                            <div className="flex flex-col gap-1 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                Subtipo TDAH
                              </span>
                              <span className="text-sm font-bold text-slate-800">
                                {student.adhdSubtype || "Não especificado"}
                              </span>
                            </div>
                          )}
                          {(student.condition === "TDAH" ||
                            student.condition === "TEA + TDAH") && (
                            <div className="flex flex-col gap-1 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                Intensidade TDAH
                              </span>
                              <span className="text-sm font-bold text-slate-800">
                                {student.adhdIntensity || "Moderado"}
                              </span>
                            </div>
                          )}
                          <div className="flex flex-col gap-1 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              Possui PEI
                            </span>
                            <span className="text-sm font-bold text-slate-800">
                              {student.pei || "Não"}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              Prof. de Apoio
                            </span>
                            <span className="text-sm font-bold text-slate-800">
                              {student.supportTeacher ? "Sim" : "Não"}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              Sala de Recursos
                            </span>
                            <span className="text-sm font-bold text-slate-800">
                              {student.resourceRoom ? "Sim" : "Não"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-6 pb-2 border-b border-brand-50 flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Adaptações Curriculares
                      </h4>
                      <div className="p-6 bg-brand-50/50 rounded-3xl border border-brand-100 italic text-sm text-brand-900 leading-relaxed">
                        {student.adaptations ||
                          "Nenhuma adaptação registrada até o momento."}
                      </div>
                    </div>
                  </section>

                  <section className="space-y-8">
                    <div>
                      <h4 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-6 pb-2 border-b border-brand-50 flex items-center gap-2">
                        <UserCircle2 className="w-4 h-4" /> Dados Escolares
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex justify-between items-center py-3 border-b border-slate-50">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Escola
                          </span>
                          <span className="text-sm font-bold text-slate-700">
                            {student.schoolId || "Não informada"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-slate-50">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Período
                          </span>
                          <span className="text-sm font-bold text-slate-700">
                            {student.period || "Integral"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-slate-50">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Tempo de Matrícula
                          </span>
                          <span className="text-sm font-bold text-slate-700">
                            {student.enrolmentTime || "Não informado"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-slate-50">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Profissional
                          </span>
                          <span className="text-sm font-bold text-slate-700">
                            {student.professional || "Não informado"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-slate-50">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Professor Responsável
                          </span>
                          <span className="text-sm font-bold text-slate-700">
                            {student.teacherName
                              ? `Professor(a) ${student.teacherName}`
                              : "Não informado"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-6 pb-2 border-b border-brand-50 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Histórico Escolar
                        Relevante
                      </h4>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-sm text-slate-600 leading-relaxed">
                        {student.academicHistory ||
                          "Sem registros de histórico anterior."}
                      </div>
                    </div>
                  </section>
                </div>

                <section>
                  <h4 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-6 pb-2 border-b border-brand-50">
                    Perfil Cognitivo e Motor
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: "Memória", val: student.memory },
                      { label: "Compreensão", val: student.comprehension },
                      { label: "Motricidade", val: student.motricity },
                      { label: "Vínculo", val: student.teacherBond },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 p-4 rounded-2xl text-center hover:bg-brand-50 transition-colors border border-transparent hover:border-brand-100"
                      >
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                          {item.label}
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {item.val}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-6 pb-2 border-b border-brand-50">
                    Interesses e Foco
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {student.hyperfocus.split(",").map((tag, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-brand-50 text-brand-700 font-bold text-xs rounded-xl border border-brand-100 flex items-center gap-2 hover:bg-brand-100 transition-colors"
                      >
                        <Target className="w-3 h-3 text-brand-400" />{" "}
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                  <div className="mt-8 bg-slate-50 p-8 rounded-3xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">
                      Objetivo Pedagógico Primário
                    </p>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                      {student.pedagogicalObjective}
                    </p>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === "relatorios" && (
              <motion.div
                key="relatorios"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="card-soft p-10 min-h-[600px] space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg heading text-slate-900">
                    Registros de Evolução
                  </h4>
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="text-brand-600 text-sm font-bold flex items-center gap-1 hover:underline underline-offset-4"
                  >
                    Adicionar Registro <Plus className="w-4 h-4" />
                  </button>
                </div>

                {reports.length === 0 ? (
                  <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <History className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                    <p className="text-slate-500 font-medium">
                      Nenhum registro encontrado para este aluno.
                    </p>
                    <button
                      onClick={() => setIsReportModalOpen(true)}
                      className="mt-6 text-brand-600 font-bold text-sm"
                    >
                      Começar primeiro registro
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="p-8 border border-brand-100 rounded-3xl hover:border-brand-300 hover:shadow-xl hover:shadow-brand-900/5 transition-all group relative overflow-hidden bg-white"
                      >
                        <div className="flex justify-between items-start mb-8">
                          <div className="flex items-center gap-5">
                            <div className="p-4 bg-brand-50 text-brand-600 rounded-2xl group-hover:bg-brand-600 group-hover:text-white transition-all">
                              <Calendar className="w-7 h-7" />
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-800 text-lg">
                                Acompanhamento Quinzenal
                              </h5>
                              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
                                {new Date(report.date).toLocaleDateString(
                                  "pt-BR",
                                  {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-4 py-1.5 text-[10px] font-bold rounded-full uppercase tracking-widest border shadow-sm ${
                                report.progress === "Evoluindo"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : report.progress === "Estável"
                                    ? "bg-amber-50 text-amber-600 border-amber-100"
                                    : "bg-red-50 text-red-600 border-red-100"
                              }`}
                            >
                              {report.progress}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-50">
                          {[
                            { label: "Comportamento", val: report.behavior },
                            {
                              label: "Participação",
                              val: report.participation,
                            },
                            { label: "Crises", val: report.crises },
                            {
                              label: "Tarefas Pendentes",
                              val: report.pendingTasks,
                            },
                          ].map((item, i) => (
                            <div key={i}>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">
                                {item.label}
                              </p>
                              <p className="text-sm font-bold text-slate-700">
                                {item.val}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-400 italic">
                            Documento assinado digitalmente • Vic IA Validado
                          </p>
                          <button
                            onClick={() => exportReportToPDF(report)}
                            className="text-brand-600 text-xs font-bold flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-xl hover:bg-brand-600 hover:text-white transition-all"
                          >
                            Ver Laudo Completo{" "}
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Resumo Gráfico de Evolução Acadêmica */}
                {reports.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 pt-12 border-t border-brand-50"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h4 className="text-xl heading text-slate-900 mb-1">
                          Análise de Engajamento vs. Progresso
                        </h4>
                        <p className="text-sm text-slate-500 font-medium">
                          Correlação entre tarefas pendentes e nível de
                          desenvolvimento
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-brand-600 rounded-full" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Nível Evolutivo
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-brand-200 rounded-sm" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Pendências
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="h-80 w-full bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={reports
                            .slice()
                            .reverse()
                            .map((r) => ({
                              name: new Date(r.date).toLocaleDateString(
                                "pt-BR",
                                { day: "2-digit", month: "short" },
                              ),
                              progresso:
                                r.progress === "Evoluindo"
                                  ? 85
                                  : r.progress === "Estável"
                                    ? 50
                                    : 25,
                              pendencias:
                                parseInt(r.pendingTasks) ||
                                (r.pendingTasks.includes("Nenhuma") ? 0 : 5),
                            }))}
                          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e2e8f0"
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "#94a3b8",
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          />
                          <YAxis yAxisId="left" hide />
                          <YAxis yAxisId="right" hide />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "1rem",
                              border: "none",
                              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                            }}
                            itemStyle={{ fontSize: "12px", fontWeight: 700 }}
                          />
                          <Bar
                            yAxisId="right"
                            dataKey="pendencias"
                            barSize={40}
                            fill="#cbd5e1"
                            radius={[8, 8, 0, 0]}
                          />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="progresso"
                            stroke="#2c7a7a"
                            strokeWidth={4}
                            dot={{
                              r: 6,
                              fill: "#2c7a7a",
                              strokeWidth: 3,
                              stroke: "#fff",
                            }}
                            activeDot={{ r: 8 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      <div className="p-6 bg-brand-50 rounded-3xl border border-brand-100 flex items-center gap-6">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <CheckCircle2 className="w-6 h-6 text-brand-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1">
                            Taxa de Conclusão
                          </p>
                          <p className="text-xl font-bold text-brand-900">
                            88% das metas atingidas
                          </p>
                        </div>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-6">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <Activity className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                            Consistência
                          </p>
                          <p className="text-xl font-bold text-slate-800">
                            Alta estabilidade comportamental
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === "ia" && (
              <motion.div
                key="ia"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-brand-900 text-white rounded-[2.5rem] p-12 relative overflow-hidden h-full min-h-[600px] flex flex-col"
              >
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                  <Bot className="w-80 h-80" />
                </div>
                <div className="max-w-2xl relative z-10 flex-1">
                  <div className="flex items-center justify-between mb-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-sm">
                      <div className="w-2.5 h-2.5 bg-brand-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                      <span className="text-xs font-bold uppercase tracking-[0.15em] text-brand-300">
                        Inteligência Pedagógica Ativa
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsConfigOpen(true)}
                        className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/10 transition-all shadow-xl"
                        title="Configurações de IA"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                      <button
                        onClick={generateLessonPlan}
                        disabled={isGenerating}
                        className="bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white text-sm font-extrabold px-8 py-4 rounded-2xl flex items-center gap-3 transition-all shadow-2xl shadow-brand-500/40 hover:scale-105 active:scale-95 group"
                      >
                        {isGenerating ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                        )}
                        {generatedPlan
                          ? "Atualizar Orientação"
                          : "Gerar Plano Agora"}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-4xl heading mb-8 text-white flex items-center gap-4">
                    Plano Estratégico Vic IA
                    <Sparkles className="w-8 h-8 text-brand-400 opacity-50" />
                  </h3>

                  {isGenerating ? (
                    <div className="py-24 text-center space-y-6">
                      <div className="relative inline-block">
                        <Loader2 className="w-16 h-16 text-brand-400 animate-spin mx-auto" />
                        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce" />
                      </div>
                      <p className="text-brand-100 text-lg animate-pulse font-medium">
                        A Vic está cruzando o perfil de {student.name} com{" "}
                        {reports.length} relatórios recentes...
                      </p>
                    </div>
                  ) : generatedPlan ? (
                    <div className="space-y-10">
                      <div className="space-y-6">
                        <h5 className="font-bold text-white mb-4 flex items-center gap-2 text-brand-300 uppercase tracking-[0.2em] text-[10px]">
                          <Target className="w-4 h-4" /> Percurso Pedagógico
                        </h5>
                        <div className="grid grid-cols-1 gap-6">
                          {generatedPlan.activities.map((act, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-sm hover:bg-white/10 transition-colors"
                            >
                              <p className="font-bold text-white text-xl mb-3 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm">
                                  {i + 1}
                                </span>
                                {act.title}
                              </p>
                              <p className="text-sm text-brand-100/90 leading-relaxed font-light">
                                {act.content}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
                        <div>
                          <h5 className="font-bold text-brand-300 uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
                            <Settings className="w-4 h-4" /> Personalização
                            Rápida
                          </h5>
                          <div className="grid grid-cols-1 gap-6">
                            <div>
                              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 block">
                                Nível de Detalhamento
                              </label>
                              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                                {["Resumido", "Médio", "Completo"].map(
                                  (level) => (
                                    <button
                                      key={level}
                                      onClick={() =>
                                        setAiConfig((prev) => ({
                                          ...prev,
                                          detailLevel: level,
                                        }))
                                      }
                                      className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
                                        aiConfig.detailLevel === level
                                          ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                                          : "text-white/40 hover:text-white/60"
                                      }`}
                                    >
                                      {level}
                                    </button>
                                  ),
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 block">
                                  Áreas de Foco
                                </label>
                                <div className="flex flex-wrap gap-2">
                                  {aiConfig.focusAreas.map((area) => (
                                    <span
                                      key={area}
                                      className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-bold flex items-center gap-1"
                                    >
                                      <Check className="w-2.5 h-2.5" /> {area}
                                    </span>
                                  ))}
                                  <button
                                    onClick={() => setIsConfigOpen(true)}
                                    className="text-[9px] font-bold text-brand-400 hover:underline"
                                  >
                                    + editar
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 block">
                                  Preferências
                                </label>
                                <div className="flex flex-wrap gap-2">
                                  {aiConfig.activityTypes.map((type) => (
                                    <span
                                      key={type}
                                      className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-bold flex items-center gap-1"
                                    >
                                      <Check className="w-2.5 h-2.5" /> {type}
                                    </span>
                                  ))}
                                  <button
                                    onClick={() => setIsConfigOpen(true)}
                                    className="text-[9px] font-bold text-brand-400 hover:underline"
                                  >
                                    + editar
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center border-l border-white/10 pl-8">
                          <div className="text-center">
                            <Sparkles className="w-12 h-12 text-brand-400 mx-auto mb-4 opacity-50" />
                            <p className="text-xs text-brand-200 mb-6 font-medium">
                              Aplique as mudanças para criar uma nova versão do
                              plano.
                            </p>
                            <button
                              onClick={generateLessonPlan}
                              className="bg-brand-500 hover:bg-brand-400 text-white font-bold px-8 py-3 rounded-xl text-sm shadow-xl shadow-brand-500/30 transition-all flex items-center gap-3 mx-auto"
                            >
                              REGERAR COM IA
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h5 className="font-bold text-white mb-4 flex items-center gap-2 text-brand-300 uppercase tracking-[0.2em] text-[10px]">
                          <Activity className="w-4 h-4" /> Protocolo de
                          Acomodação
                        </h5>
                        <div className="grid grid-cols-1 gap-6">
                          {generatedPlan.sensoryTips.map((tip, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 + i * 0.1 }}
                              className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-sm hover:bg-white/10 transition-colors"
                            >
                              <p className="font-bold text-white text-xl mb-3 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-brand-400" />
                                {tip.title}
                              </p>
                              <p className="text-sm text-brand-100/90 leading-relaxed font-light">
                                {tip.content}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Feedback do Plano */}
                      <div className="mt-12 p-8 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-sm">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                          <div>
                            <h6 className="font-bold text-white text-lg mb-1">
                              Este plano foi útil?
                            </h6>
                            <p className="text-sm text-brand-300 font-medium tracking-wide">
                              Seu feedback ajuda a Vic a entender melhor as
                              necessidades de {student.name}.
                            </p>
                          </div>

                          {planFeedback ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-3 px-6 py-3 bg-brand-500/20 text-brand-400 rounded-2xl border border-brand-500/30"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                              <span className="text-sm font-bold uppercase tracking-widest">
                                Feedback Registrado: {planFeedback}
                              </span>
                            </motion.div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setPlanFeedback("Útil")}
                                className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-emerald-500/20 text-white rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all group"
                              >
                                <ThumbsUp className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold">Útil</span>
                              </button>
                              <button
                                onClick={() => setPlanFeedback("Pouco Útil")}
                                className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-amber-500/20 text-white rounded-xl border border-white/5 hover:border-amber-500/30 transition-all group"
                              >
                                <MinusCircle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold">
                                  Pouco Útil
                                </span>
                              </button>
                              <button
                                onClick={() => setPlanFeedback("Não Útil")}
                                className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-rose-500/20 text-white rounded-xl border border-white/5 hover:border-rose-500/30 transition-all group"
                              >
                                <ThumbsDown className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold">
                                  Não Útil
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-4 pt-4">
                        <button
                          onClick={exportPlanToPDF}
                          className="flex-1 bg-white text-brand-900 font-extrabold py-5 rounded-[1.5rem] hover:bg-brand-50 transition-all flex items-center justify-center gap-3 shadow-xl"
                        >
                          <Download className="w-6 h-6 text-brand-600" />{" "}
                          Exportar em PDF
                        </button>
                        <button
                          onClick={generateLessonPlan}
                          disabled={isGenerating}
                          className="flex-1 bg-brand-500/20 border border-brand-500/30 text-white font-bold py-5 rounded-[1.5rem] hover:bg-brand-500/40 transition-all flex items-center justify-center gap-3"
                        >
                          {isGenerating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Sparkles className="w-5 h-5" />
                          )}
                          Regerar Novo Plano
                        </button>
                        <button
                          onClick={() => setIsShareModalOpen(true)}
                          className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shrink-0"
                        >
                          <Share2 className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      <div className="flex flex-col lg:flex-row gap-12">
                        <div className="flex-1 space-y-8">
                          <p className="text-brand-100 leading-relaxed text-xl font-light">
                            A Vic IA utiliza ciência de dados e princípios da
                            ABA para personalizar cada interação pedagógica.
                          </p>

                          <div className="grid grid-cols-1 gap-8 pt-4">
                            <div>
                              <label className="flex items-center gap-2 text-[10px] font-bold text-brand-400 uppercase tracking-[0.2em] mb-4">
                                <Activity className="w-4 h-4" /> Nível de
                                Detalhamento
                              </label>
                              <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 max-w-sm">
                                {["Resumido", "Médio", "Completo"].map(
                                  (level) => (
                                    <button
                                      key={level}
                                      onClick={() =>
                                        setAiConfig((prev) => ({
                                          ...prev,
                                          detailLevel: level,
                                        }))
                                      }
                                      className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${
                                        aiConfig.detailLevel === level
                                          ? "bg-brand-500 text-white shadow-xl shadow-brand-500/30"
                                          : "text-white/40 hover:text-white/60"
                                      }`}
                                    >
                                      {level}
                                    </button>
                                  ),
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div>
                                <label className="flex items-center gap-2 text-[10px] font-bold text-brand-400 uppercase tracking-[0.2em] mb-4">
                                  <Focus className="w-4 h-4" /> Áreas de Foco
                                  Prioritárias
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                  {[
                                    "Comunicação",
                                    "Socialização",
                                    "Motricidade",
                                    "Acadêmico",
                                  ].map((area) => (
                                    <button
                                      key={area}
                                      onClick={() => {
                                        const newAreas =
                                          aiConfig.focusAreas.includes(area)
                                            ? aiConfig.focusAreas.filter(
                                                (a) => a !== area,
                                              )
                                            : [...aiConfig.focusAreas, area];
                                        setAiConfig((prev) => ({
                                          ...prev,
                                          focusAreas: newAreas,
                                        }));
                                      }}
                                      className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                                        aiConfig.focusAreas.includes(area)
                                          ? "bg-brand-500/20 border-brand-500/50 text-white"
                                          : "bg-white/5 border-white/10 text-white/40 hover:border-brand-500/30"
                                      }`}
                                    >
                                      {area}
                                      {aiConfig.focusAreas.includes(area) && (
                                        <Check className="w-3.5 h-3.5 text-brand-400" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="flex items-center gap-2 text-[10px] font-bold text-brand-400 uppercase tracking-[0.2em] mb-4">
                                  <ListChecks className="w-4 h-4" /> Tipos de
                                  Atividade
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                  {[
                                    "Visual",
                                    "Sensorial",
                                    "Acadêmica",
                                    "Social",
                                    "Lúdica",
                                  ].map((type) => (
                                    <button
                                      key={type}
                                      onClick={() => {
                                        const newTypes =
                                          aiConfig.activityTypes.includes(type)
                                            ? aiConfig.activityTypes.filter(
                                                (t) => t !== type,
                                              )
                                            : [...aiConfig.activityTypes, type];
                                        setAiConfig((prev) => ({
                                          ...prev,
                                          activityTypes: newTypes,
                                        }));
                                      }}
                                      className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                                        aiConfig.activityTypes.includes(type)
                                          ? "bg-emerald-500/20 border-emerald-500/50 text-white"
                                          : "bg-white/5 border-white/10 text-white/40 hover:border-emerald-500/30"
                                      }`}
                                    >
                                      {type}
                                      {aiConfig.activityTypes.includes(
                                        type,
                                      ) && (
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="lg:w-80 bg-white/5 border border-white/10 p-8 rounded-[3rem] text-center backdrop-blur-sm h-fit">
                          <div className="w-20 h-20 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner shadow-brand-500/40">
                            <Bot className="w-10 h-10 text-brand-400" />
                          </div>
                          <h4 className="text-white font-bold text-xl mb-3">
                            Tudo pronto?
                          </h4>
                          <p className="text-brand-200 mb-8 text-sm leading-relaxed">
                            A Vic cruzará estas preferências com o histórico
                            clínico e pedagógico.
                          </p>
                          <button
                            onClick={generateLessonPlan}
                            className="w-full bg-white text-brand-900 font-extrabold py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10 flex items-center justify-center gap-4"
                          >
                            <Sparkles className="w-5 h-5 text-brand-600" />{" "}
                            GERAR AGORA
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "evolucao" && (() => {
              // Dynamic stats and chart data preparation using actual reports
              const sortedReportsLocal = [...reports].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
              
              const chartDataLocal = sortedReportsLocal.map(r => {
                const d = new Date(r.date + "T00:00:00");
                const formattedDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
                
                return {
                  date: formattedDate,
                  "Progresso": mapScoreLocal(r.progress, progressMap, 60),
                  "Comportamento": mapScoreLocal(r.behavior, behaviorMap, 70),
                  "Participação": mapScoreLocal(r.participation, participationMap, 65),
                  "Leitura": mapScoreLocal(r.reading, skillMap, 50),
                  "Escrita": mapScoreLocal(r.writing, skillMap, 50),
                  "Raciocínio": mapScoreLocal(r.logic, skillMap, 50)
                };
              });

              // Growth Calculation based on actual evolution
              let progressDiffText = "0%";
              let isPositiveText = true;
              if (sortedReportsLocal.length >= 2) {
                const firstScore = mapScoreLocal(sortedReportsLocal[0].progress, progressMap, 60);
                const lastScore = mapScoreLocal(sortedReportsLocal[sortedReportsLocal.length - 1].progress, progressMap, 60);
                const diff = lastScore - firstScore;
                progressDiffText = `${diff >= 0 ? "+" : ""}${diff}%`;
                isPositiveText = diff >= 0;
              } else if (sortedReportsLocal.length === 1) {
                const score = mapScoreLocal(sortedReportsLocal[0].progress, progressMap, 60);
                progressDiffText = `${score}%`;
              }

              // Behavior Stability Index (mean score)
              const avgBehaviorLocal = reports.length > 0
                ? Math.round(reports.reduce((acc, r) => acc + mapScoreLocal(r.behavior, behaviorMap, 70), 0) / reports.length)
                : 75;

              // Engagement / Participation Index (mean score)
              const avgParticipationLocal = reports.length > 0
                ? Math.round(reports.reduce((acc, r) => acc + mapScoreLocal(r.participation, participationMap, 65), 0) / reports.length)
                : 70;

              // Reading Mean Score
              const avgReadingLocal = reports.length > 0
                ? Math.round(reports.reduce((acc, r) => acc + mapScoreLocal(r.reading, skillMap, 50), 0) / reports.length)
                : 60;

              // Writing Mean Score
              const avgWritingLocal = reports.length > 0
                ? Math.round(reports.reduce((acc, r) => acc + mapScoreLocal(r.writing, skillMap, 50), 0) / reports.length)
                : 60;

              // Logical Reasoning Mean Score
              const avgLogicLocal = reports.length > 0
                ? Math.round(reports.reduce((acc, r) => acc + mapScoreLocal(r.logic, skillMap, 50), 0) / reports.length)
                : 60;

              return (
                <motion.div 
                  key="evolucao"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="card-soft p-12 min-h-[600px] flex flex-col"
                >
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                     <div>
                       <h4 className="text-xl heading text-slate-900 mb-1">Curva de Evolução</h4>
                       <p className="text-sm text-slate-500 font-medium">Progresso qualitativo mapeado em escala numérica pelos relatórios RPI</p>
                     </div>
                     <div className="flex flex-wrap gap-4 items-center">
                       <div className="flex items-center gap-2">
                         <span className="w-3 h-0.5 bg-brand-600 rounded-full" />
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Painel Interativo</span>
                       </div>
                       {reports.length >= 2 && (
                         <button
                           type="button"
                           onClick={exportEvolutionReportToPDF}
                           disabled={isExportingEvolution}
                           className="flex items-center gap-2 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                         >
                           {isExportingEvolution ? (
                             <>
                               <Loader2 className="w-3.5 h-3.5 animate-spin" />
                               <span>Exportando...</span>
                             </>
                           ) : (
                             <>
                               <Download className="w-3.5 h-3.5" />
                               <span>Exportar PDF</span>
                             </>
                           )}
                         </button>
                       )}
                     </div>
                   </div>

                   {/* Interactive Metrics Selection */}
                   {reports.length >= 2 && (
                     <div className="flex flex-wrap items-center gap-2 bg-slate-50/70 p-2.5 rounded-2xl border border-slate-100/80 mb-6 font-sans">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-2 mr-1">Métricas Visíveis:</span>
                       <div className="flex flex-wrap gap-1.5">
                         {[
                           { id: "progresso", label: "Progresso Geral", color: "bg-teal-500" },
                           { id: "comportamento", label: "Comportamento", color: "bg-blue-500" },
                           { id: "participacao", label: "Participação", color: "bg-amber-500" },
                           { id: "leitura", label: "Leitura", color: "bg-indigo-500" },
                           { id: "escrita", label: "Escrita", color: "bg-pink-500" },
                           { id: "raciocinio", label: "Raciocínio", color: "bg-purple-500" },
                         ].map(metric => {
                           const isSelected = selectedMetrics.includes(metric.id);
                           return (
                             <button
                               key={metric.id}
                               type="button"
                               onClick={() => {
                                 if (isSelected) {
                                   if (selectedMetrics.length > 1) {
                                     setSelectedMetrics(prev => prev.filter(m => m !== metric.id));
                                   }
                                 } else {
                                   setSelectedMetrics(prev => [...prev, metric.id]);
                                 }
                               }}
                               className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                 isSelected 
                                   ? "bg-white text-slate-800 shadow-xs border-slate-200" 
                                   : "bg-transparent text-slate-400 border-transparent hover:text-slate-500 hover:bg-slate-100/50"
                               }`}
                             >
                               <span className={`w-2 h-2 rounded-full ${isSelected ? metric.color : "bg-slate-300"}`} />
                               <span className={`${isSelected ? "text-slate-700 font-bold" : "text-slate-400 font-medium"}`}>{metric.label}</span>
                             </button>
                           );
                         })}
                       </div>
                     </div>
                   )}

                   <div id="evolution-chart-pdf-target" className="w-full h-[400px] bg-white p-2 rounded-2xl mb-4">
                     {reports.length >= 2 ? (
                       <ResponsiveContainer width="100%" height="100%">
                         <ComposedChart
                           data={chartDataLocal}
                           margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                         >
                           <defs>
                             <linearGradient id="colorProg" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#2c7a7a" stopOpacity={0.1}/>
                               <stop offset="95%" stopColor="#2c7a7a" stopOpacity={0}/>
                             </linearGradient>
                             <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                               <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                           <XAxis 
                             dataKey="date" 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                             dy={10}
                           />
                           <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                           <Tooltip 
                             contentStyle={{ 
                               borderRadius: '1rem', 
                               border: 'none', 
                               boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                               padding: '12px 16px'
                             }}
                             itemStyle={{ fontSize: '11px', fontWeight: 700 }}
                             labelStyle={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}
                           />
                           <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '15px' }} />
                           
                           {selectedMetrics.includes("progresso") && (
                             <Area 
                               type="monotone" 
                               name="Progresso"
                               dataKey="Progresso" 
                               stroke="#2c7a7a" 
                               strokeWidth={3}
                               fillOpacity={1} 
                               fill="url(#colorProg)" 
                               animationDuration={1000}
                             />
                           )}
                           {selectedMetrics.includes("comportamento") && (
                             <Area 
                               type="monotone" 
                               name="Comportamento"
                               dataKey="Comportamento" 
                               stroke="#3b82f6" 
                               strokeWidth={3}
                               fillOpacity={1} 
                               fill="url(#colorComp)" 
                               animationDuration={1000}
                             />
                           )}
                           {selectedMetrics.includes("participacao") && (
                             <Line 
                               type="monotone" 
                               name="Participação"
                               dataKey="Participação" 
                               stroke="#f59e0b" 
                               strokeWidth={2.5}
                               dot={{ r: 4 }}
                               activeDot={{ r: 6 }}
                               animationDuration={1000}
                             />
                           )}
                           {selectedMetrics.includes("leitura") && (
                             <Line 
                               type="monotone" 
                               name="Leitura"
                               dataKey="Leitura" 
                               stroke="#6366f1" 
                               strokeWidth={2}
                               strokeDasharray="5 5"
                               dot={false}
                               animationDuration={1000}
                             />
                           )}
                           {selectedMetrics.includes("escrita") && (
                             <Line 
                               type="monotone" 
                               name="Escrita"
                               dataKey="Escrita" 
                               stroke="#ec4899" 
                               strokeWidth={2}
                               strokeDasharray="5 5"
                               dot={false}
                               animationDuration={1000}
                             />
                           )}
                           {selectedMetrics.includes("raciocinio") && (
                             <Line 
                               type="monotone" 
                               name="Raciocínio"
                               dataKey="Raciocínio" 
                               stroke="#a855f7" 
                               strokeWidth={2}
                               strokeDasharray="5 5"
                               dot={false}
                               animationDuration={1000}
                             />
                           )}
                         </ComposedChart>
                       </ResponsiveContainer>
                     ) : (
                       <div className="h-full flex flex-col items-center justify-center text-center space-y-6 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 p-8">
                          <Activity className="w-12 h-12 text-slate-300" />
                          <div>
                            <p className="text-slate-700 font-bold text-base">Registros de Evolução em Elaboração</p>
                            <p className="text-slate-400 max-w-xs mx-auto text-sm mt-1">
                              O aluno possui {reports.length} {reports.length === 1 ? "registro RPI" : "registros RPI"} até agora. São necessários pelo menos 2 registros quinzenais para traçar o gráfico de evolução interativo.
                            </p>
                          </div>
                       </div>
                     )}
                   </div>

                   {reports.length > 0 && (
                     <div className="mt-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                        <div className="p-4 sm:p-5 bg-emerald-50/70 rounded-2xl border border-emerald-100/80 flex flex-col justify-between">
                           <p className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 leading-tight break-words">Crescimento de Foco</p>
                           <p className={`text-2xl font-display font-bold ${isPositiveText ? "text-emerald-700" : "text-amber-700"}`}>
                             {progressDiffText}
                           </p>
                        </div>
                        <div className="p-4 sm:p-5 bg-blue-50/70 rounded-2xl border border-blue-100/80 flex flex-col justify-between">
                           <p className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider mb-1 leading-tight break-words">Estabilidade Comportamental</p>
                           <p className="text-2xl font-display font-bold text-blue-700">{avgBehaviorLocal}%</p>
                        </div>
                        <div className="p-4 sm:p-5 bg-amber-50/70 rounded-2xl border border-amber-100/80 flex flex-col justify-between">
                           <p className="text-[10px] sm:text-xs font-bold text-amber-500 uppercase tracking-wider mb-1 leading-tight break-words">Participação Geral</p>
                           <p className="text-2xl font-display font-bold text-amber-700">{avgParticipationLocal}%</p>
                         </div>
                         <div className="p-4 sm:p-5 bg-indigo-50/70 rounded-2xl border border-indigo-100/80 flex flex-col justify-between">
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1 leading-tight break-words">Desempenho Leitura</p>
                            <p className="text-2xl font-display font-bold text-indigo-700">{avgReadingLocal}%</p>
                         </div>
                         <div className="p-4 sm:p-5 bg-pink-50/70 rounded-2xl border border-pink-100/80 flex flex-col justify-between">
                            <p className="text-[10px] font-bold text-pink-600 uppercase tracking-wider mb-1 leading-tight break-words">Desempenho Escrita</p>
                            <p className="text-2xl font-display font-bold text-pink-700">{avgWritingLocal}%</p>
                         </div>
                         <div className="p-4 sm:p-5 bg-purple-50/70 rounded-2xl border border-purple-100/80 flex flex-col justify-between">
                            <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1 leading-tight break-words flex flex-wrap">Média Raciocínio</p>
                            <p className="text-2xl font-display font-bold text-purple-700">{avgLogicLocal}%</p>
                         </div>
                         <div className="hidden">
                        </div>
                     </div>
                   )}
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-8 h-8 text-brand-600" />
                </div>
                <h3 className="text-2xl heading text-slate-900">
                  Compartilhar Prontuário
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  Selecione como deseja compartilhar o perfil de {student.name}
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copiado para a área de transferência!");
                  }}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-300 hover:bg-brand-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:text-brand-600 transition-colors">
                      <Link className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-800">
                        Copiar Link
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Link direto do prontuário
                      </p>
                    </div>
                  </div>
                  <Copy className="w-5 h-5 text-slate-300 group-hover:text-brand-600 transition-colors" />
                </button>

                <a
                  href={`mailto:?subject=Prontuário Pedagógico: ${student.name}&body=Confira o prontuário pedagógico do aluno ${student.name} no sistema Vic IA: ${window.location.href}`}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-300 hover:bg-brand-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:text-brand-600 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-800">
                        Enviar por E-mail
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Enviar para equipe técnica
                      </p>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-slate-300 rotate-180 group-hover:text-brand-600 transition-colors" />
                </a>
              </div>

              <button
                onClick={() => setIsShareModalOpen(false)}
                className="mt-8 w-full text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
              >
                Fechar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Config Panel */}
      <AnimatePresence>
        {isConfigOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfigOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[3rem] p-12 w-full max-w-2xl shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <Settings className="w-64 h-64 text-brand-600 rotate-12" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-brand-50 rounded-[2rem] flex items-center justify-center text-brand-600 shadow-sm border border-brand-100">
                      <Bot className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl heading text-slate-900">
                        Parâmetros da Vic IA
                      </h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Refine a personalização dos planos
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsConfigOpen(false)}
                    className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors"
                  >
                    <ChevronLeft className="w-7 h-7 rotate-90" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div>
                      <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                        <Activity className="w-4 h-4 text-brand-500" /> Nível de
                        Detalhamento
                      </label>
                      <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        {["Resumido", "Médio", "Completo"].map((level) => (
                          <button
                            key={level}
                            onClick={() =>
                              setAiConfig((prev) => ({
                                ...prev,
                                detailLevel: level,
                              }))
                            }
                            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${
                              aiConfig.detailLevel === level
                                ? "bg-white text-brand-600 shadow-sm border border-brand-100"
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                        <Focus className="w-4 h-4 text-brand-500" /> Áreas de
                        Foco
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          "Comunicação",
                          "Socialização",
                          "Motricidade",
                          "Acadêmico",
                        ].map((area) => (
                          <button
                            key={area}
                            onClick={() => {
                              const newAreas = aiConfig.focusAreas.includes(
                                area,
                              )
                                ? aiConfig.focusAreas.filter((a) => a !== area)
                                : [...aiConfig.focusAreas, area];
                              setAiConfig((prev) => ({
                                ...prev,
                                focusAreas: newAreas,
                              }));
                            }}
                            className={`px-4 py-3 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                              aiConfig.focusAreas.includes(area)
                                ? "bg-brand-50 border-brand-200 text-brand-700"
                                : "bg-white border-slate-100 text-slate-500 hover:border-brand-100"
                            }`}
                          >
                            {area}
                            {aiConfig.focusAreas.includes(area) && (
                              <Check className="w-3 h-3" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                        <ListChecks className="w-4 h-4 text-brand-500" /> Tipos
                        de Atividade
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          "Visual",
                          "Sensorial",
                          "Acadêmica",
                          "Social",
                          "Lúdica",
                        ].map((type) => (
                          <button
                            key={type}
                            onClick={() => {
                              const newTypes = aiConfig.activityTypes.includes(
                                type,
                              )
                                ? aiConfig.activityTypes.filter(
                                    (t) => t !== type,
                                  )
                                : [...aiConfig.activityTypes, type];
                              setAiConfig((prev) => ({
                                ...prev,
                                activityTypes: newTypes,
                              }));
                            }}
                            className={`px-4 py-3 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                              aiConfig.activityTypes.includes(type)
                                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                : "bg-white border-slate-100 text-slate-500 hover:border-brand-100"
                            }`}
                          >
                            {type}
                            {aiConfig.activityTypes.includes(type) && (
                              <Check className="w-3 h-3" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-slate-900 rounded-[2rem] text-white space-y-4">
                      <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                        Dica da Vic
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        As configurações serão aplicadas na próxima geração.
                        Planos detalhados levam mais tempo para serem
                        processados.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-10 border-t border-slate-100 flex justify-end gap-4">
                  <button
                    onClick={() => setIsConfigOpen(false)}
                    className="px-8 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setIsConfigOpen(false);
                      generateLessonPlan();
                    }}
                    className="px-8 py-4 bg-brand-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all active:scale-95"
                  >
                    Salvar e Gerar Novo Plano
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Student Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[3rem] p-10 w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-brand-50 rounded-[1.75rem] flex items-center justify-center text-brand-600 shadow-sm border border-brand-100">
                    <Settings className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl heading text-slate-900">
                      Editar Perfil do Aluno
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                      Atualize os dados cadastrais e interesses de{" "}
                      {student?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors"
                >
                  <ChevronLeft className="w-7 h-7 rotate-90" />
                </button>
              </div>

              {/* Sub-tabs in modal */}
              <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 mb-6 shrink-0">
                {[
                  { id: "pessoal", label: "Dados Pessoais", icon: UserIcon },
                  {
                    id: "diagnostico",
                    label: "Diagnóstico & Apoio",
                    icon: Target,
                  },
                  {
                    id: "comportamento",
                    label: "Comportamento & Sensorial",
                    icon: Activity,
                  },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setEditModalTab(t.id)}
                      className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 relative ${
                        editModalTab === t.id
                          ? "bg-white text-brand-600 shadow-sm border border-brand-100"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Scrollable form body */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-4">
                {editModalTab === "pessoal" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        value={editFormData.name || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Gênero
                      </label>
                      <select
                        value={editFormData.gender || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            gender: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      >
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Idade (anos)
                      </label>
                      <input
                        type="number"
                        value={editFormData.age || 0}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            age: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Série / Ano Escolar
                      </label>
                      <input
                        type="text"
                        value={editFormData.grade || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            grade: e.target.value,
                          }))
                        }
                        placeholder="Ex: 3º Ano B"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Escola
                      </label>
                      <select
                        value={editFormData.schoolId || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            schoolId: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      >
                        <option value="">Selecione uma Escola</option>
                        {schools.map((sch) => (
                          <option key={sch.id} value={sch.id}>
                            {sch.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Período
                      </label>
                      <select
                        value={editFormData.period || "Manhã"}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            period: e.target.value as any,
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      >
                        <option value="Manhã">Manhã</option>
                        <option value="Tarde">Tarde</option>
                        <option value="Integral">Integral</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Nome do Responsável
                      </label>
                      <input
                        type="text"
                        value={editFormData.responsible || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            responsible: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Contato do Responsável
                      </label>
                      <input
                        type="text"
                        value={editFormData.phone || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="Ex: (11) 98765-4321"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Professor(a) Responsável
                      </label>
                      <input
                        type="text"
                        value={editFormData.teacherName || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            teacherName: e.target.value,
                          }))
                        }
                        placeholder="Ex: Ana Souza"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Tempo de Matrícula / Permanência na Instituição
                      </label>
                      <input
                        type="text"
                        value={editFormData.enrolmentTime || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            enrolmentTime: e.target.value,
                          }))
                        }
                        placeholder="Ex: 1 ano e 4 meses"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Data do Último Relatório RPI
                      </label>
                      <input
                        type="date"
                        value={editFormData.lastRpiDate || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            lastRpiDate: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                )}

                {editModalTab === "diagnostico" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Condição de Neurodivergência
                      </label>
                      <select
                        value={editFormData.condition || "TEA"}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            condition: e.target.value as any,
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      >
                        <option value="TEA">TEA (Autismo)</option>
                        <option value="TDAH">
                          TDAH (T. do Déficit de Atenção / Hiperatividade)
                        </option>
                        <option value="TEA + TDAH">
                          Dupla Condição (TEA + TDAH)
                        </option>
                      </select>
                    </div>

                    {(editFormData.condition === "TEA" ||
                      editFormData.condition === "TEA + TDAH" ||
                      !editFormData.condition) && (
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                          Nível de Suporte (TEA)
                        </label>
                        <select
                          value={editFormData.teaLevel || "Leve (Nível 1)"}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              teaLevel: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                        >
                          <option value="Leve (Nível 1)">Leve (Nível 1)</option>
                          <option value="Moderado (Nível 2)">
                            Moderado (Nível 2)
                          </option>
                          <option value="Severo (Nível 3)">
                            Severo (Nível 3)
                          </option>
                        </select>
                      </div>
                    )}

                    {(editFormData.condition === "TDAH" ||
                      editFormData.condition === "TEA + TDAH") && (
                      <>
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                            Subtipo TDAH
                          </label>
                          <select
                            value={
                              editFormData.adhdSubtype || "Misto (Combinado)"
                            }
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                adhdSubtype: e.target.value,
                              }))
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                          >
                            <option value="Predominantemente Desatento">
                              Predominantemente Desatento
                            </option>
                            <option value="Predominantemente Hiperativo-Impulsivo">
                              Predominantemente Hiperativo-Impulsivo
                            </option>
                            <option value="Misto (Combinado)">
                              Misto (Combinado)
                            </option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                            Intensidade do TDAH
                          </label>
                          <select
                            value={editFormData.adhdIntensity || "Moderado"}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                adhdIntensity: e.target.value,
                              }))
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                          >
                            <option value="Leve">Leve</option>
                            <option value="Moderado">Moderado</option>
                            <option value="Grave">Grave</option>
                          </select>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Situação de Cadastro
                      </label>
                      <select
                        value={editFormData.status || "Ativo"}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Laudo Clínico / Código Diagnóstico
                      </label>
                      <input
                        type="text"
                        value={editFormData.diagnosis || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            diagnosis: e.target.value,
                          }))
                        }
                        placeholder="Ex: F84.0 - Autismo Infantil"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Médico / Profissional Responsável
                      </label>
                      <input
                        type="text"
                        value={editFormData.professional || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            professional: e.target.value,
                          }))
                        }
                        placeholder="Ex: Dra. Juliana Santos (Neuropediatra)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Professor de Apoio Exclusivo
                      </label>
                      <select
                        value={editFormData.supportTeacher || "Não"}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            supportTeacher: e.target.value as any,
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      >
                        <option value="Sim">Sim</option>
                        <option value="Não">Não</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Atendimento em Sala de Recursos (AEE)
                      </label>
                      <select
                        value={editFormData.resourceRoom || "Não"}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            resourceRoom: e.target.value as any,
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      >
                        <option value="Sim">Sim</option>
                        <option value="Não">Não</option>
                        <option value="Em avaliação">Em avaliação</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        PEI (Plano de Ensino Individualizado)
                      </label>
                      <select
                        value={editFormData.pei || "Não"}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            pei: e.target.value as any,
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      >
                        <option value="Sim">Sim</option>
                        <option value="Não">Não</option>
                        <option value="Em elaboração">Em elaboração</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Url da Foto do Aluno
                      </label>
                      <input
                        type="text"
                        value={editFormData.photoUrl || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            photoUrl: e.target.value,
                          }))
                        }
                        placeholder="https://exemplo.com/foto.jpg"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                )}

                {editModalTab === "comportamento" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                          Comunicação e Expressão
                        </label>
                        <select
                          value={editFormData.communication || "Fluente"}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              communication: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                        >
                          <option value="Fluente">
                            Fluente / Verbal assertivo
                          </option>
                          <option value="Verbal Limitado">
                            Verbal Limitado / Palavras soltas
                          </option>
                          <option value="Não Verbal">Não Verbal</option>
                          <option value="Usa Comunicação Alternativa">
                            Usa Comunicação Alternativa (PECS/Símbolos)
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                          Tempo médio de foco/atenção
                        </label>
                        <select
                          value={editFormData.attention || "5 a 10 min"}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              attention: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                        >
                          <option value="Menos de 5 min">Menos de 5 min</option>
                          <option value="5 a 10 min">5 a 10 min</option>
                          <option value="10 a 20 min">10 a 20 min</option>
                          <option value="Mais de 20 min">Mais de 20 min</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                          Sensibilidades Sensoriais
                        </label>
                        <input
                          type="text"
                          value={editFormData.sensitivity || ""}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              sensitivity: e.target.value,
                            }))
                          }
                          placeholder="Ex: Som alto, texturas de massinha, toque físico"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                          Frequência/Ocorrência de Crises
                        </label>
                        <select
                          value={editFormData.crises || "Raro"}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              crises: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                        >
                          <option value="Raro">Raro / Sob controle</option>
                          <option value="Semanal">
                            Semanal / Sob desregulações específicas
                          </option>
                          <option value="Diário">Diário</option>
                          <option value="Situações específicas">
                            Situações de estresse ou barulho
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                          Memória de Retenção
                        </label>
                        <select
                          value={editFormData.memory || "Preservada"}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              memory: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                        >
                          <option value="Preservada">Preservada / Ótima</option>
                          <option value="Excelente memória visual">
                            Excelente memória visual
                          </option>
                          <option value="Dificuldade de curto prazo">
                            Dificuldade de curto prazo
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                          Compreensão de Comandos
                        </label>
                        <select
                          value={editFormData.comprehension || "Bom"}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              comprehension: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                        >
                          <option value="Excelente">
                            Excelente / Entendimento imediato
                          </option>
                          <option value="Bom">Bom interativo</option>
                          <option value="Compreende comandos simples">
                            Compreende apenas comandos simples e diretos
                          </option>
                          <option value="Dificuldade em abstrações">
                            Dificuldade em termos abstratos e metáforas
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                          Motricidade
                        </label>
                        <select
                          value={editFormData.motricity || "Bom"}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              motricity: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                        >
                          <option value="Excelente">Excelente</option>
                          <option value="Bom">Bom / Preservada</option>
                          <option value="Dificuldade fina">
                            Dificuldade Fina (Escrita/Segurar lápis)
                          </option>
                          <option value="Dificuldade ampla">
                            Dificuldade Ampla (Corrida/Equilíbrio)
                          </option>
                          <option value="Ambos comprometidos">
                            Ambas com necessidade de terapia
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                          Vínculo com Educador
                        </label>
                        <select
                          value={editFormData.teacherBond || "Sim"}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              teacherBond: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                        >
                          <option value="Forte">Forte / Muito apegado</option>
                          <option value="Sim">Sim / Amigável</option>
                          <option value="Em desenvolvimento">
                            Em desenvolvimento
                          </option>
                          <option value="Dificuldade inicial">
                            Dificuldade em formar vínculo
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                          Desempenho Escolar Atual
                        </label>
                        <select
                          value={editFormData.performance || "Bom"}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              performance: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                        >
                          <option value="Excelente">
                            Excelente / Acima da média
                          </option>
                          <option value="Bom">
                            Bom / Dentro da média esperada
                          </option>
                          <option value="Regular">
                            Regular / Necessita acompanhamento
                          </option>
                          <option value="Abaixo do esperado">
                            Abaixo do esperado / Necessita adaptações
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                          Hiperfoco / Interesses Especiais
                        </label>
                        <input
                          type="text"
                          value={editFormData.hyperfocus || ""}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              hyperfocus: e.target.value,
                            }))
                          }
                          placeholder="Ex: Dinossauros, planetas, trens, números"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Objetivo Pedagógico Dominante
                      </label>
                      <input
                        type="text"
                        value={editFormData.pedagogicalObjective || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            pedagogicalObjective: e.target.value,
                          }))
                        }
                        placeholder="Ex: Desenvolver a socialização com pares e coordenação motora fina na escrita"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Adaptações Curriculares Específicas
                      </label>
                      <input
                        type="text"
                        value={editFormData.adaptations || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            adaptations: e.target.value,
                          }))
                        }
                        placeholder="Ex: Provas orais, tempo estendido, recursos de escrita assistida"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                        Histórico Escolar / Clínico Curto
                      </label>
                      <textarea
                        value={editFormData.academicHistory || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            academicHistory: e.target.value,
                          }))
                        }
                        placeholder="Insira detalhes de diagnósticos anteriores, terapias (fonoaudiologia, TO, ABA) ou escolas passadas..."
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isUpdatingStudent}
                  className="px-8 py-3.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStudent}
                  disabled={isUpdatingStudent}
                  className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-brand-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdatingStudent ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Gravando...
                    </>
                  ) : (
                    "Confirmar Alterações"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Evolution Report Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[2.5rem] p-10 w-full max-w-3xl shadow-2xl overflow-y-auto max-h-[85vh] flex flex-col z-[70]"
            >
              <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                  <h3 className="text-2xl heading text-slate-900">
                    Novo Registro de Evolução
                  </h3>
                  <p className="text-sm text-slate-500 font-medium font-bold">
                    Insira o acompanhamento pedagógico do aluno
                  </p>
                </div>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <form
                onSubmit={handleSubmitReport}
                className="flex-1 overflow-y-auto pr-2 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                      Status do Progresso
                    </label>
                    <select
                      value={reportFormData.progress}
                      onChange={(e) =>
                        setReportFormData((prev) => ({
                          ...prev,
                          progress: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                    >
                      <option value="Evoluindo">Evoluindo</option>
                      <option value="Estável">Estável</option>
                      <option value="Regredindo">Atenção / Regredindo</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block font-sans">
                      Participação em Sala
                    </label>
                    <select
                      value={reportFormData.participation}
                      onChange={(e) =>
                        setReportFormData((prev) => ({
                          ...prev,
                          participation: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                    >
                      <option value="Ativa">Ativa</option>
                      <option value="Parcial">Parcial</option>
                      <option value="Baixa">Baixa</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                      Comportamento Geral
                    </label>
                    <input
                      type="text"
                      value={reportFormData.behavior}
                      onChange={(e) =>
                        setReportFormData((prev) => ({
                          ...prev,
                          behavior: e.target.value,
                        }))
                      }
                      placeholder="Ex: Focado, necessitou de reforço de atenção constante"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                      Frequência/Status de Crises
                    </label>
                    <input
                      type="text"
                      value={reportFormData.crises}
                      onChange={(e) =>
                        setReportFormData((prev) => ({
                          ...prev,
                          crises: e.target.value,
                        }))
                      }
                      placeholder="Ex: Nenhuma, 1 desorganização leve"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block font-sans">
                      Desempenho de Leitura
                    </label>
                    <select
                      value={reportFormData.reading}
                      onChange={(e) =>
                        setReportFormData((prev) => ({
                          ...prev,
                          reading: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                    >
                      <option value="Excelente">
                        Excelente / No Nível esperado
                      </option>
                      <option value="Bom">Bom / Frases simples</option>
                      <option value="Em desenvolvimento">
                        Em desenvolvimento / Iniciando fonemas
                      </option>
                      <option value="Dificuldade acentuada">
                        Dificuldade acentuada
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block font-sans">
                      Desempenho de Escrita
                    </label>
                    <select
                      value={reportFormData.writing}
                      onChange={(e) =>
                        setReportFormData((prev) => ({
                          ...prev,
                          writing: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                    >
                      <option value="Excelente">Excelente / Autônomo</option>
                      <option value="Bom">
                        Bom / Escrita com apoio de gabarito
                      </option>
                      <option value="Em desenvolvimento">
                        Em desenvolvimento / Garatuja ou traçado
                      </option>
                      <option value="Dificuldade acentuada">
                        Dificuldade acentuada
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block font-sans">
                      Raciocínio Lógico
                    </label>
                    <select
                      value={reportFormData.logic}
                      onChange={(e) =>
                        setReportFormData((prev) => ({
                          ...prev,
                          logic: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                    >
                      <option value="Excelente">
                        Excelente / Conceitos abstratos
                      </option>
                      <option value="Bom">
                        Bom / Com apoio de material concreto
                      </option>
                      <option value="Em desenvolvimento">
                        Em desenvolvimento (cores, tamanhos)
                      </option>
                      <option value="Dificuldade acentuada">
                        Dificuldade acentuada
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block font-sans">
                      Tarefas Acadêmicas Pendentes
                    </label>
                    <select
                      value={reportFormData.pendingTasks}
                      onChange={(e) =>
                        setReportFormData((prev) => ({
                          ...prev,
                          pendingTasks: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                    >
                      <option value="Nenhuma">Nenhuma pendência</option>
                      <option value="1 a 2 tarefas">1 a 2 tarefas</option>
                      <option value="3 a 4 tarefas">3 a 4 tarefas</option>
                      <option value="Mais de 5 tarefas">
                        Mais de 5 tarefas pendentes
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                    Dificuldades Observadas / Recomendações
                  </label>
                  <textarea
                    value={reportFormData.difficulties}
                    onChange={(e) =>
                      setReportFormData((prev) => ({
                        ...prev,
                        difficulties: e.target.value,
                      }))
                    }
                    placeholder="Insira observações de desafios do período, foco de hiperfoco integrado, ou dicas de recursos sensoriais..."
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm resize-none"
                    required
                  />
                </div>

                {/* Footer buttons */}
                <div className="pt-6 border-t border-slate-100 flex justify-end gap-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    disabled={isSubmittingReport}
                    className="px-8 py-3.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-brand-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmittingReport ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Adicionar Registro"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
