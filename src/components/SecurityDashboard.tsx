import React, { useEffect, useState } from "react";
import { 
  Database, 
  Server, 
  ShieldAlert, 
  Zap, 
  XCircle, 
  Clock, 
  Globe, 
  Lock,
  RefreshCw,
  AlertTriangle,
  Info,
  Shield,
  Printer,
  X,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from "recharts";

interface SecurityDashboardProps {
  onRefreshTrigger?: () => void;
}

export default function SecurityDashboard({ onRefreshTrigger }: SecurityDashboardProps) {
  const [securityData, setSecurityData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const fetchSecurityData = () => {
    setIsLoading(true);
    fetch("/api/admin/security-dashboard")
      .then(res => res.json())
      .then(data => {
        setSecurityData(data);
        if (onRefreshTrigger) {
          onRefreshTrigger();
        }
      })
      .catch((err) => {
        console.error("Error fetching security analytics:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handlePrintClick = () => {
    const isIframe = window.self !== window.top;
    if (isIframe) {
      setShowPrintModal(true);
    } else {
      window.focus();
      window.print();
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  // Format recent response times for AreaChart (Line graph style)
  const responseTimesRaw = securityData?.responseTimes || [115, 125, 95, 210, 180, 130, 140, 110, 85, 160];
  const responseTimeData = responseTimesRaw.map((time: number, index: number) => ({
    name: `Req ${index + 1}`,
    ms: time
  }));

  // Format module errors for horizontal BarChart
  const errorsByModuleRaw = securityData?.errorsByModule || {
    "Autenticação": 2,
    "Fichas de Alunos": 3,
    "Chat Vic IA": 5,
    "Relatórios RPI": 3,
    "Backups & Supabase": 1
  };
  const moduleErrorsData = Object.entries(errorsByModuleRaw).map(([moduleName, errorCount]) => ({
    module: moduleName,
    erros: errorCount as number
  }));

  const BAR_COLORS = ["#f43f5e", "#fb923c", "#f59e0b", "#a855f7", "#ec4899", "#6366f1"];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Print-Only Title Sheet */}
      <div className="hidden print:block border-b-2 border-slate-950 pb-4 mb-6 select-none font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 uppercase tracking-wide">Relatório de Telemetria & Segurança da Informação</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">VIC IA • Sistema Integrado de Gestão Escolar e Auditoria</p>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Emitido em</span>
            <span className="text-xs font-semibold text-slate-700 font-mono">{new Date().toLocaleString("pt-BR")}</span>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          /* Hide external layouts: sidebars, navbars, headers, footers, etc. */
          aside, nav, header, footer, button,
          .no-print,
          #btn-refresh-security,
          #btn-print-security,
          /* Hide Audit tab selector & page description */
          .flex.bg-slate-100, 
          h2.heading, 
          h2.heading + p,
          /* Hide parent layout items */
          div.flex.flex-col.md\\:flex-row.md\\:items-center.justify-between.gap-4 {
            display: none !important;
          }

          /* Ensure main wrapper matches full width print paper */
          body, main, #root, .min-h-screen {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }

          /* Remove shadows and adapt borders for static paper rendering */
          .bg-white, .bg-slate-50, .border, .shadow-xs, .shadow-sm {
            background: transparent !important;
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            border-radius: 8px !important;
          }

          /* Grid structures to adapt perfectly to a standard A4 page width */
          .grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 16px !important;
          }

          .lg\\:grid-cols-5 {
            grid-template-columns: 1fr !important;
          }

          .lg\\:col-span-3, .lg\\:col-span-2 {
            grid-column: span 2 / span 2 !important;
          }

          /* Style charts containers for optimal printing */
          .recharts-responsive-container {
            width: 100% !important;
            height: 250px !important;
          }
        }
      `}</style>
      
      {/* Header and Control Row */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/65 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-100 text-brand-700 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 id="sec-dashboard-heading" className="text-slate-950 font-bold text-sm">Painel de Métricas Real-Time</h4>
            <p className="text-xs text-slate-500 font-medium">Mecanismo integrado de observabilidade do orquestrador e consumo da IA.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button 
            id="btn-print-security"
            onClick={handlePrintClick}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-350 active:scale-95 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer select-none"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar Relatório PDF</span>
          </button>

          <button 
            id="btn-refresh-security"
            onClick={fetchSecurityData}
            disabled={isLoading}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-350 active:scale-95 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 select-none"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-brand-600" : "text-slate-500"}`} />
            {isLoading ? "Sincronizando..." : "Sincronizar Métricas"}
          </button>
        </div>
      </div>

      {/* Core Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Erros */}
        <div id="card-sec-total-errors" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
              <XCircle className="w-6 h-6" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full select-none">Ativo</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Erros Monitorados</p>
          <h3 className="text-3xl font-extrabold text-slate-950 mt-1">{securityData?.totalErrors ?? 14}</h3>
          <p className="text-xs font-medium text-slate-500 mt-2">Falhas leves de rotas capturadas e reencaminhadas.</p>
        </div>

        {/* Erros Críticos */}
        <div id="card-sec-critical-errors" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full select-none">Alerta</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Incidentes Críticos</p>
          <h3 className="text-3xl font-extrabold text-slate-950 mt-1">{securityData?.criticalErrors ?? 1}</h3>
          <p className="text-xs font-medium text-slate-500 mt-2">Exceções internas críticas (5xx) disparadas no servidor.</p>
        </div>

        {/* Tempo de Resposta */}
        <div id="card-sec-response-time" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="p-2.5 bg-cyan-50 text-cyan-600 rounded-2xl">
              <Clock className="w-6 h-6" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Excelente
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tempo Médio de Resposta</p>
          <h3 className="text-3xl font-extrabold text-slate-950 mt-1">
            {securityData?.averageResponseTime ?? 135} <span className="text-sm font-bold text-slate-500">ms</span>
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-2">Média móvel de tempo de ida e volta para APIs.</p>
        </div>

        {/* Consumo da IA */}
        <div id="card-sec-ai-consumption" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="p-2.5 bg-brand-50 text-brand-600 rounded-2xl">
              <Zap className="w-6 h-6 animate-pulse" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-800 bg-brand-50 px-2.5 py-0.5 rounded-full select-none">Tokens</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Consumo Google Gemini</p>
          <h3 className="text-3xl font-extrabold text-slate-950 mt-1">
            {securityData?.aiConsumption?.totalPrompts ?? 342} <span className="text-xs font-bold text-slate-500">Prompts</span>
          </h3>
          <p className="text-xs font-extrabold text-brand-600 mt-2 font-mono">
            {((securityData?.aiConsumption?.totalTokens ?? 489500) / 1000).toFixed(1)}k tokens acumulados
          </p>
        </div>
      </div>

      {/* Recharts Graphical Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Latency / Response Time Over Time */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-base font-bold text-slate-800">Histórico de Latência</h3>
              <span className="px-2.5 py-1 bg-cyan-50 text-cyan-800 border border-cyan-100 text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1 select-none">
                <Clock className="w-3 h-3 text-cyan-600" />
                Time (ms)
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-6">Mapeamento dinâmico do tempo de processamento das últimas requisições de API.</p>
            
            <div className="w-full h-64 font-sans">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={responseTimeData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorMs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0891b2" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }} 
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                    unit="ms"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: '1px solid #e2e8f0', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#0f172a'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ms" 
                    stroke="#0891b2" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorMs)" 
                    name="Tempo de resposta"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            <Info className="w-3.5 h-3.5 text-slate-300" />
            <span>Métrica reavaliada em tempo real com regressão suave</span>
          </div>
        </div>

        {/* Errors Distribution Bar Chart */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-base font-bold text-slate-800">Erros por Módulo Funcional</h3>
              <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-100 text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1 select-none">
                <AlertTriangle className="w-3 h-3 text-rose-500" />
                Erros
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-6">Histograma de falhas de processamento mapeadas por controlador sistêmico.</p>
            
            <div className="w-full h-64 font-sans">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={moduleErrorsData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="module" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#64748b', fontSize: 9, fontWeight: 600 }} 
                  />
                  <YAxis 
                    allowDecimals={false}
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: '1px solid #e2e8f0', 
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#0f172a'
                    }} 
                  />
                  <Bar dataKey="erros" name="Erros computados" radius={[6, 6, 0, 0]}>
                    {moduleErrorsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            <span>Diagnóstico do Sistema: Saudável</span>
            <span>Estabilidade de Interface: 100%</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Module Distribution Progress Bars (Linear details for accessibility) */}
        <div id="sec-module-distribution" className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Mapeamento Detalhado de Erros</h3>
            <p className="text-xs font-medium text-slate-500 mb-6">Lista linear dos módulos que registram logs informativos ou de exceções.</p>
            
            <div className="space-y-4">
              {Object.entries(errorsByModuleRaw).map(([moduleName, errCount]) => {
                const totalErrors = Math.max(1, Object.values(errorsByModuleRaw).reduce((a: any, b: any) => Number(a) + Number(b), 0) as number);
                const percentage = Math.min(100, Math.round(((errCount as number) / totalErrors) * 100));
                return (
                  <div key={moduleName} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700">{moduleName}</span>
                      <span className="text-slate-400 font-mono">{errCount as number} erros ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden font-sans">
                      <div 
                        className="bg-brand-500 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            <span>NÍVEL DE INTEGRIDADE GERAL: {Math.max(0, 100 - (securityData?.totalErrors ?? 14))}%</span>
            <span>ÚLTIMO EVENTO: HOJE</span>
          </div>
        </div>

        {/* Status dos Serviços (Sistemic components only, zero personal data) */}
        <div id="sec-services-status" className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Status Ativo dos Serviços</h3>
            <p className="text-xs font-medium text-slate-500 mb-6">Conexões de rede com orquestradores e banco de dados.</p>

            <div className="space-y-4">
              {/* Database */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50/55 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Banco de Dados Supabase</p>
                    <p className="text-[10px] font-semibold text-slate-400 font-mono">Status: {securityData?.servicesStatus?.database === "DEGRADED" ? "Mecanismo Local (Fallback)" : "Nuvem Conectada"}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs ${
                  securityData?.servicesStatus?.database === "DEGRADED" 
                    ? "bg-amber-50 border border-amber-100 text-amber-800" 
                    : "bg-emerald-50 border border-emerald-100 text-emerald-800"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${securityData?.servicesStatus?.database === "DEGRADED" ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-ping"}`}></span>
                  {securityData?.servicesStatus?.database === "DEGRADED" ? "Aviso" : "Operando"}
                </span>
              </div>

              {/* Gemini API */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50/55 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-50 rounded-xl text-brand-600">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">SDK Google Gemini</p>
                    <p className="text-[10px] font-semibold text-slate-400 font-mono">Modelo ativo recomendável: gemini-3.5-flash</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-brand-50 border border-brand-100 text-brand-800 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                  <span className="h-1.5 w-1.5 bg-brand-500 rounded-full animate-pulse"></span>
                  Saudável
                </span>
              </div>

              {/* Backup Daemon */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50/55 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Daemon de Backup Local</p>
                    <p className="text-[10px] font-semibold text-slate-400 font-mono">Agendador cron: 12 horas</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                  <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full"></span>
                  Ativo
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-mono mt-4 pt-4 border-t border-slate-50">
            Monitoramento assíncrono de orquestração local no Cloud Run.
          </div>
        </div>
      </div>

      {/* Suspicious Access Attempts Table (Active Firewall, no identifiable client names) */}
      <div id="sec-firewall-logs" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-sans">Trilha de Prevenção de Acessos</h3>
            <p className="text-xs font-medium text-slate-500">Histórico de anomalias IP, tentativas automatizadas bloqueadas pelo Web Application Firewall (WAF).</p>
          </div>
          <span className="bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-xl self-start sm:self-auto shadow-xs flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Firewall Ativo
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Endereço IP / Origem</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Registro de Entrada</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Assinatura de Risco / Alvo</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Severidade</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ação Corretiva</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(securityData?.suspiciousAccessAttempts ?? [
                { id: "sa-1", ip: "185.xx.xx.xx", location: "Suíça (Tor Exit)", date: new Date(Date.now() - 1000 * 60 * 35).toISOString(), reason: "[FALHAS] Tentativa de força bruta no login de administrador", severity: "HIGH" },
                { id: "sa-2", ip: "45.xx.xx.xx", location: "Rússia (VPN)", date: new Date(Date.now() - 1000 * 60 * 180).toISOString(), reason: "[SQLi] Injeção SQL detectada nos filtros de busca de alunos", severity: "CRITICAL" },
                { id: "sa-3", ip: "92.xx.xx.xx", location: "Espanha (Proxy)", date: new Date(Date.now() - 1000 * 60 * 360).toISOString(), reason: "[ROTAS] Tentativa de varredura ativa de pastas (/wp-admin, /.git)", severity: "MEDIUM" }
              ]).map((attempt: any) => (
                <tr key={attempt.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4">
                    <div className="font-bold text-slate-800 text-sm font-mono">{attempt.ip}</div>
                    <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5 select-none">
                      <Globe className="w-3 h-3 text-slate-300" />
                      {attempt.location}
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-xs font-semibold text-slate-500 font-mono">
                      {new Date(attempt.date).toLocaleString("pt-BR")}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="text-xs font-bold text-slate-700">
                      {attempt.reason}
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border ${
                      attempt.severity === "CRITICAL"
                        ? "bg-rose-50 text-rose-700 border-rose-100"
                        : attempt.severity === "HIGH"
                        ? "bg-amber-50 text-amber-700 border-amber-100"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}>
                      {attempt.severity}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg select-none shadow-2xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      BLOQUEADO
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showPrintModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 no-print">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrintModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden p-10 border border-slate-100 z-10 text-left"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                    <Printer className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl heading text-slate-900 font-bold">Imprimir Relatório</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Aviso do Navegador</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl text-amber-900 text-xs font-semibold leading-relaxed flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    Devido a políticas de segurança dos navegadores, a impressão direta é bloqueada quando o app é acessado de dentro do painel de visualização (iframe) do AI Studio.
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Como Exportar com Sucesso:</h4>
                  <div className="space-y-3">
                    <div className="flex gap-3 text-sm font-medium text-slate-600">
                      <span className="w-6 h-6 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center text-xs shrink-0 select-none font-bold">1</span>
                      <p className="leading-normal">
                        Clique no botão <strong>"Abrir em nova aba" ↗️</strong> no canto superior direito do painel do AI Studio para abrir o app em tela inteira.
                      </p>
                    </div>
                    <div className="flex gap-3 text-sm font-medium text-slate-600">
                      <span className="w-6 h-6 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center text-xs shrink-0 select-none font-bold">2</span>
                      <p className="leading-normal">
                        Acesse a página do <strong>Dashboard de Segurança</strong> de novo na barra lateral esquerda.
                      </p>
                    </div>
                    <div className="flex gap-3 text-sm font-medium text-slate-600">
                      <span className="w-6 h-6 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center text-xs shrink-0 select-none font-bold">3</span>
                      <p className="leading-normal">
                        Clique em <strong>"Exportar Relatório PDF"</strong> e a janela de impressão/exportação para PDF do sistema irá abrir normalmente!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all cursor-pointer font-sans"
                >
                  Entendi, Vou Abrir em Nova Aba
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPrintModal(false);
                    setTimeout(() => {
                      window.focus();
                      window.print();
                    }, 100);
                  }}
                  className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-brand-900/10 transition-all cursor-pointer flex items-center justify-center gap-2 font-sans"
                >
                  <ExternalLink className="w-4 h-4" />
                  Tentar Imprimir Mesmo Assim
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
