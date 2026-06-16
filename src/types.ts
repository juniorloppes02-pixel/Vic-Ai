export enum UserType {
  ADMIN = "ADMIN",
  COORDENADOR = "COORDENADOR",
  PROFESSOR = "PROFESSOR",
  SECRETARIA = "SECRETARIA",
}

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  schoolId: string | null;
}

export interface School {
  id: string;
  name: string;
  region: string;
  studentsCount: number;
}

export interface Student {
  id: string;
  code: string;
  name: string;
  schoolId: string;
  age: number;
  gender: string;
  grade: string;
  responsible: string;
  phone?: string;
  teaLevel: string;
  status: string;
  diagnosis: string;
  professional: string;
  communication: string;
  attention: string;
  sensitivity: string;
  crises: string;
  memory: string;
  comprehension: string;
  motricity: string;
  teacherBond: string;
  performance: string;
  hyperfocus: string;
  pedagogicalObjective: string;
  photoUrl?: string;
  medicalReportUrl?: string;
  period?: "Manhã" | "Tarde" | "Integral";
  enrolmentTime?: string;
  supportTeacher?: "Sim" | "Não";
  resourceRoom?: "Sim" | "Não" | "Em avaliação";
  pei?: "Sim" | "Não" | "Em elaboração";
  adaptations?: string;
  academicHistory?: string;
  teacherName?: string;
  teacherId?: string;
  condition?: "TEA" | "TDAH" | "TEA + TDAH";
  adhdSubtype?: string;
  adhdIntensity?: string;
  lastRpiDate?: string;
}

export interface Report {
  id: string;
  studentId: string;
  date: string;
  behavior: string;
  participation: string;
  progress: string;
  difficulties: string;
  crises: string;
  reading: string;
  writing: string;
  logic: string;
  pendingTasks: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  date: string;
}

export interface DashboardData {
  totalStudents: number;
  totalTeachers: number;
  totalPlans: number;
  totalSchools: number;
  averageGrowth: number;
}

export interface LessonPlan {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  objective: string;
  activities: { title: string; content: string }[];
  sensoryTips: { title: string; content: string }[];
  feedback?: "Útil" | "Pouco Útil" | "Não Útil";
}

export interface Feedback {
  id: string;
  userId: string;
  type: "SUGGESTION" | "BUG" | "SUPPORT";
  subject: string;
  message: string;
  date: string;
}

export interface BackupLog {
  id: string;
  date: string;
  status: "SUCCESS" | "FAILED";
  triggerType: "AUTOMATIC" | "MANUAL";
  recordsCount: {
    students: number;
    teachers: number;
    reports: number;
  };
  summary: string;
  payload: string; // JSON containing full data
  storageLocation: "SUPABASE_DB" | "IN_MEMORY_FALLBACK";
  errorMessage: string | null;
}

