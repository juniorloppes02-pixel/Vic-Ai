import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  ChevronRight,
  Eye,
  FileDown,
  Baby,
  Edit3,
  Trash2
} from "lucide-react";
import { Student, School } from "../types";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AllStudents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSchool, setFilterSchool] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/students").then(res => res.json()),
      fetch("/api/admin/schools").then(res => res.json())
    ]).then(([studentsData, schoolsData]) => {
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setSchools(Array.isArray(schoolsData) ? schoolsData : []);
    }).catch(err => {
      console.error("Fetch error:", err);
      setStudents([]);
      setSchools([]);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const filteredStudents = students.filter(s => {
    const sName = s.name || "";
    const sCode = s.code || "";
    const sTeaLevel = s.teaLevel || "";

    const matchesSearch = sName.toLowerCase().includes(searchTerm.toLowerCase()) || sCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSchool = !filterSchool || s.schoolId === filterSchool;
    const matchesLevel = !filterLevel || sTeaLevel.includes(filterLevel);
    
    // Index / restrict students to the logged-in field if user type is PROFESSOR
    const isTeacherOfStudent = s.teacherId === user?.id || (s.teacherName && user?.name && s.teacherName === user.name);
    const residesInSameSchool = !!(user?.schoolId && s.schoolId === user.schoolId);
    const matchesTeacher = user?.type !== "PROFESSOR" || isTeacherOfStudent || residesInSameSchool;
    
    return matchesSearch && matchesSchool && matchesLevel && matchesTeacher;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header Banner
    doc.setFillColor(44, 122, 122);
    doc.rect(0, 0, 210, 42, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Vic AI - Relatório de Alunos", 15, 20);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`, 15, 29);
    doc.text(`Total de alunos: ${filteredStudents.length}`, 15, 34);
    
    const tableColumn = ["Código", "Nome", "Escola", "Nível TEA", "Professor(a)", "Status"];
    const tableRows: string[][] = [];
    
    filteredStudents.forEach(s => {
      const schoolName = schools.find(sch => sch.id === s.schoolId)?.name || "Não informado";
      const teacher = s.teacherName ? `Prof(a). ${s.teacherName}` : "Não informado";
      const statusText = s.status === "active" || s.status === "ACTIVE" || !s.status ? "Ativo" : s.status;
      
      tableRows.push([
        s.code,
        s.name,
        schoolName,
        `Nível ${s.teaLevel}`,
        teacher,
        statusText
      ]);
    });
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: "striped",
      headStyles: { fillColor: [44, 122, 122], fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 3.5 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 25 },
        1: { cellWidth: 45 },
        2: { cellWidth: 45 },
        3: { cellWidth: 25 },
        4: { cellWidth: 35 },
        5: { cellWidth: 15 }
      }
    });
    
    doc.save("VicAI_Alunos.pdf");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl heading text-slate-900">Visão Global de Alunos</h2>
          <p className="text-slate-500 font-medium mt-1">Gerencie e acompanhe todos os alunos da rede.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={exportToPDF} className="secondary flex items-center gap-2 cursor-pointer">
            <FileDown className="w-5 h-5" />
            Exportar PDF
          </button>
          <Link to="/students/new" className="primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Vincular Aluno
          </Link>
        </div>
      </div>

      <div className="card-soft p-6 flex flex-wrap items-center gap-6 bg-white/50 backdrop-blur-sm">
        <div className="flex-1 min-w-[300px] relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-brand-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou código..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full has-icon pl-12 pr-4 py-3 bg-white border border-brand-100 rounded-2xl text-sm font-medium shadow-sm focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-bold text-slate-600">Filtros:</span>
          </div>
          <select 
            value={filterSchool}
            onChange={(e) => setFilterSchool(e.target.value)}
            className="bg-transparent"
          >
            <option value="">Todas as Escolas</option>
            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select 
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-transparent"
          >
            <option value="">Todos os Níveis TEA</option>
            <option value="1">Nível 1 (Leve)</option>
            <option value="2">Nível 2 (Moderado)</option>
            <option value="3">Nível 3 (Severo)</option>
          </select>
        </div>
      </div>

      <div className="card-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-brand-50 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-4">Código</th>
                <th className="px-8 py-4">Aluno</th>
                <th className="px-8 py-4">Escola</th>
                <th className="px-8 py-4">Nível TEA</th>
                <th className="px-8 py-4">Professor(a)</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-20 text-slate-400 font-medium">Carregando alunos...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-20 text-slate-400 font-medium">Nenhum aluno encontrado.</td></tr>
              ) : filteredStudents.map((student) => (
                <tr key={student.id} className="group hover:bg-brand-50/30 transition-colors">
                  <td className="px-8 py-5 text-sm font-mono font-bold text-brand-600">{student.code}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-bold group-hover:scale-110 transition-transform overflow-hidden">
                        {student.photoUrl ? (
                          <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          student.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{student.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{student.grade}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-500">
                    {schools.find(s => s.id === student.schoolId)?.name}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      student.teaLevel.includes('1') ? 'bg-emerald-100 text-emerald-700' :
                      student.teaLevel.includes('2') ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {student.teaLevel}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-500">
                    {student.teacherName ? `Professor(a) ${student.teacherName}` : "Não informado"}
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      Ativo
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right relative">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => navigate(`/students/${student.id}`)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)}
                        className={`p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all ${openMenuId === student.id ? 'bg-slate-100 text-slate-600' : ''}`}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                    {openMenuId === student.id && (
                      <div className="absolute right-8 top-12 bg-white rounded-xl shadow-xl border border-brand-100 py-2 w-32 z-50 animate-in fade-in duration-200">
                        <button 
                          onClick={() => {
                            setOpenMenuId(null);
                            navigate("/students/new", { state: { student } });
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4 text-slate-400" />
                          Editar
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm(`Deseja realmente excluir o aluno ${student.name}?`)) {
                              setOpenMenuId(null);
                              try {
                                const res = await fetch(`/api/admin/students/${student.id}`, { method: "DELETE" });
                                if (res.ok) {
                                  setStudents(prev => prev.filter(s => s.id !== student.id));
                                } else {
                                  alert("Erro ao excluir aluno.");
                                }
                              } catch {
                                alert("Erro de conexão.");
                              }
                            }
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                          Excluir
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
