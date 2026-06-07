import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  X, 
  Send, 
  AlertTriangle, 
  Lightbulb, 
  HelpCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useAuth } from "../App";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    type: "SUGGESTION",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Feedback submitted:", {
      ...formData,
      userId: user?.id,
      date: new Date().toISOString()
    });
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      setIsSuccess(false);
      setFormData({ type: "SUGGESTION", subject: "", message: "" });
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden"
          >
            {isSuccess ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl heading text-slate-900 mb-2">Feedback Enviado!</h3>
                <p className="text-slate-500 font-medium">Agradecemos sua colaboração para melhorar o sistema.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="text-xl heading text-slate-900">Feedback</h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Sugestões e Suporte</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={onClose}
                    className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="label">Tipo de Feedback</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "SUGGESTION", icon: Lightbulb, label: "Sugestão", color: "brand" },
                        { id: "BUG", icon: AlertTriangle, label: "Erro", color: "amber" },
                        { id: "SUPPORT", icon: HelpCircle, label: "Suporte", color: "blue" }
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                            formData.type === type.id 
                              ? `bg-${type.color}-50 border-${type.color}-200 text-${type.color}-600` 
                              : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
                          }`}
                        >
                          <type.icon className="w-5 h-5" />
                          <span className="text-[10px] font-bold uppercase">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Assunto</label>
                    <input 
                      required
                      type="text" 
                      className="w-full" 
                      placeholder="Ex: Melhoria na busca de alunos"
                      value={formData.subject}
                      onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="label">Descrição Detalhada</label>
                    <textarea 
                      required
                      rows={4}
                      className="w-full resize-none" 
                      placeholder="Descreva seu feedback ou o problema encontrado..."
                      value={formData.message}
                      onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full mt-8 primary flex items-center justify-center gap-3 py-4 text-base"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {isSubmitting ? "Enviando..." : "Enviar Feedback"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
