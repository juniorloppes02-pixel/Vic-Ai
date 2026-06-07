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
  Save
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { useAuth } from "../App";
import jsPDF from "jspdf";
import ReactMarkdown from "react-markdown";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
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

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          ...history,
          { role: "user", parts: [{ text: input }] }
        ],
        config: {
          systemInstruction: `Você é Vic, uma assistente pedagógica altamente capacitada e especializada em educação especial inclusiva, com foco dedicado ao Transtorno do Espectro Autista (TEA) e ao Transtorno do Déficit de Atenção com Hiperatividade (TDAH). 
          Seu objetivo é apoiar professores, coordenadores e equipe pedagógica na criação de estratégias adaptadas, planos de aula estruturados, PAEE e na compreensão de dinâmicas comportamentais e socioemocionais.
          Sempre mantenha um tom acolhedor, altamente profissional, empático e pautado em evidências científicas de inclusão (como análise do comportamento aplicada e práticas baseadas em neurodiversidade). 
          Ao responder sobre TEA, aborde níveis de suporte, previsibilidade visual, rotinas e sensibilidades sensoriais. Ao responder sobre TDAH, traga estratégias para manter o foco, quebra de tarefas complexas, pausas ativas e diminuição de distratores de ambiente.
          Use uma linguagem clara, inspiradora, prática e bem estruturada. Evite dar diagnósticos de ordem médica, focando puramente no auxílio e modelagem pedagógicos.`
        }
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: response.text || "Desculpe, não consegui processar sua solicitação agora.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
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
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(44, 122, 122); // brand-600
        doc.text("•", 20, y + 4.5);
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
        doc.text("VIC IA • ASSISTENTE PEDAGÓGICA DE EDUCAÇÃO INCLUSIVA", 20, 24);
      }

      // Page Footer (on ALL pages)
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.3);
      doc.line(20, 280, 190, 280);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text("Plano de Aula Personalizado • Gerado por Vic IA", 20, 286);
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
    <div className={`max-w-5xl mx-auto h-[calc(100vh-160px)] flex flex-col ${isExpanded ? 'fixed inset-0 z-50 max-w-none bg-brand-50 p-8 h-screen' : ''}`}>
      {/* Header */}
      <div className="bg-white rounded-t-[2.5rem] p-6 border-b border-brand-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl heading text-slate-900 flex items-center gap-2">
              Chat com Vic IA
              <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sua assistente pedagógica inclusiva</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button 
              onClick={clearChat}
              className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              title="Limpar conversa"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-3 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
          >
            {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-white p-8 space-y-6 scrollbar-hide">
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
              <div className={`max-w-[80%] p-5 rounded-[1.5rem] shadow-sm ${
                message.role === "user" 
                  ? "bg-slate-900 text-white rounded-tr-none" 
                  : "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100"
              }`}>
                <div className="text-sm leading-relaxed font-sans markdown-content whitespace-pre-line">
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </div>
                
                {message.role === "model" && message.id !== "welcome-message" && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200/60">
                    <button 
                      onClick={() => exportToPDF(message.text)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      PDF
                    </button>
                    <button 
                      onClick={() => savePlanToDB(message.text)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      SALVAR
                    </button>
                  </div>
                )}
                
                <p className={`text-[10px] mt-2 font-bold uppercase opacity-40 ${message.role === "user" ? "text-right" : ""}`}>
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
              <div className="bg-slate-50 p-5 rounded-[1.5rem] rounded-tl-none border border-slate-100">
                <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
              </div>
            </div>
          )}

          {messages.length === 1 && (
            <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-4 py-8 border-t border-brand-50 mt-8">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sugestões de temas</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Adaptações para TEA Nível 1, 2 e 3",
                  "Estratégias de foco para TDAH",
                  "Como criar previsibilidade na rotina",
                  "Manejo de crises sensoriais",
                  "Atividades para TEA e TDAH combinados"
                ].map(suggestion => (
                  <button 
                    key={suggestion}
                    type="button"
                    onClick={() => setInput(suggestion)}
                    className="px-4 py-2 bg-slate-50 hover:bg-brand-50 hover:border-brand-200 border border-slate-100 rounded-full text-xs font-bold text-slate-600 transition-all cursor-pointer"
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
      <div className="bg-white rounded-b-[2.5rem] p-6 border-t border-brand-50">
        <form onSubmit={handleSend} className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua dúvida pedagógica aqui..."
            className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-6 pr-16 text-sm font-medium focus:ring-2 focus:ring-brand-500/20 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-500 disabled:opacity-50 transition-all shadow-lg shadow-brand-600/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-[10px] text-center mt-4 text-slate-400 font-bold uppercase tracking-widest">
          Vic IA pode cometer erros. Verifique informações importantes.
        </p>
      </div>
    </div>
  );
}
