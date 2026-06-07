import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Search, 
  Calendar, 
  User, 
  ExternalLink, 
  Download, 
  Archive,
  ChevronRight,
  Filter,
  Brain,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  X,
  Sparkles
} from "lucide-react";
import { LessonPlan } from "../types";

export default function PlansHistory() {
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);

  useEffect(() => {
    fetch("/api/admin/plans")
      .then(res => res.json())
      .then(data => setPlans(data));
  }, []);

  const filteredPlans = plans.filter(plan => 
    plan.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.objective.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl heading text-slate-900">Histórico de Planos</h1>
          <p className="text-slate-500 font-medium">Todos os planos de aula gerados pela Vic IA</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="relative group flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por aluno ou objetivo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full has-icon pl-12 pr-4 py-4 bg-white border border-brand-100 rounded-2xl text-sm font-medium shadow-sm focus:ring-4 focus:ring-brand-500/10 transition-all"
            />
          </div>
          <button className="p-4 bg-white border border-brand-100 text-slate-400 rounded-2xl hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:border-brand-300 hover:shadow-2xl hover:shadow-brand-900/5 transition-all flex flex-col h-full"
          >
            <div className={`absolute top-6 right-6 px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-[10px] font-bold uppercase tracking-widest`}>
              {new Date(plan.date).toLocaleDateString('pt-BR')}
            </div>

            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-6 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-inner">
               <FileText className="w-7 h-7" />
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <User className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{plan.studentName}</span>
                </div>
                <h3 className="text-xl heading text-slate-900 line-clamp-2 leading-snug">{plan.objective}</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500 uppercase">
                  {plan.activities.length} Atividades
                </div>
                {plan.feedback && (
                  <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 ${
                    plan.feedback === "Útil" ? "bg-emerald-50 text-emerald-600" : 
                    plan.feedback === "Pouco Útil" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                  }`}>
                    {plan.feedback === "Útil" ? <ThumbsUp className="w-2.5 h-2.5" /> : 
                     plan.feedback === "Pouco Útil" ? <MinusCircle className="w-2.5 h-2.5" /> : <ThumbsDown className="w-2.5 h-2.5" />}
                    {plan.feedback}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-3">
               <button 
                onClick={() => setSelectedPlan(plan)}
                className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-brand-600/10 hover:bg-brand-500 transition-all active:scale-95 flex items-center justify-center gap-2"
               >
                 Visualizar <ChevronRight className="w-3 h-3" />
               </button>
               <button className="p-3 bg-slate-50 text-slate-400 hover:text-brand-600 rounded-xl transition-all">
                 <Download className="w-4 h-4" />
               </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlan(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-10 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-brand-500/20 rounded-[2rem] flex items-center justify-center text-brand-400 border border-brand-500/20">
                     <Brain className="w-8 h-8" />
                   </div>
                   <div>
                     <div className="flex items-center gap-2 opacity-60 mb-1">
                        <User className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{selectedPlan.studentName}</span>
                        <div className="w-1 h-1 bg-white/40 rounded-full" />
                        <Calendar className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(selectedPlan.date).toLocaleDateString()}</span>
                     </div>
                     <h3 className="text-2xl heading leading-snug">Plano Pedagógico IA</h3>
                   </div>
                </div>
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="p-3 hover:bg-white/10 rounded-2xl text-white/40 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                <section>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 block">Objetivo Principal</label>
                  <p className="text-xl font-bold text-slate-800">{selectedPlan.objective}</p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <section className="space-y-6">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Archive className="w-4 h-4 text-brand-600" /> Atividades Adaptadas
                    </label>
                    <div className="space-y-4">
                      {selectedPlan.activities.map((act, i) => (
                        <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                          <h4 className="font-bold text-slate-900 mb-2">{act.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{act.content}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-6">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Sparkles className="w-4 h-4 text-brand-600" /> Manejo Sensorial
                    </label>
                    <div className="space-y-4">
                      {selectedPlan.sensoryTips.map((tip, i) => (
                        <div key={i} className="p-6 bg-brand-50 rounded-2xl border border-brand-100">
                          <h4 className="font-bold text-brand-900 mb-2">{tip.title}</h4>
                          <p className="text-xs text-brand-700/70 leading-relaxed font-medium">{tip.content}</p>
                        </div>
                      ))}
                      {selectedPlan.sensoryTips.length === 0 && (
                        <p className="text-xs text-slate-400 italic">Nenhuma dica sensorial gerada para este plano.</p>
                      )}
                    </div>
                  </section>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-10 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-brand-600 rounded-full" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID do Plano: {selectedPlan.id}</span>
                </div>
                <div className="flex items-center gap-3">
                   <button className="px-6 py-3 bg-white text-slate-600 rounded-xl font-bold text-xs border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                      <Download className="w-4 h-4" /> Exportar PDF
                   </button>
                   <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/20">
                      Utilizar Plano <ChevronRight className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
