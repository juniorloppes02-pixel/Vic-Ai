import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserType, School } from "../types";
import { Plus, Search, Shield, User as UserIcon, MoreVertical, Edit3, Trash2, FileDown } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function UsersManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then(res => res.json()),
      fetch("/api/admin/schools").then(res => res.json())
    ]).then(([usersData, schoolsData]) => {
      setUsers(Array.isArray(usersData) ? usersData : []);
      setSchools(Array.isArray(schoolsData) ? schoolsData : []);
    }).catch(() => {
      setUsers([]);
      setSchools([]);
    });
  }, []);

  const exportUsersToPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    
    // Title of the doc
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("Relatório de Usuários Cadastrados", 14, 22);
    
    // Subtitle / Meta information
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    const currentDate = new Date().toLocaleDateString("pt-BR");
    const currentTime = new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
    doc.text(`Gerado em: ${currentDate} às ${currentTime}`, 14, 29);
    
    const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const tableColumn = ["Nome", "E-mail", "Tipo", "Vínculo"];
    const tableRows: string[][] = [];
    
    filteredUsers.forEach(user => {
      const schoolName = user.schoolId 
        ? (schools.find(s => s.id === user.schoolId)?.name || "Escola não encontrada") 
        : "Secretaria Municipal";
      
      tableRows.push([
        user.name,
        user.email,
        user.type || "",
        schoolName
      ]);
    });
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 36,
      theme: "striped",
      headStyles: { fillColor: [79, 70, 229], fontStyle: "bold" }, // branding blue/indigo
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50 },
        1: { cellWidth: 60 },
        2: { cellWidth: 35 },
        3: { cellWidth: 45 }
      }
    });
    
    doc.save(`usuarios_cadastrados_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl heading text-slate-900">Gestão de Usuários</h2>
          <p className="text-slate-500 font-medium mt-1">Controle de acesso para administradores e professores.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            id="btn-export-users-pdf"
            onClick={exportUsersToPDF}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors shadow-sm"
          >
            <FileDown className="w-5 h-5 text-slate-500" />
            Exportar PDF
          </button>
          <button 
            id="btn-create-user"
            onClick={() => navigate("/teachers/new")}
            className="primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Usuário
          </button>
        </div>
      </div>

      <div className="card-soft p-6 flex items-center gap-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-brand-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full has-icon pl-12 pr-4 py-3 bg-white border border-brand-100 rounded-2xl text-sm font-medium shadow-sm focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
          />
        </div>
      </div>

      <div className="card-soft overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-brand-50 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <th className="px-8 py-4">Usuário</th>
              <th className="px-8 py-4">Tipo</th>
              <th className="px-8 py-4">Vínculo</th>
              <th className="px-8 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
              <tr key={user.id} className="group hover:bg-brand-50/30 transition-colors">
                <td className="px-8 py-5">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
                         {user.name.charAt(0)}
                      </div>
                      <div>
                         <p className="text-sm font-bold text-slate-800">{user.name}</p>
                         <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-5">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 w-fit ${
                     user.type === UserType.ADMIN 
                       ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                       : user.type === UserType.COORDENADOR
                         ? 'bg-blue-50 text-blue-600 border border-blue-100'
                         : user.type === UserType.SECRETARIA
                           ? 'bg-amber-50 text-amber-700 border border-amber-150'
                           : 'bg-brand-50 text-brand-600 border border-brand-100'
                   }`}>
                      {user.type === UserType.ADMIN ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                      {user.type === UserType.ADMIN 
                        ? 'Administrador' 
                        : user.type === UserType.COORDENADOR 
                          ? 'Coordenador' 
                          : user.type === UserType.SECRETARIA 
                            ? 'Secretaria' 
                            : 'Professor'}
                   </span>
                </td>
                <td className="px-8 py-5 text-sm font-medium text-slate-500">
                   {user.schoolId ? schools.find(s => s.id === user.schoolId)?.name : "Secretaria Municipal"}
                </td>
                <td className="px-8 py-5 text-right">
                   <div className="flex items-center justify-end gap-2 px-4">
                      <button 
                        onClick={() => navigate("/teachers/new", { state: { user: user } })}
                        className="p-2 text-slate-400 hover:text-brand-600 transition-all"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm(`Deseja realmente excluir o usuário ${user.name}?`)) {
                            try {
                              const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
                              if (res.ok) {
                                setUsers(prev => prev.filter(u => u.id !== user.id));
                              } else {
                                alert("Erro ao excluir usuário.");
                              }
                            } catch {
                              alert("Erro de conexão.");
                            }
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
