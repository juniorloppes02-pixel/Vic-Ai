import { useState, useEffect } from "react";
import { Plus, School as SchoolIcon, MapPin, Users, Edit3, Trash2, Search } from "lucide-react";
import { School } from "../types";

export default function Schools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSchool, setNewSchool] = useState({ name: "", region: "" });
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSchools = () => {
    fetch("/api/admin/schools")
      .then(res => res.json())
      .then(data => setSchools(Array.isArray(data) ? data : []))
      .catch(() => setSchools([]));
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchool.name || !newSchool.region) return;
    
    setIsSaving(true);
    try {
      const url = editingSchool ? `/api/admin/schools/${editingSchool.id}` : "/api/admin/schools";
      const method = editingSchool ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchool)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingSchool(null);
        setNewSchool({ name: "", region: "" });
        fetchSchools();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewSchool({ name: "", region: "" });
    setEditingSchool(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl heading text-slate-900">Gestão de Escolas</h2>
          <p className="text-slate-500 font-medium mt-1">Configure as unidades escolares vinculadas à rede.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Cadastrar Escola
        </button>
      </div>

       {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-900/40 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="glass bg-white p-8 rounded-3xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl heading text-slate-900 mb-6">{editingSchool ? "Editar Unidade Escolar" : "Nova Unidade Escolar"}</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="label">Nome da Escola</label>
                <input 
                  autoFocus
                  required
                  value={newSchool.name}
                  onChange={(e) => setNewSchool({...newSchool, name: e.target.value})}
                  className="w-full" 
                  placeholder="Ex: Escola Municipal João Paulo II" 
                />
              </div>
              <div>
                <label className="label">Região (Bairro/Zona)</label>
                <input 
                  required
                  value={newSchool.region}
                  onChange={(e) => setNewSchool({...newSchool, region: e.target.value})}
                  className="w-full" 
                  placeholder="Ex: Zona Leste / Bairro Centro" 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={handleCloseModal} className="secondary w-full">Cancelar</button>
                <button type="submit" disabled={isSaving} className="primary w-full">
                  {isSaving ? "Salvando..." : editingSchool ? "Salvar Alterações" : "Salvar Escola"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card-soft p-6 flex items-center gap-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-brand-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou região..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full has-icon pl-12 pr-4 py-3 bg-white border border-brand-100 rounded-2xl text-sm font-medium shadow-sm focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {schools.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((school) => (
          <div key={school.id} className="card-soft p-8 group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
              <button 
                onClick={() => {
                  setEditingSchool(school);
                  setNewSchool({ name: school.name, region: school.region });
                  setIsModalOpen(true);
                }}
                className="p-2 bg-white text-slate-400 hover:text-brand-600 rounded-lg border border-brand-50 shadow-sm"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button 
                onClick={async () => {
                  if (confirm(`Deseja realmente excluir a escola ${school.name}?`)) {
                    try {
                      const res = await fetch(`/api/admin/schools/${school.id}`, { method: "DELETE" });
                      if (res.ok) {
                        fetchSchools();
                      } else {
                        alert("Erro ao excluir escola.");
                      }
                    } catch {
                      alert("Erro de conexão.");
                    }
                  }
                }}
                className="p-2 bg-white text-slate-400 hover:text-red-600 rounded-lg border border-brand-50 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-xl shadow-brand-500/5">
              <SchoolIcon className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl heading text-slate-900 mb-2 truncate group-hover:text-brand-700 transition-colors">{school.name}</h3>
            
            <div className="space-y-4 pt-4 border-t border-brand-50">
               <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <MapPin className="w-4 h-4 text-brand-600" />
                  {school.region}
               </div>
               <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Users className="w-4 h-4 text-brand-600" />
                  {school.studentsCount} Alunos laudados
               </div>
            </div>

            <button className="w-full mt-8 py-3 rounded-xl border border-brand-100 text-brand-600 text-sm font-bold hover:bg-brand-50 transition-all">
              Ver Detalhes da Unidade
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
