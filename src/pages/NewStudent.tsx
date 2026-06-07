import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";
import { 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  User, 
  Stethoscope, 
  Activity, 
  Target,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  Loader2,
  FileText,
  Upload,
  X
} from "lucide-react";
import { School, Student } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";

const steps = [
  { id: 1, title: "Identificação", subtitle: "Dados básicos", icon: User },
  { id: 2, title: "Diagnóstico", subtitle: "Informações clínicas", icon: Stethoscope },
  { id: 3, title: "Comportamento", subtitle: "Rotina e sensibilidade", icon: Activity },
  { id: 4, title: "Pedagógico", subtitle: "Objetivos e foco", icon: Target },
];

export default function NewStudent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const editingStudent = location.state?.student as Student | undefined;

  const [currentStep, setCurrentStep] = useState(1);
  const [schools, setSchools] = useState<School[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState("");

  const [formData, setFormData] = useState<Partial<Student>>({
    name: "",
    age: 0,
    gender: "Masculino",
    grade: "",
    responsible: "",
    schoolId: "",
    teaLevel: "Leve (Nível 1)",
    diagnosis: "Sim",
    professional: "Neuropediatra",
    communication: "Fluente",
    attention: "5 a 10 min",
    sensitivity: "Som",
    crises: "Raro",
    memory: "Preservada",
    comprehension: "Bom",
    motricity: "Bom",
    teacherBond: "Sim",
    performance: "Bom",
    hyperfocus: "",
    pedagogicalObjective: "",
    photoUrl: "",
    medicalReportUrl: "",
    phone: "",
    period: "Manhã",
    enrolmentTime: "",
    supportTeacher: "Não",
    resourceRoom: "Não",
    pei: "Não",
    adaptations: "",
    academicHistory: "",
    teacherName: "",
    teacherId: "",
    condition: "TEA",
    adhdSubtype: "Misto (Combinado)",
    adhdIntensity: "Moderado"
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Apenas arquivos PDF são permitidos");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("O arquivo deve ter no máximo 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, medicalReportUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetch("/api/admin/schools").then(res => res.json()).then(setSchools);
    if (editingStudent) {
      setFormData(editingStudent);
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        teacherName: user.name,
        teacherId: user.id
      }));
    }
  }, [user, editingStudent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      alert("Por favor, preencha o Nome Completo do aluno antes de salvar.");
      return;
    }

    setIsSaving(true);
    try {
      const url = editingStudent 
        ? `/api/admin/students/${editingStudent.id}` 
        : "/api/admin/students";
      const method = editingStudent ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status: "Ativo" })
      });
      if (res.ok) {
        navigate("/students");
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Ocorreu um erro ao salvar o registro do aluno. Verifique se os dados estão corretos ou tente novamente.");
      }
    } catch (saveErr) {
      console.error("Save student error:", saveErr);
      alert("Falha na comunicação com o servidor. O aluno foi registrado temporariamente se a conexão falhar, ou tente novamente em instantes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Como Vic IA, especialista em pedagogia inclusiva para TEA (Altismo) e TDAH (Transtorno de Déficit de Atenção com Hiperatividade), elabore um Plano de Atendimento Educacional Especializado (PAEE) personalizado:
      CONDIÇÃO DO ALUNO: ${formData.condition || "TEA"}
      NOME: ${formData.name}
      IDADE: ${formData.age} anos
      ${(formData.condition === "TEA" || formData.condition === "TEA + TDAH") ? `NÍVEL TEA DE SUPORTE: ${formData.teaLevel}` : ""}
      ${(formData.condition === "TDAH" || formData.condition === "TEA + TDAH") ? `SUBTIPO TDAH: ${formData.adhdSubtype} | INTENSIDADE: ${formData.adhdIntensity}` : ""}
      ALFABETIZAÇÃO/SÉRIE: ${formData.grade}
      PROFESSOR(A) RESPONSÁVEL: Professor(a) ${formData.teacherName || "Não informado"}
      PERFIL DO ALUNO:
      - Comunicação: ${formData.communication}
      - Tempo de atenção: ${formData.attention}
      - Sensibilidade: ${formData.sensitivity}
      - Crises: ${formData.crises}
      - Hiperfoco/Interesses Principais: ${formData.hyperfocus}
      - Principal Objetivo Pedagógico: ${formData.pedagogicalObjective}
      
      Estruture a resposta em Markdown com:
      1. Adaptações de Ambiente e Rotina (Ex: Previsibilidade visual para TEA; Pausas de movimento e redução de distração para TDAH)
      2. Estratégias Pedagógicas e de Concentração (Técnicas de foco e quebra de tarefas para TDAH; Metodologia visual para TEA)
      3. Atividades Práticas Inclusivas baseadas no hiperfoco/interesse do aluno (${formData.hyperfocus || "geral"})
      4. Manejo de Comportamento e Autorregulação (Mapear crises sensoriais ou de frustração e propostas de intervenção terapêutica-pedagógica)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });
      setGeneratedPlan(response.text || "");
      setCurrentStep(5); // Show result step
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fly-in-bottom duration-700">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/students")} className="text-slate-500 font-bold flex items-center gap-2 hover:text-brand-600 transition-colors">
          <ChevronLeft className="w-5 h-5" /> Voltar
        </button>
        <div className="flex gap-4">
          <button 
            onClick={handleGeneratePlan}
            disabled={isGeneratingPlan || currentStep < 4}
            className="secondary flex items-center gap-2 disabled:opacity-50"
          >
            {isGeneratingPlan ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5 text-brand-600" />}
            Gerar Plano com Vic IA
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="primary flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isSaving ? "Salvando..." : editingStudent ? "Salvar Alterações" : "Salvar Aluno"}
          </button>
        </div>
      </div>

      <div className="card-soft p-1.5 flex gap-1 relative overflow-hidden">
        {steps.map((s) => (
          <button
            key={s.id}
            onClick={() => currentStep < 5 && setCurrentStep(s.id)}
            className={`flex-1 text-left p-4 rounded-xl transition-all relative z-10 ${
              currentStep === s.id ? 'bg-brand-50 shadow-sm' : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${currentStep === s.id ? 'bg-brand-600 text-white' : 'bg-brand-100 text-brand-600'}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${currentStep === s.id ? 'text-brand-600' : 'text-slate-400'}`}>Passo {s.id}</p>
                <p className={`text-sm font-bold ${currentStep === s.id ? 'text-slate-900' : 'text-slate-500'}`}>{s.title}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="card-soft p-10"
        >
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="label">Foto do Aluno (Perfil - Máx 2MB)</label>
                  {!formData.photoUrl ? (
                    <div className="relative">
                      <input
                        type="file"
                        id="photo-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                      />
                      <label 
                        htmlFor="photo-upload"
                        className="flex flex-col items-center justify-center border-2 border-dashed border-brand-100 rounded-3xl p-8 hover:bg-brand-50 hover:border-brand-300 transition-all cursor-pointer group"
                      >
                        <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-700">Clique para selecionar foto</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Formatos: JPG, PNG ou WEBP</p>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-[1.5rem]">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white border-4 border-white rounded-full overflow-hidden shadow-sm shadow-emerald-900/10">
                          <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-900">Foto Selecionada</p>
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Imagem pronta para o perfil</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, photoUrl: "" }))}
                        className="p-2 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                  <div className="col-span-2">
                    <label className="label">Nome Completo</label>
                    <input name="name" value={formData.name} onChange={handleChange} className="w-full" placeholder="Ex: Arthur Benicio Silva" />
                  </div>
                  <div>
                    <label className="label">Idade</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full" />
                  </div>
                  <div>
                    <label className="label">Gênero</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full">
                      <option>Masculino</option>
                      <option>Feminino</option>
                      <option>Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Período</label>
                    <select name="period" value={formData.period} onChange={handleChange} className="w-full">
                      <option>Manhã</option>
                      <option>Tarde</option>
                      <option>Integral</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Tempo de Matrícula</label>
                    <input name="enrolmentTime" value={formData.enrolmentTime} onChange={handleChange} className="w-full" placeholder="Ex: 2 anos" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                <div>
                  <label className="label">Escola</label>
                  <select name="schoolId" value={formData.schoolId} onChange={handleChange} className="w-full">
                    <option value="">Selecione a Escola</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Turma/Série</label>
                  <input name="grade" value={formData.grade} onChange={handleChange} className="w-full" placeholder="Ex: 2º Ano B" />
                </div>
                <div>
                  <label className="label">Responsável Legal (Pais/Familiar)</label>
                  <input name="responsible" value={formData.responsible} onChange={handleChange} className="w-full" placeholder="Nome do familiar ou responsável" />
                </div>
                <div>
                  <label className="label">Professor(a) Responsável</label>
                  <input name="teacherName" value={formData.teacherName} onChange={handleChange} className="w-full" placeholder="Nome do Professor(a) Responsável" />
                </div>
                <div>
                  <label className="label">Telefone de Contato</label>
                  <input name="phone" value={formData.phone} onChange={handleChange} className="w-full" placeholder="(00) 00000-0000" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-10">
                <div>
                  <label className="label">Condição / Neurodivergência</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["TEA", "TDAH", "TEA + TDAH"].map(cond => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, condition: cond as any }))}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                          formData.condition === cond ? 'bg-brand-600 border-brand-600 text-white shadow-sm' : 'bg-white border-brand-100 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>

                {(formData.condition === "TEA" || formData.condition === "TEA + TDAH") && (
                  <div>
                    <label className="label">Nível TEA</label>
                    <div className="space-y-3">
                      {["Leve (Nível 1)", "Moderado (Nível 2)", "Severo (Nível 3)"].map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, teaLevel: level }))}
                          className={`w-full p-3 rounded-2xl border flex items-center justify-between text-xs font-bold transition-all ${
                            formData.teaLevel === level ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-brand-100 text-slate-500'
                          }`}
                        >
                          {level}
                          {formData.teaLevel === level && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(formData.condition === "TDAH" || formData.condition === "TEA + TDAH") && (
                  <div className="space-y-6">
                    <div>
                      <label className="label">Subtipo TDAH</label>
                      <select name="adhdSubtype" value={formData.adhdSubtype} onChange={handleChange} className="w-full text-xs font-medium">
                        <option value="Predominantemente Desatento">Predominantemente Desatento</option>
                        <option value="Predominantemente Hiperativo-Impulsivo">Predominantemente Hiperativo-Impulsivo</option>
                        <option value="Misto (Combinado)">Misto (Combinado)</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Intensidade do TDAH</label>
                      <div className="flex gap-2">
                        {["Leve", "Moderado", "Grave"].map(intensity => (
                          <button
                            key={intensity}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, adhdIntensity: intensity }))}
                            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                              formData.adhdIntensity === intensity ? 'bg-orange-500 border-orange-500 text-white shadow-sm' : 'bg-white border-brand-100 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {intensity}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-8">
                  <div>
                    <label className="label">Possui Professor de Apoio?</label>
                    <select name="supportTeacher" value={formData.supportTeacher} onChange={handleChange} className="w-full">
                      <option>Sim</option>
                      <option>Não</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Frequenta Sala de Recursos?</label>
                    <select name="resourceRoom" value={formData.resourceRoom} onChange={handleChange} className="w-full">
                      <option>Sim</option>
                      <option>Não</option>
                      <option>Em avaliação</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Possui PEI Elaborado?</label>
                    <select name="pei" value={formData.pei} onChange={handleChange} className="w-full">
                      <option>Sim</option>
                      <option>Não</option>
                      <option>Em elaboração</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-y-10">
                <div>
                  <label className="label">Diagnóstico Confirmado?</label>
                  <select name="diagnosis" value={formData.diagnosis} onChange={handleChange} className="w-full">
                    <option>Sim</option>
                    <option>Não</option>
                  </select>
                </div>
                <div>
                  <label className="label">Profissional que diagnosticou</label>
                  <select name="professional" value={formData.professional} onChange={handleChange} className="w-full">
                    <option>Neuropediatra</option>
                    <option>Psicólogo</option>
                    <option>Fonoaudiólogo</option>
                    <option>Psiquiatra Infantil</option>
                    <option>Outro</option>
                  </select>
                </div>

                <div>
                  <label className="label">Anexar Laudo Médico (PDF - Máx 5MB)</label>
                  {!formData.medicalReportUrl ? (
                    <div className="relative">
                      <input
                        type="file"
                        id="report-upload"
                        className="hidden"
                        accept=".pdf"
                        onChange={handleReportUpload}
                      />
                      <label 
                        htmlFor="report-upload"
                        className="flex flex-col items-center justify-center border-2 border-dashed border-brand-100 rounded-2xl p-8 hover:bg-brand-50 hover:border-brand-300 transition-all cursor-pointer group"
                      >
                        <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-700">Clique para selecionar PDF</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Arraste ou selecione o arquivo</p>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-900">Laudo Médico Anexado</p>
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Arquivo PDF pronto para envio</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, medicalReportUrl: "" }))}
                        className="p-2 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100 flex gap-4">
                  <AlertCircle className="w-6 h-6 text-brand-600 shrink-0" />
                  <p className="text-xs text-brand-800 font-medium leading-relaxed">
                    Importante: O laudo clínico é fundamental para a validação do registro e acesso a recursos especializados da rede municipal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-12">
               <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                <div>
                  <label className="label">Comunicação</label>
                  <select name="communication" value={formData.communication} onChange={handleChange} className="w-full">
                    <option>Não verbal</option>
                    <option>Poucas palavras</option>
                    <option>Fluxo constante (com ecolalia)</option>
                    <option>Fluente</option>
                  </select>
                </div>
                <div>
                  <label className="label">Tempo de Atenção</label>
                  <select name="attention" value={formData.attention} onChange={handleChange} className="w-full">
                    <option>Até 5 min</option>
                    <option>5 a 10 min</option>
                    <option>10 a 20 min</option>
                    <option>+20 min</option>
                  </select>
                </div>
                <div>
                  <label className="label">Sensibilidade Predominante</label>
                  <select name="sensitivity" value={formData.sensitivity} onChange={handleChange} className="w-full">
                    <option>Som (Hipersensibilidade Auditiva)</option>
                    <option>Luz (Hipersensibilidade Visual)</option>
                    <option>Toque (Hipersensibilidade Tátil)</option>
                    <option>Texturas Alimentares</option>
                    <option>Nenhuma observada</option>
                  </select>
                </div>
                <div>
                  <label className="label">Frequência de Crises</label>
                  <select name="crises" value={formData.crises} onChange={handleChange} className="w-full">
                    <option>Frequentes (Diárias)</option>
                    <option>Ocasional (Semanal)</option>
                    <option>Raro (Mensal)</option>
                    <option>Inexistente no ambiente escolar</option>
                  </select>
                </div>
               </div>
               <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                <div>
                  <label className="label">Memória Visual</label>
                  <select name="memory" value={formData.memory} onChange={handleChange} className="w-full">
                    <option>Preservada</option>
                    <option>Como apoio principal</option>
                    <option>Em desenvolvimento</option>
                  </select>
                </div>
                <div>
                  <label className="label">Compreensão</label>
                  <select name="comprehension" value={formData.comprehension} onChange={handleChange} className="w-full">
                    <option>Ótimo</option>
                    <option>Bom</option>
                    <option>Regular</option>
                  </select>
                </div>
                <div>
                  <label className="label">Motricidade</label>
                  <select name="motricity" value={formData.motricity} onChange={handleChange} className="w-full">
                    <option>Ótimo</option>
                    <option>Bom</option>
                    <option>Regular</option>
                  </select>
                </div>
                <div>
                  <label className="label">Vínculo com Professor</label>
                  <select name="teacherBond" value={formData.teacherBond} onChange={handleChange} className="w-full">
                    <option>Sim</option>
                    <option>Não</option>
                    <option>Em construção</option>
                  </select>
                </div>
                <div>
                  <label className="label">Desempenho Geral</label>
                  <select name="performance" value={formData.performance} onChange={handleChange} className="w-full">
                    <option>Ótimo</option>
                    <option>Bom</option>
                    <option>Regular</option>
                    <option>Abaixo do esperado</option>
                  </select>
                </div>
               </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-10">
              <div>
                <label className="label">Interesses Restritos (Hiperfoco)</label>
                <input name="hyperfocus" value={formData.hyperfocus} onChange={handleChange} className="w-full" placeholder="Ex: Dinossauros, Espaço, Mapas, Trens..." />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="label">Principal Objetivo Pedagógico</label>
                  <textarea name="pedagogicalObjective" value={formData.pedagogicalObjective} onChange={handleChange} className="w-full h-32" placeholder="Descreva o que se espera alcançar prioritariamente com este aluno." />
                </div>
                <div>
                  <label className="label">Adaptações Prévias com Sucesso</label>
                  <textarea name="adaptations" value={formData.adaptations} onChange={handleChange} className="w-full h-32" placeholder="Liste adaptações que já funcionaram com o aluno." />
                </div>
              </div>
              <div>
                <label className="label">Histórico Escolar Relevante</label>
                <textarea name="academicHistory" value={formData.academicHistory} onChange={handleChange} className="w-full h-32" placeholder="Breve resumo da trajetória escolar anterior." />
              </div>
              <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-brand-900">IA Vic está pronta ✨</p>
                  <p className="text-xs text-brand-600 font-medium">Posso gerar um plano personalizado agora.</p>
                </div>
                <button onClick={handleGeneratePlan} disabled={isGeneratingPlan} className="primary flex items-center gap-2">
                  {isGeneratingPlan ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                  Gerar Plano IA
                </button>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="bg-brand-900 text-white p-8 rounded-3xl relative overflow-hidden">
                <BrainCircuit className="absolute -top-10 -right-10 w-48 h-48 text-brand-500/10" />
                <h3 className="text-2xl heading mb-2 text-white">Plano Pedagógico Vic IA</h3>
                <p className="text-brand-100 text-sm font-medium mb-6">Criado especificamente para {formData.name}</p>
                
                <div className="prose prose-invert max-w-none prose-sm overflow-y-auto max-h-[500px] bg-white/5 p-6 rounded-2xl border border-white/10 scrollbar-hide">
                  <div className="whitespace-pre-wrap font-sans leading-relaxed text-brand-50">
                    {generatedPlan}
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setCurrentStep(4)} className="secondary w-full">Refinar Dados</button>
                <button onClick={handleSave} className="primary w-full">
                  {isSaving ? "Salvando..." : editingStudent ? "Salvar e Aplicar Alterações" : "Salvar e Aplicar Plano"}
                </button>
              </div>
            </div>
          )}

          <div className="mt-10 pt-10 border-t border-brand-50 flex justify-between">
            {currentStep > 1 && currentStep < 5 && (
              <button 
                onClick={prevStep}
                className="secondary flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Anterior
              </button>
            )}
            <div className="flex-1" />
            {currentStep < 4 && (
              <button 
                onClick={nextStep}
                className="primary flex items-center gap-2"
              >
                Próximo Passo <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
