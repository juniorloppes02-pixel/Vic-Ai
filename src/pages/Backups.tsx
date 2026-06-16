import { useState, useEffect } from "react";
import { BackupLog } from "../types";
import { 
  Database, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Cpu,
  Server,
  Calendar
} from "lucide-react";

export default function Backups() {
  const [backups, setBackups] = useState<BackupLog[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupMessage, setBackupMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch backup logs
  const fetchBackupLogs = () => {
    fetch("/api/admin/backups")
      .then(res => res.json())
      .then(data => setBackups(Array.isArray(data) ? data : []))
      .catch(() => setBackups([]));
  };

  useEffect(() => {
    fetchBackupLogs();
  }, []);

  // Handle Manual Backup submission
  const handleManualBackup = async () => {
    setIsBackingUp(true);
    setBackupMessage(null);
    try {
      const res = await fetch("/api/admin/backups", {
        method: "POST"
      });
      const data = await res.json();
      if (data && data.status === "SUCCESS") {
        setBackupMessage({
          type: "success",
          text: `Backup MANUAL gerado com sucesso! ${data.recordsCount.students} alunos, ${data.recordsCount.teachers} professores e ${data.recordsCount.reports} relatórios RPI foram salvos.`
        });
        fetchBackupLogs();
      } else {
        setBackupMessage({
          type: "error",
          text: `Falha ao executar backup: ${data.errorMessage || "Erro desconhecido."}`
        });
      }
    } catch (err: any) {
      setBackupMessage({
        type: "error",
        text: `Erro ao conectar com o servidor: ${err.message || String(err)}`
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  // Download Backup JSON file
  const handleDownloadBackup = (backup: BackupLog) => {
    try {
      const dataStr = backup.payload;
      if (!dataStr) {
        alert("Nenhum dado encontrado neste backup.");
        return;
      }
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `backup_vic_ia_${backup.id}_${backup.date.split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      alert("Erro ao exportar o arquivo JSON de backup.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl heading text-slate-900">Backups Automáticos</h2>
        <p className="text-slate-500 font-medium mt-1">Gerenciamento de redundância e backups de segurança pedagógica da base de dados.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl border border-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-brand-300 uppercase tracking-widest">Serviço de Backup</p>
              <h3 className="text-xl font-bold mt-2">Rotina Automática</h3>
              <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Ativa & Saudável
              </div>
            </div>
            <Cpu className="text-slate-800 w-12 h-12 stroke-[1.5]" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mt-4">
            Nosso daemon de rotina faz backup automático a cada <strong>12 horas</strong> para o Supabase (com redundância em memória local).
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-100 relative overflow-hidden shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informações de Envio</p>
              <h3 className="text-xl font-bold mt-2 text-slate-800">Redundância</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-4">
                Os arquivos armazenam um congelamento instantâneo de alunos, professores vinculados e relatórios quinzenais RPI ativos.
              </p>
            </div>
            <Server className="text-brand-100 w-12 h-12 stroke-[1.5]" />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-brand-600 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Segurança assegurada por hash criptográfico
          </div>
        </div>

        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-brand-200 uppercase tracking-widest">Proteção Contra Desastres</p>
            <h3 className="text-xl font-bold mt-2">Backup Manual</h3>
            <p className="text-xs text-brand-100 mt-2 leading-relaxed">
              Gere um instantâneo atual instantaneamente e salve-o ou faça do download de forma segura localmente em formato JSON.
            </p>
          </div>
          
          <button
            onClick={handleManualBackup}
            disabled={isBackingUp}
            className="w-full mt-6 py-3 px-4 bg-white text-slate-900 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-50 transition-all font-sans cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-900/10"
          >
            {isBackingUp ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
                Gerando arquivo...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 text-brand-600" />
                Fazer Backup Agora
              </>
            )}
          </button>
        </div>
      </div>

      {backupMessage && (
        <div className={`p-4 rounded-2xl border text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ${
          backupMessage.type === "success" 
            ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
            : "bg-rose-50 border-rose-100 text-rose-800"
        }`}>
          {backupMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="font-medium">{backupMessage.text}</div>
        </div>
      )}

      {/* Backup Archives List */}
      <div className="bg-white rounded-3xl p-6 border border-brand-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Histórico de Arquivamentos de Segurança</h3>
        <p className="text-sm font-medium text-slate-500 mb-6">Lista de backups gerados automaticamente ou de forma manual sob demanda.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">ID / Data</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Volume de Dados</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Armazenamento</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <Database className="w-8 h-8 stroke-[1.5]" />
                      <p className="text-sm font-semibold">Nenhum backup registrado no histórico.</p>
                      <p className="text-xs">A rotina automática será agendada ou você pode clicar para gerar um imediatamente.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4">
                      <div className="font-bold text-slate-800 text-sm">{backup.id}</div>
                      <div className="text-xs text-slate-400 font-semibold mt-0.5">
                        {new Date(backup.date).toLocaleString("pt-BR")}
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        backup.triggerType === "AUTOMATIC" 
                          ? "bg-slate-100 text-slate-600 border border-slate-200" 
                          : "bg-brand-50 text-brand-700 border border-brand-100"
                      }`}>
                        {backup.triggerType === "AUTOMATIC" ? "Automático" : "Manual"}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="text-xs font-bold text-slate-700 leading-normal">
                        {backup.recordsCount.students} Alunos • {backup.recordsCount.teachers} Professores<br />
                        {backup.recordsCount.reports} de Relatórios RPI
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                        backup.storageLocation === "SUPABASE_DB" 
                          ? "text-emerald-700" 
                          : "text-amber-700"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          backup.storageLocation === "SUPABASE_DB" ? "bg-emerald-500" : "bg-amber-500"
                        }`}></span>
                        {backup.storageLocation === "SUPABASE_DB" ? "Supabase Cloud" : "Memória em Cache"}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                        backup.status === "SUCCESS" 
                          ? "text-emerald-700 bg-emerald-50" 
                          : "text-rose-700 bg-rose-50"
                      }`}>
                        {backup.status === "SUCCESS" ? "Sucesso" : "Falha"}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDownloadBackup(backup)}
                        className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 border border-transparent hover:border-brand-100"
                        title="Baixar arquivo JSON offline"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-xs font-bold pr-1">Download</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
