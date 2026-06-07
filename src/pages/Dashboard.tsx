import { useState, useEffect } from "react";
import { 
  Users, 
  School as SchoolIcon, 
  Baby, 
  TrendingUp, 
  BrainCircuit,
  Plus,
  ArrowUpRight,
  MapPin
} from "lucide-react";
import { DashboardData, School, Student, UserType } from "../types";
import { useAuth } from "../App";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [recentSchools, setRecentSchools] = useState<School[]>([]);
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error("Dashboard fetch error:", err));

    fetch("/api/admin/schools")
      .then(res => res.json())
      .then(schools => Array.isArray(schools) && setRecentSchools(schools.slice(0, 3)))
      .catch(err => console.error("Schools fetch error:", err));

    fetch("/api/admin/students")
      .then(res => res.json())
      .then(students => Array.isArray(students) && setRecentStudents(students.slice(0, 5)))
      .catch(err => console.error("Students fetch error:", err));
  }, []);

  const stats = [
    { label: "Total de Alunos", value: data?.totalStudents || 0, icon: Baby, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Professores", value: data?.totalTeachers || 0, icon: Users, color: "text-brand-600", bg: "bg-brand-50" },
    { label: "Planos IA", value: data?.totalPlans || 0, icon: BrainCircuit, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Escolas", value: data?.totalSchools || 0, icon: SchoolIcon, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  const chartData = [
    { name: "Jan", val: 45 },
    { name: "Fev", val: 52 },
    { name: "Mar", val: 61 },
    { name: "Abr", val: 78 },
  ];

  const teaDistribution = [
    { name: "Nível 1", count: 42 },
    { name: "Nível 2", count: 35 },
    { name: "Nível 3", count: 23 },
  ];

  const tdahDistribution = [
    { name: "Desatento", count: 45, fill: "#3b82f6" },
    { name: "Combinado (Misto)", count: 35, fill: "#6366f1" },
    { name: "Hiperativo/Impulsivo", count: 20, fill: "#a855f7" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl heading text-slate-900">Olá, {user?.name.split(' ')[0]} 👋</h2>
          <p className="text-slate-500 font-medium mt-1">Veja o que está acontecendo na rede hoje.</p>
        </div>
        <div className="flex items-center gap-3">
          {user?.type === UserType.ADMIN && (
            <Link to="/teachers/new" className="secondary flex items-center gap-2 !py-2.5">
              <Plus className="w-5 h-5 text-brand-600" />
              Novo Professor
            </Link>
          )}
          <Link to="/students/new" className="primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Novo Aluno
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card-soft p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-2xl font-display font-bold text-slate-900">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-emerald-600 text-xs font-bold">
              <TrendingUp className="w-3 h-3" />
              <span>+12% este mês</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card-soft p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl heading text-slate-900">Evolução Pedagógica</h3>
                <p className="text-sm text-slate-500 font-medium">Progresso médio dos alunos da rede</p>
              </div>
              <select className="bg-slate-50 border-transparent text-xs font-bold">
                <option>Últimos 6 meses</option>
              </select>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b9797" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b9797" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#64748b'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#64748b'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  />
                  <Area type="monotone" dataKey="val" stroke="#3b9797" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-soft p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl heading text-slate-900">Alunos Recentes</h3>
              <Link to="/students" className="text-brand-600 text-sm font-bold flex items-center gap-1 hover:underline">
                Ver todos <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-brand-50 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <th className="pb-4">Aluno</th>
                    <th className="pb-4">Escola</th>
                    <th className="pb-4">Nível TEA</th>
                    <th className="pb-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50">
                  {recentStudents.map((student) => (
                    <tr key={student.id} className="group cursor-pointer hover:bg-brand-50/50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                            {student.name.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-slate-800">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm font-medium text-slate-500">{recentSchools.find(s => s.id === student.schoolId)?.name}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          student.teaLevel.includes('1') ? 'bg-emerald-50 text-emerald-600' :
                          student.teaLevel.includes('2') ? 'bg-amber-50 text-amber-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {student.teaLevel}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                          Ativo
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="card-soft p-8 bg-brand-900 text-white relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-500/20 rounded-full blur-[40px]" />
            <h3 className="text-xl heading mb-2 text-white">Assistente Vic IA</h3>
            <p className="text-white/70 text-sm font-medium leading-relaxed mb-6">
              "Olá! Eu analisei os novos cadastros. Sugiro adaptar o plano do aluno Arthur com foco em estímulos visuais."
            </p>
            <button className="w-full bg-white text-brand-900 font-bold py-3 rounded-xl hover:bg-brand-50 transition-all flex items-center justify-center gap-2">
              <BrainCircuit className="w-5 h-5" />
              Falar com Vic
            </button>
          </div>

          <div className="card-soft p-8">
            <h3 className="text-xl heading text-slate-900 mb-6">Distribuição TEA</h3>
            <div className="space-y-6">
              {teaDistribution.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">{item.name}</span>
                    <span className="text-slate-900">{item.count}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-amber-500' : 'bg-red-500'
                      }`} 
                      style={{ width: `${item.count}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-soft p-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <h3 className="text-xl heading text-slate-900 mb-2">Distribuição TDAH</h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">Subtipos clínicos mapeados nos alunos cadastrados</p>
            <div className="space-y-4 mb-6">
              {tdahDistribution.map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">{item.name}</span>
                    <span className="text-slate-900">{item.count}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${item.count}%`, backgroundColor: item.fill }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="h-44 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tdahDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} unit="%" />
                  <Tooltip 
                    cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 600 }} 
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={26}>
                    {tdahDistribution.map((entry, index) => (
                      <Bar key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-soft p-8">
            <h3 className="text-xl heading text-slate-900 mb-6">Rede de Apoio</h3>
            <div className="space-y-4">
              {recentSchools.map((school) => (
                <div key={school.id} className="flex items-center gap-4 group cursor-pointer border-b border-brand-50 pb-4 last:border-0 last:pb-0">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-brand-600 group-hover:bg-brand-50 transition-all">
                    <SchoolIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{school.name}</h4>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 capitalize">
                      <MapPin className="w-3 h-3" /> {school.region}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
