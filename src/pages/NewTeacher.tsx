import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  User, 
  Briefcase, 
  BookOpen, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Building,
  RefreshCw,
  Info
} from "lucide-react";
import { School } from "../types";
import { motion, AnimatePresence } from "motion/react";

const steps = [
  { id: 1, title: "Dados Gerais", subtitle: "Pessoais e vínculo", icon: User },
  { id: 2, title: "Foco Acadêmico", subtitle: "Modalidades e disciplinas", icon: Briefcase },
  { id: 3, title: "Turmas", subtitle: "Alocação de classes", icon: BookOpen },
  { id: 4, title: "Acesso", subtitle: "Perfil e segurança", icon: Lock },
];

const MODALITIES = [
  "Educação Infantil",
  "Ensino Fundamental",
  "Ensino Médio",
  "EJA (Educação de Jovens e Adultos)",
  "Educação Especial",
  "Associação Acadêmica (Enturmação)"
];

const DISCIPLINES = [
  "Matemática", "Português", "Ciências", "História", "Geografia", "Inglês", 
  "Educação Física", "Arte", "Física", "Química", "Biologia", "Filosofia", 
  "Sociologia", "Redação", "Espanhol", "Informática"
];

const CLASSES = [
  "1º Ano A", "1º Ano B", "2º Ano A", "2º Ano B", "3º Ano A", "3º Ano B",
  "4º Ano A", "4º Ano B", "5º Ano A", "5º Ano B", "6º Ano A", "6º Ano B",
  "7º Ano A", "7º Ano B", "8º Ano A", "8º Ano B", "9º Ano A", "9º Ano B",
  "1º EM A", "1º EM B", "2º EM A", "2º EM B", "3º EM A", "3º EM B"
];

