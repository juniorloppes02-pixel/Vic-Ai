import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  Calendar, 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  Activity,
  Users,
  Award
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  Legend,
  Cell
} from "recharts";
import { Student, Report } from "../types";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function EvolutionReports() {
  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [timeRange, setTimeRange] = useState("3m"); // 1m, 3m, 6m, 1y

  useEffect(() => {
    fetch("/api/admin/students")
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(err => console.error("Erro ao buscar alunos:", err));

    fetch("/api/admin/reports")
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(err => console.error("Erro ao buscar relatórios:", err));
  }, []);

  const progressMap = { "excelente": 100, "evoluindo": 80, "estável": 60, "estavel": 60, "alerta": 30 };
  const behaviorMap = { "muito calmo": 100, "calmo": 80, "agitado": 50, "crise": 20 };
  const participationMap = { "muito ativa": 100, "muito ativo": 100, "ativa": 80, "ativo": 80, "passiva": 40, "passivo": 40, "nula": 10, "nulo": 10 };
  const skillMap = { "ótimo": 100, "otimo": 100, "bom": 80, "regular": 50, "em progresso": 60, "fraco": 20 };

  const mapScore = (value: string | undefined, mapping: Record<string, number>, defaultValue = 50): number => {
    if (!value) return defaultValue;
    const normalized = value.trim().toLowerCase();
    for (const key of Object.keys(mapping)) {
      if (normalized.includes(key)) {
        return mapping[key];
      }
    }
    return defaultValue;
  };

  const getWidthClass = (score: number) => {
    if (score >= 90) return "w-full";
    if (score >= 75) return "w-3/4";
    if (score >= 50) return "w-1/2";
    if (score >= 25) return "w-1/4";
    return "w-1/12";
  };

  const getProgressStyles = (progress: string) => {
    const p = progress.trim().toLowerCase();
    if (p.includes("excelente") || p === "evoluindo") {
      return { text: "text-emerald-700 bg-emerald-50 border-emerald-200", bg: "bg-emerald-500 font-bold" };
    }
    if (p.includes("estável") || p.includes("estavel")) {
      return { text: "text-amber-700 bg-amber-50 border-amber-200", bg: "bg-amber-500 font-bold" };
    }
    return { text: "text-rose-700 bg-rose-50 border-rose-200", bg: "bg-rose-500 font-bold" };
  };

  // Filter and sort reports
  const filteredReports = reports.filter(r => {
    if (selectedStudent !== "all") {
      return r.studentId === selectedStudent || String(r.studentId) === String(selectedStudent);
    }
    return true;
  });

  const sortedReportsByDate = [...filteredReports].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Filter reports by timeRange using "2026-06-14" as a base date
  const timeFilteredReports = sortedReportsByDate.filter(r => {
    const nowLocalDate = new Date("2026-06-14");
    const reportDate = new Date(r.date + "T00:00:00");
    const diffMs = nowLocalDate.getTime() - reportDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (timeRange === "1m") return diffDays <= 30 && diffDays >= -5;
    if (timeRange === "3m") return diffDays <= 90 && diffDays >= -5;
    if (timeRange === "6m") return diffDays <= 180 && diffDays >= -5;
    return true; // 1y or more
  });

  // Convert timeFilteredReports to Chart data
  const chartData = timeFilteredReports.map(r => {
    const d = new Date(r.date + "T00:00:00");
    const formattedDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    
    const progresso = mapScore(r.progress, progressMap, 60);
    const comportamento = mapScore(r.behavior, behaviorMap, 70);
    const participacao = mapScore(r.participation, participationMap, 60);
    const leitura = mapScore(r.reading, skillMap, 50);
    const escrita = mapScore(r.writing, skillMap, 50);
    const raciocinio = mapScore(r.logic, skillMap, 50);

    return {
      name: formattedDate,
      date: r.date,
      progresso,
      comportamento,
      participacao,
      leitura,
      escrita,
      raciocinio,
      report: r
    };
  });

  const finalChartData = chartData.length > 0 ? chartData : [
    { name: 'Sem dados', progresso: 50, comportamento: 50, participacao: 50, leitura: 50, escrita: 50, raciocinio: 50 }
  ];

  // Calculate dynamic stats cards
  let averageGrowthValue = "+0%";
  let averageGrowthTrend: "up" | "down" = "up";
  if (chartData.length >= 2) {
    const firstScore = chartData[0].progresso;
    const lastScore = chartData[chartData.length - 1].progresso;
    const diff = lastScore - firstScore;
    averageGrowthValue = `${diff >= 0 ? '+' : ''}${Math.round(diff)}%`;
    averageGrowthTrend = diff >= 0 ? "up" : "down";
  } else if (chartData.length === 1) {
    averageGrowthValue = `${Math.round(chartData[0].progresso)}%`;
  } else {
    averageGrowthValue = "0%";
  }

  let avgBehavior = 0;
  if (chartData.length > 0) {
    const sum = chartData.reduce((acc, curr) => acc + curr.comportamento, 0);
    avgBehavior = Math.round(sum / chartData.length);
  } else {
    avgBehavior = 75; // default fallback
  }

  let avgParticipation = 0;
  if (chartData.length > 0) {
    const sum = chartData.reduce((acc, curr) => acc + curr.participacao, 0);
    avgParticipation = Math.round(sum / chartData.length);
  } else {
    avgParticipation = 80;
  }

  const stats = [
    { label: "Crescimento de Foco", value: averageGrowthValue, trend: averageGrowthTrend, icon: TrendingUp, color: "emerald" },
    { label: "Estabilidade Comportamental", value: `${avgBehavior}%`, trend: avgBehavior >= 70 ? "up" : "down", icon: Activity, color: "brand" },
    { label: "Participação Média", value: `${avgParticipation}%`, trend: 'up', icon: Target, color: "amber" },
    { label: "Relatórios RPI", value: String(filteredReports.length), trend: 'up', icon: Award, color: "indigo" },
  ];

  const exportDataToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      const student = selectedStudent !== "all" 
        ? students.find(s => s.id === selectedStudent || String(s.id) === String(selectedStudent))
        : null;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(44, 122, 122); // brand-600
      
      if (student) {
        doc.text(`Relatório de Evolução - ${student.name}`, 14, 25);
      } else {
        doc.text("Relatório Geral de Evolução dos Alunos", 14, 25);
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184); // slate-400
      const currentDate = new Date().toLocaleDateString("pt-BR");
      const currentTime = new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
      doc.text(`Documento gerado em: ${currentDate} às ${currentTime}`, 14, 32);

      let currentY = 40;

      doc.setDrawColor(241, 245, 249); 
      doc.setFillColor(248, 250, 252); 
      doc.roundedRect(14, currentY, pageWidth - 28, 24, 3, 3, 'F');

      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85); // slate-700
      
      if (student) {
        doc.setFont("helvetica", "bold");
        doc.text(`Aluno: ${student.name}`, 18, currentY + 8);
        doc.setFont("helvetica", "normal");
        doc.text(`Condição: ${student.condition || "TEA"}`, 18, currentY + 16);
        doc.text(`Nível: Nível ${student.teaLevel || "Não informado"}`, 100, currentY + 16);
        doc.text(`Idade: ${student.age ? `${student.age} anos` : "Não informada"}`, 160, currentY + 16);
      } else {
        doc.setFont("helvetica", "bold");
        doc.text(`Filtro Aplicado: Todos os Alunos`, 18, currentY + 8);
        doc.setFont("helvetica", "normal");
        doc.text(`Período do Relatório: ${timeRange === "1m" ? "Último mês" : timeRange === "3m" ? "Últimos 3 meses" : timeRange === "6m" ? "Últimos 6 meses" : "Todo o período"}`, 18, currentY + 16);
        doc.text(`Total de Relatórios: ${timeFilteredReports.length}`, 120, currentY + 16);
      }

      currentY += 34;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(44, 122, 122);
      doc.text("Resumo de Indicadores Médios", 14, currentY);
      currentY += 6;

      const kpiColumns = ["Indicador", "Média / Status"];
      
      const growthLabel = "Crescimento de Foco";
      const growthValue = averageGrowthValue;

      const behaviorLabel = "Estabilidade Comportamental";
      const behaviorValue = `${avgBehavior}%`;

      const participationLabel = "Participação Média";
      const participationValue = `${avgParticipation}%`;

      let avgReadingVal = 0;
      let avgWritingVal = 0;
      let avgLogicVal = 0;

      if (timeFilteredReports.length > 0) {
        avgReadingVal = Math.round(timeFilteredReports.reduce((acc, r) => acc + mapScore(r.reading, skillMap, 50), 0) / timeFilteredReports.length);
        avgWritingVal = Math.round(timeFilteredReports.reduce((acc, r) => acc + mapScore(r.writing, skillMap, 50), 0) / timeFilteredReports.length);
        avgLogicVal = Math.round(timeFilteredReports.reduce((acc, r) => acc + mapScore(r.logic, skillMap, 50), 0) / timeFilteredReports.length);
      } else {
        avgReadingVal = 50;
        avgWritingVal = 50;
        avgLogicVal = 50;
      }

      const kpiRows = [
        [growthLabel, growthValue],
        [behaviorLabel, behaviorValue],
        [participationLabel, participationValue],
        ["Desempenho Médio de Leitura", `${avgReadingVal}%`],
        ["Desempenho Médio de Escrita", `${avgWritingVal}%`],
        ["Média de Raciocínio Lógico", `${avgLogicVal}%`]
      ];

      autoTable(doc, {
        startY: currentY,
        head: [kpiColumns],
        body: kpiRows,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 4.5 },
        headStyles: { fillColor: [44, 122, 122], fontStyle: 'bold' },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 100 },
          1: { cellWidth: 70 }
        },
        margin: { left: 14, right: 14 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 12;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(44, 122, 122);
      doc.text("Detalhamento dos Registros de Evolução", 14, currentY);
      currentY += 6;

      const detailedColumns = student 
        ? ["Data", "Progresso Recorrente", "Comportamento", "Participação", "Dificuldades / Observações"]
        : ["Aluno", "Data", "Progresso", "Comportamento", "Participação", "Leitura", "Escrita", "Raciocínio"];

      const detailedRows = timeFilteredReports.map(r => {
        const studentName = students.find(s => s.id === r.studentId || String(s.id) === String(r.studentId))?.name || "Aluno Demo";
        const formattedDate = (() => {
          try {
            return new Date(r.date + "T00:00:00").toLocaleDateString('pt-BR');
          } catch {
            return r.date;
          }
        })();

        if (student) {
          return [
            formattedDate,
            r.progress,
            r.behavior,
            r.participation,
            r.difficulties || "Nenhuma dificuldade registrada"
          ];
        } else {
          return [
            studentName,
            formattedDate,
            r.progress,
            r.behavior,
            r.participation,
            r.reading || "N/A",
            r.writing || "N/A",
            r.logic || "N/A"
          ];
        }
      });

      autoTable(doc, {
        startY: currentY,
        head: [detailedColumns],
        body: detailedRows,
        theme: 'striped',
        styles: { fontSize: 8.5, cellPadding: 4 },
        headStyles: { fillColor: [15, 23, 42], fontStyle: 'bold' },
        columnStyles: student ? {
          0: { cellWidth: 22, fontStyle: 'bold' },
          1: { cellWidth: 33 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 67 }
        } : {
          0: { cellWidth: 35, fontStyle: 'bold' },
          1: { cellWidth: 20 },
          2: { cellWidth: 22 },
          3: { cellWidth: 22 },
          4: { cellWidth: 22 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
          7: { cellWidth: 21 }
        },
        margin: { left: 14, right: 14 },
      });

      const filename = student 
        ? `evolucao_${student.name.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`
        : `relatorio_evolucao_geral_${new Date().toISOString().slice(0, 10)}.pdf`;

      doc.save(filename);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
    }
  };

  // Table sorted descending
  const lastReportsForTable = [...filteredReports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header com Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl heading text-slate-900">Relatórios de Evolução</h1>
          <p className="text-slate-500 font-medium">Acompanhamento analítico multivariado do desenvolvimento</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
            <select 
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="has-icon pl-12 pr-8 py-3 bg-white border border-brand-100 rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-brand-500/10 transition-all appearance-none outline-none"
            >
              <option value="all">Todos os Alunos</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex bg-white p-1 rounded-2xl border border-brand-100 shadow-sm">
            {['1m', '3m', '6m', '1y'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                  timeRange === range ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button 
            id="btn-export-evolution-data"
            onClick={exportDataToPDF}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
          >
            <Download className="w-4 h-4" /> Exportar Dados
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-brand-200 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${
                stat.trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend === 'up' ? "+2.4%" : "-1.2%"}
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Progression Area Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl heading text-slate-900">Histórico de Progresso Acadêmico</h3>
              <p className="text-sm text-slate-500 font-medium">Médias ponderadas por categoria de objetivo pedagógico</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-brand-600 rounded-full" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Evolução</span>
              </div>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={finalChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2c7a7a" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2c7a7a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="progresso" 
                  stroke="#2c7a7a" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorProg)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Behavioral Distribution */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
        >
          <h3 className="text-xl heading text-slate-900 mb-2">Comportamento</h3>
          <p className="text-sm text-slate-500 font-medium mb-8">Distribuição mensal do estado emocional</p>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finalChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="comportamento" radius={[6, 6, 0, 0]}>
                  {finalChartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2c7a7a' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Insights Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-brand-50 flex items-center justify-between">
          <div>
            <h3 className="text-xl heading text-slate-900">Análise de Marcos de Desenvolvimento</h3>
            <p className="text-sm text-slate-500 font-medium">Últimos marcos validados pela equipe e IA</p>
          </div>
          <button className="text-brand-600 font-bold text-sm hover:underline">Ver Histórico Completo</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Estudante</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Data</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Categoria</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Desempenho</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Progresso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lastReportsForTable.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-8 text-center text-slate-400 font-medium">
                    Nenhum relatório RPI registrado para o aluno selecionado no período.
                  </td>
                </tr>
              ) : (
                lastReportsForTable.slice(0, 10).map((report, idx) => {
                  const student = students.find(s => s.id === report.studentId || String(s.id) === String(report.studentId));
                  const formattedDate = (() => {
                    try {
                      return new Date(report.date + "T00:00:00").toLocaleDateString('pt-BR');
                    } catch {
                      return report.date;
                    }
                  })();
                  const progScore = mapScore(report.progress, progressMap, 60);
                  const progressWidthClass = getWidthClass(progScore);
                  const statusStyle = getProgressStyles(report.progress);

                  return (
                    <tr key={report.id || idx} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-[10px] font-bold">
                            {student?.name ? student.name.charAt(0) : "A"}
                          </div>
                          <span className="text-sm font-bold text-slate-700">{student?.name || "Aluno Demo"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-slate-500">{formattedDate}</td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {student?.condition || "TEA"}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full bg-brand-600 rounded-full ${progressWidthClass}`} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{progScore}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border ${statusStyle.text}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.bg}`} />
                          {report.progress}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
