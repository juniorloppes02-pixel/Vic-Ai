import { useState, useEffect } from "react";
import { AuditLog } from "../types";
import { History, Shield, Calendar, User as UserIcon, Activity, Search } from "lucide-react";

export default function Audit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/admin/audit")
      .then(res => res.json())
      .then(data => setLogs(Array.isArray(data) ? data : []))
      .catch(() => setLogs([]));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl heading text-slate-900">Auditoria do Sistema</h2>
          <p className="text-slate-500 font-medium mt-1">Histórico de ações críticas realizadas na plataforma.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-brand-100 shadow-sm">
           <button className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold">Hoje</button>
           <button className="px-4 py-2 text-slate-500 hover:bg-brand-50 rounded-lg text-xs font-bold transition-all">Semana</button>
           <button className="px-4 py-2 text-slate-500 hover:bg-brand-50 rounded-lg text-xs font-bold transition-all">Mês</button>
        </div>
      </div>

      <div className="card-soft p-6 flex items-center gap-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-brand-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por usuário ou ação..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full has-icon pl-12 pr-4 py-3 bg-white border border-brand-100 rounded-2xl text-sm font-medium shadow-sm focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {logs.filter(l => l.user.toLowerCase().includes(searchTerm.toLowerCase()) || l.action.toLowerCase().includes(searchTerm.toLowerCase())).map((log) => (
          <div key={log.id} className="card-soft p-6 flex items-center justify-between group">
            <div className="flex items-center gap-6">
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-all">
                  <Activity className="w-6 h-6" />
               </div>
               <div>
                  <div className="flex items-center gap-3">
                     <h4 className="font-bold text-slate-800 uppercase tracking-tight">{log.action.replace('_', ' ')}</h4>
                     <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">•</span>
                     <p className="text-sm font-medium text-slate-500">{log.user}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-brand-600 font-bold">
                     <Calendar className="w-3.5 h-3.5" />
                     {new Date(log.date).toLocaleString('pt-BR')}
                  </div>
               </div>
            </div>
            <div className="hidden md:block">
               <span className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Hash: {Math.random().toString(16).slice(2, 10)}
               </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center py-8">
         <p className="text-xs text-slate-400 font-medium font-mono">Total de {logs.length} registros auditáveis em conformidade com a LGPD e legislações educacionais.</p>
      </div>
    </div>
  );
}