export default function NewTeacher() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingUser = location.state?.user;

  const [currentStep, setCurrentStep] = useState(1);
  const [schools, setSchools] = useState<School[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    status: "Ativo", // Ativo / Inativo
    email: "",
    phone: "",
    code: "", // Matricula
    employmentType: "", // Temporário / Efetivo
    schoolId: "",
    modalities: [] as string[],
    disciplines: [] as string[],
    classes: [] as string[],
    notes: "",
    accessProfile: "Professor", // Professor / Coordenador
    password: "",
    confirmPassword: "",
    termAccepted: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/schools")
      .then(res => res.json())
      .then(data => setSchools(Array.isArray(data) ? data : []))
      .catch(() => setSchools([]));

    if (editingUser) {
      setFormData({
        name: editingUser.name || "",
        status: editingUser.status || "Ativo",
        email: editingUser.email || "",
        phone: editingUser.phone || "",
        code: editingUser.code || "",
        employmentType: editingUser.employmentType || "Efetivo",
        schoolId: editingUser.schoolId || "",
        modalities: editingUser.modalities || [],
        disciplines: editingUser.disciplines || [],
        classes: editingUser.classes || [],
        notes: editingUser.notes || "",
        accessProfile: editingUser.accessProfile || editingUser.type || "Professor",
        password: "",
        confirmPassword: "",
        termAccepted: true
      });
    }
  }, [editingUser]);

  const generateCode = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000);
    const generated = `PRF-${year}-${rand}`;
    setFormData(prev => ({ ...prev, code: generated }));
    if (errors.code) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.code;
        return next;
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleCheckboxToggle = (field: "modalities" | "disciplines" | "classes", item: string) => {
    setFormData(prev => {
      const currentList = prev[field];
      const nextList = currentList.includes(item)
        ? currentList.filter(i => i !== item)
        : [...currentList, item];
      return { ...prev, [field]: nextList };
    });
    
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Nome Completo é obrigatório";
      if (!formData.email.trim()) {
        newErrors.email = "E-mail Profissional é obrigatório";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Insira um e-mail válido";
      }
      if (!formData.phone.trim()) newErrors.phone = "Telefone / WhatsApp é obrigatório";
      if (!formData.code.trim()) newErrors.code = "Matrícula é obrigatória (clique em Gerar)";
      if (!formData.employmentType) newErrors.employmentType = "Selecione o tipo de vínculo";
      if (!formData.schoolId) newErrors.schoolId = "Selecione a Escola / Unidade vinculada";
    }

    if (step === 2) {
      if (formData.modalities.length === 0) {
        newErrors.modalities = "Selecione ao menos uma modalidade de ensino";
      }
      if (formData.disciplines.length === 0) {
        newErrors.disciplines = "Selecione ao menos uma disciplina lecionada";
      }
    }

    if (step === 3) {
      if (formData.classes.length === 0) {
        newErrors.classes = "Selecione ao menos uma turma / classe para atribuição";
      }
    }

    if (step === 4) {
      if (!formData.accessProfile) newErrors.accessProfile = "Selecione o perfil de acesso";
      if (formData.password || formData.confirmPassword) {
        if (formData.password.length < 6) {
          newErrors.password = "A senha deve ter no mínimo 6 caracteres";
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "As senhas não coincidem";
        }
      }
      if (!formData.termAccepted) {
        newErrors.termAccepted = "Você deve aceitar o Termo de Sigilo e Responsabilidade";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSave = async () => {
    if (!validateStep(4)) return;

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        type: formData.accessProfile === "Coordenador" ? "ADMIN" : "PROFESSOR",
        schoolId: formData.schoolId,
        code: formData.code,
        employmentType: formData.employmentType,
        modalities: formData.modalities,
        disciplines: formData.disciplines,
        classes: formData.classes,
        notes: formData.notes,
        status: formData.status,
        password: formData.password
      };

      const url = editingUser 
        ? `/api/admin/users/${editingUser.id}` 
        : "/api/admin/users";
      const method = editingUser ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(editingUser ? "Usuário atualizado com sucesso!" : "Professor cadastrado com sucesso!");
        navigate("/users");
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Ocorreu um erro ao salvar o registro do professor.");
      }
    } catch (saveErr) {
      console.error("Cadastro professor error:", saveErr);
      alert("Falha de conexão com o servidor. Tente novamente mais tarde.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/users")} 
            className="p-2.5 bg-white border border-brand-100 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-brand-50 hover:border-brand-200 transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-3xl heading text-slate-900">{editingUser ? "Editar Usuário" : "Novo Professor"}</h2>
            <p className="text-slate-500 font-medium mt-1">
              {editingUser ? "Atualize os dados do usuário docente ou coordenador no sistema." : "Preencha os dados abaixo para cadastrar um docente ou coordenador no sistema."}
            </p>
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="card-soft p-6">
        <div className="grid grid-cols-4 gap-4 relative">
          {steps.map((step) => {
            const IconComponent = step.icon;
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;

            return (
              <div 
                key={step.id} 
                onClick={() => {
                  // Allow jumping to steps only if previous steps validate
                  if (step.id < currentStep) {
                    setCurrentStep(step.id);
                  } else if (step.id > currentStep) {
                    let canJump = true;
                    for (let s = currentStep; s < step.id; s++) {
                      if (!validateStep(s)) {
                        canJump = false;
                        break;
                      }
                    }
                    if (canJump) setCurrentStep(step.id);
                  }
                }}
                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all ${
                  isActive 
                    ? "bg-brand-50 border-brand-400 shadow-sm" 
                    : isCompleted 
                      ? "bg-emerald-50/50 border-emerald-100" 
                      : "bg-white border-brand-50"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  isActive 
                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/20" 
                    : isCompleted 
                      ? "bg-emerald-500 text-white" 
                      : "bg-slate-100 text-slate-400"
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                </div>
                <div className="hidden md:block">
                  <p className={`text-sm font-bold ${isActive ? 'text-brand-800' : isCompleted ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">{step.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content Card */}
      <div className="card-soft p-10 relative overflow-hidden bg-white">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-50/40 rounded-full blur-3xl -z-10 pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* STEP 1: Dados Gerais e Funcionais */}
            {currentStep === 1 && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <User className="w-5 h-5 text-brand-600" />
                    Dados Pessoais
                  </h3>
                  <div className="h-px bg-brand-50 mt-3 w-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {/* Nome Completo */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                      Nome Completo *
                    </label>
                    <input 
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ex: Amanda Nogueira Castro"
                      className={`w-full ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''}`}
                    />
                    {errors.name && <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.name}</p>}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                      Status *
                    </label>
                    <select 
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full font-semibold text-slate-700"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </div>

                  {/* E-mail Profissional */}
                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                      E-mail Profissional *
                    </label>
                    <input 
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="amanda.docente@escola.com"
                      className={`w-full ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''}`}
                    />
                    {errors.email && <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.email}</p>}
                  </div>

                  {/* Telefone / WhatsApp */}
                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                      Telefone / WhatsApp *
                    </label>
                    <input 
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Ex: (11) 99999-8888"
                      className={`w-full ${errors.phone ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''}`}
                    />
                    {errors.phone && <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.phone}</p>}
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-brand-600" />
                    Dados Funcionais e Vínculo
                  </h3>
                  <div className="h-px bg-brand-50 mt-3 w-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Codigo / Matricula */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                      Código / Matrícula *
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="Clique em Gerar ou digite"
                        className={`flex-1 ${errors.code ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={generateCode}
                        className="secondary !py-2.5 px-4 flex items-center gap-2 hover:bg-brand-50 border-brand-200 transition-all text-sm font-semibold shrink-0"
                      >
                        <RefreshCw className="w-4 h-4 text-brand-600" />
                        Gerar
                      </button>
                    </div>
                    {errors.code && <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.code}</p>}
                  </div>

                  {/* Status do Professor */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                      Status do Professor *
                    </label>
                    <select 
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleChange}
                      className={`w-full ${errors.employmentType ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''}`}
                    >
                      <option value="">Selecione Vínculo</option>
                      <option value="Temporário">Temporário</option>
                      <option value="Efetivo">Efetivo</option>
                    </select>
                    {errors.employmentType && <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.employmentType}</p>}
                  </div>

                  {/* Escola / Unidade Vinculada */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                      Escola / Unidade Vinculada *
                    </label>
                    <select 
                      name="schoolId"
                      value={formData.schoolId}
                      onChange={handleChange}
                      className={`w-full ${errors.schoolId ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''}`}
                    >
                      <option value="">Selecione a Escola</option>
                      {schools.map(school => (
                        <option key={school.id} value={school.id}>{school.name}</option>
                      ))}
                    </select>
                    {errors.schoolId && <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.schoolId}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Foco Acadêmico */}
            {currentStep === 2 && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-brand-600" />
                    Modalidades de Ensino
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">Selecione todas as modalidades nas quais o professor lecionará nesta instituição.</p>
                  <div className="h-px bg-brand-50 mt-3 w-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MODALITIES.map(modality => {
                    const isSelected = formData.modalities.includes(modality);
                    return (
                      <div 
                        key={modality}
                        onClick={() => handleCheckboxToggle("modalities", modality)}
                        className={`p-4 rounded-xl border-2 cursor-pointer select-none transition-all flex items-center justify-between text-sm font-semibold ${
                          isSelected 
                            ? 'bg-brand-50/60 border-brand-500 text-brand-800 shadow-sm'
                            : 'bg-white border-brand-100 text-slate-500 hover:border-brand-200'
                        }`}
                      >
                        <span>{modality}</span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 ml-3" />}
                      </div>
                    );
                  })}
                </div>
                {errors.modalities && (
                  <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />{errors.modalities}
                  </p>
                )}

                <div className="pt-4">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-brand-600" />
                    Disciplinas Lecionadas *
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">Quais disciplinas este profissional está autorizado ou responsável por ministrar.</p>
                  <div className="h-px bg-brand-50 mt-3 w-full" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {DISCIPLINES.map(discipline => {
                    const isSelected = formData.disciplines.includes(discipline);
                    return (
                      <div 
                        key={discipline}
                        onClick={() => handleCheckboxToggle("disciplines", discipline)}
                        className={`p-4 rounded-xl border-2 cursor-pointer select-none transition-all flex items-center justify-between text-sm font-semibold ${
                          isSelected 
                            ? 'bg-brand-50/60 border-brand-500 text-brand-800 shadow-sm'
                            : 'bg-white border-brand-100 text-slate-500 hover:border-brand-200'
                        }`}
                      >
                        <span>{discipline}</span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 ml-3" />}
                      </div>
                    );
                  })}
                </div>
                {errors.disciplines && (
                  <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />{errors.disciplines}
                  </p>
                )}
              </div>
            )}

            {/* STEP 3: Alocação de Turmas */}
            {currentStep === 3 && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <Building className="w-5 h-5 text-brand-600" />
                    Turmas / Classes Vinculadas *
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">Defina à quais turmas do sistema o professor terá acesso irrestrito para emissão de avaliações, planos de aula e relatórios.</p>
                  <div className="h-px bg-brand-50 mt-3 w-full" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {CLASSES.map(cls => {
                    const isSelected = formData.classes.includes(cls);
                    return (
                      <div 
                        key={cls}
                        onClick={() => handleCheckboxToggle("classes", cls)}
                        className={`p-4 rounded-xl border-2 text-center cursor-pointer select-none transition-all font-semibold text-sm ${
                          isSelected 
                            ? 'bg-brand-50 border-brand-500 text-brand-800 shadow-sm'
                            : 'bg-white border-brand-100 text-slate-500 hover:border-brand-200'
                        }`}
                      >
                        <p>{cls}</p>
                        {isSelected && <span className="text-[10px] font-bold text-brand-600 block mt-1 uppercase">Vinculado</span>}
                      </div>
                    );
                  })}
                </div>
                {errors.classes && (
                  <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />{errors.classes}
                  </p>
                )}

                <div className="pt-4">
                  <h3 className="text-xl font-bold text-slate-800">Observações Gerais</h3>
                  <p className="text-sm text-slate-400 mt-1">Adicione observações relevantes, anotações de currículo ou restrições de horários.</p>
                  <div className="h-px bg-brand-50 mt-3" />
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Digite observações sobre as turmas, horários específicos ou diretrizes pedagógicas..."
                    className="w-full mt-6"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Acesso ao Sistema */}
            {currentStep === 4 && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <Lock className="w-5 h-5 text-brand-600" />
                    Configuração de Acesso ao Sistema
                  </h3>
                  <div className="h-px bg-brand-50 mt-3 w-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Perfil de Acesso */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                      Perfil de Acesso *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {["Professor", "Coordenador"].map(profile => {
                        const isSelected = formData.accessProfile === profile;
                        return (
                          <div
                            key={profile}
                            onClick={() => setFormData(prev => ({ ...prev, accessProfile: profile }))}
                            className={`p-4 rounded-xl border-2 text-center cursor-pointer font-bold text-sm transition-all ${
                              isSelected 
                                ? "bg-brand-50 border-brand-500 text-brand-800 shadow-sm"
                                : "bg-white border-brand-100 text-slate-500 hover:border-brand-200"
                            }`}
                          >
                            {profile}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Informacoes de Primeiro Acesso */}
                  <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100 flex gap-4">
                    <Info className="w-6 h-6 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-brand-800">Convite por E-mail</p>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        O acesso ao sistema é concedido via convite enviado por e-mail após a confirmação deste cadastro. 
                        A senha inicial do professor poderá ser definida pelo próprio profissional no seu primeiro acesso após aceitar o convite, ou definida previamente abaixo de forma opcional.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {/* Senha Inicial (Opcional) */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                      Senha Inicial (Opcional)
                    </label>
                    <input 
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full ${errors.password ? 'border-red-400 focus:border-red-500' : ''}`}
                    />
                    {errors.password && <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.password}</p>}
                    <p className="text-slate-400 text-[10px] uppercase font-bold mt-2">Mínimo 6 caracteres se preenchido</p>
                  </div>

                  {/* Confirmar Senha */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                      Confirmar Senha
                    </label>
                    <input 
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full ${errors.confirmPassword ? 'border-red-400 focus:border-red-500' : ''}`}
                    />
                    {errors.confirmPassword && <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Aceite de Regras e Termos */}
                <div className="pt-4">
                  <div className={`p-6 rounded-2xl border flex items-start gap-4 transition-all duration-300 ${
                    formData.termAccepted ? "bg-emerald-50/40 border-emerald-100" : "bg-red-50/10 border-red-100/50"
                  }`}>
                    <input 
                      type="checkbox"
                      id="termAccepted"
                      name="termAccepted"
                      checked={formData.termAccepted}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, termAccepted: e.target.checked }));
                        if (errors.termAccepted) {
                          setErrors(prev => {
                            const next = { ...prev };
                            delete next.termAccepted;
                            return next;
                          });
                        }
                      }}
                      className="w-5 h-5 rounded border-brand-300 text-brand-600 focus:ring-brand-500/20 shrink-0 mt-0.5 cursor-pointer"
                    />
                    <label htmlFor="termAccepted" className="text-sm font-semibold text-slate-700 leading-relaxed cursor-pointer select-none">
                      Declaro que li e aceito o <span className="text-brand-600 hover:underline">Termo de Sigilo e Responsabilidade</span> do sistema. *
                      <span className="block text-xs font-medium text-slate-400 mt-1">Garantindo a confidencialidade e a ética no tratamento de dados sensíveis de todos os alunos cadastrados.</span>
                    </label>
                  </div>
                  {errors.termAccepted && <p className="text-xs font-bold text-red-500 mt-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.termAccepted}</p>}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Form Action Controls */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-brand-50">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1 || isSaving}
            className={`secondary flex items-center gap-2 ${
              (currentStep === 1 || isSaving) ? "opacity-30 cursor-not-allowed pointer-events-none" : ""
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="primary flex items-center gap-2"
            >
              Próximo
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`primary flex items-center gap-2 !bg-emerald-600 hover:!bg-emerald-700 shadow-emerald-600/10 ${
                isSaving ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {isSaving ? (
                <>Salvando...</>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Cadastro
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
