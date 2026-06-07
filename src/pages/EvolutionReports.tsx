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

export default function EvolutionReports() {
  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [timeRange, setTimeRange] = useState("3m"); // 1m, 3m, 6m, 1y

  useEffect(() => {
    // Simulação de busca de dados
    fetch("/api/admin/students").then(res => res.json()).then(data => setStudents(data));
    
    // Gerando dados mockados baseados nos relatórios existentes
    const mockReports: Report[] = [
      { id: '1', studentId: '1', date: '2024-01-10', progress: 'Evoluindo', behavior: 'Calmo', participation: 'Ativo', pendingTasks: 'Nenhuma', difficulties: 'Foco inicial', crises: 'Não', reading: 'Bom', writing: 'Em progresso', logic: 'Bom' },
      { id: '2', studentId: '1', date: '2024-02-15', progress: 'Evoluindo', behavior: 'Agitado', participation: 'Ativo', pendingTasks: '1 lição', difficulties: 'Barulho excessivo', crises: 'Sim', reading: 'Bom', writing: 'Bom', logic: 'Ótimo' },
      { id: '3', studentId: '1', date: '2024-03-20', progress: 'Evoluindo', behavior: 'Calmo', participation: 'Muito Ativo', pendingTasks: 'Nenhuma', difficulties: 'Nenhuma', crises: 'Não', reading: 'Ótimo', writing: 'Ótimo', logic: 'Ótimo' },
      { id: '4', studentId: '2', date: '2024-01-12', progress: 'Estável', behavior: 'Calmo', participation: 'Passivo', pendingTasks: '2 lições', difficulties: 'Socialização', crises: 'Não', reading: 'Regular', writing: 'Regular', logic: 'Bom' },
      { id: '5', studentId: '2', date: '2024-02-18', progress: 'Evoluindo', behavior: 'Calmo', participation: 'Ativo', pendingTasks: 'Nenhuma', difficulties: 'Interação', crises: 'Não', reading: 'Bom', writing: 'Regular', logic: 'Bom' },
      { id: '6', studentId: '3', date: '2024-03-05', progress: 'Em Alerta', behavior: 'Crise', participation: 'Nula', pendingTasks: 'Todas', difficulties: 'Hipersensibilidade', crises: 'Sim', reading: 'N/A', writing: 'N/A', logic: 'N/A' },
    ];
    setReports(mockReports);
  }, []);

  const stats = [
    { label: "Crescimento Médio", value: "+12%", trend: "up", icon: TrendingUp, color: "emerald" },
    { label: "Estabilidade Emocional", value: "78%", trend: "up", icon: Activity, color: "brand" },
    { label: "Conclusão de Metas", value: "85%", trend: "down", icon: Target, color: "amber" },
    { label: "Marcos Alcançados", value: "24", trend: "up", icon: Award, color: "indigo" },
  ];

  const chartData = [
    { name: 'Jan', progresso: 65, comportamento: 40, participacao: 55 },
    { name: 'Fev', progresso: 59, comportamento: 48, participacao: 62 },
    { name: 'Mar', progresso: 80, comportamento: 65, participacao: 75 },
    { name: 'Abr', progresso: 81, comportamento: 75, participacao: 80 },
    { name: 'Mai', progresso: 56, comportamento: 45, participacao: 50 },
    { name: 'Jun', progresso: 55, comportamento: 50, participacao: 70 },
    { name: 'Jul', progresso: 40, comportamento: 55, participacao: 85 },
  ];

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
          <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
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
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <BarChart data={chartData}>
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
                  {chartData.map((_entry, index) => (
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
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Progresso</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.slice(0, 5).map((report, idx) => {
                const student = students.find(s => s.id === report.studentId);
                return (
                  <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-[10px] font-bold">
                          {student?.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{student?.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-500">{new Date(report.date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">Socialização</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full bg-brand-600 rounded-full w-[${idx * 15 + 40}%]`} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{idx * 15 + 40}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
                        report.progress === 'Evoluindo' ? "text-emerald-600" : "text-amber-600"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${report.progress === 'Evoluindo' ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {report.progress}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
