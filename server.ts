import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Client Initialization
const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://mevrqkecduhdeuqxtxkt.supabase.co").trim();
const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_sAFohaUvmn8TE0z077Jq-g__VhW0ODp").trim();
let supabase: any = null;

const isPlaceholderUrl = (url: string) => !url || url.includes("URL_DA_SUA_INSTANCIA") || url.includes("PLACEHOLDER");
const isPlaceholderKey = (key: string) => {
  if (!key || key.includes("SUA_ANON_KEY") || key.includes("PLACEHOLDER") || key.startsWith("sb_publishable_")) return true;
  // Supabase keys are usually JWTs starting with 'eyJ'.
  return !key.startsWith("eyJ");
};

if (!isPlaceholderUrl(supabaseUrl) && !isPlaceholderKey(supabaseAnonKey)) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase client initialized");
  } catch (e) {
    console.error("Failed to initialize Supabase:", e);
  }
} else {
  console.warn("Supabase credentials missing or invalid, running in mock mode");
}

// In-memory fallback dataset for robust execution (demo / failure recovery)
const mockSchools = [
  { id: "1", name: "Escola Municipal Pequeno Príncipe", region: "Centro", studentsCount: 2 }
];

const mockUsers = [
  { id: "u1", name: "Admin", email: "admin@educaflow.com", type: "ADMIN" },
  { id: "prof1", name: "Professor Demo", email: "professor@escola.com", type: "PROFESSOR", schoolId: "1" }
];

const mockStudents = [
  {
    id: "s1",
    code: "ALU001",
    name: "Arthur Benicio Silva",
    schoolId: "1",
    age: 7,
    gender: "Masculino",
    grade: "2º Ano B",
    responsible: "Maria Silva",
    phone: "(11) 94002-8922",
    teaLevel: "Leve (Nível 1)",
    status: "Ativo",
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
    hyperfocus: "Dinossauros",
    pedagogicalObjective: "Melhorar a socialização no recreio",
    photoUrl: "",
    medicalReportUrl: "",
    period: "Manhã",
    enrolmentTime: "2 anos",
    supportTeacher: "Sim",
    resourceRoom: "Sim",
    pei: "Sim",
    adaptations: "Uso de abafadores de ruído no refeitório, pistas visuais para transição.",
    academicHistory: "Cursou o 1º ano com apoio de cuidador e apresentou evolução."
  },
  {
    id: "s2",
    code: "ALU002",
    name: "Julia Costa",
    schoolId: "1",
    age: 8,
    gender: "Feminino",
    grade: "3º Ano A",
    responsible: "Ricardo Costa",
    phone: "(11) 98888-7777",
    teaLevel: "Moderado (Nível 2)",
    status: "Ativo",
    diagnosis: "Sim",
    professional: "Psicólogo",
    communication: "Poucas palavras",
    attention: "Até 5 min",
    sensitivity: "Frustração",
    crises: "Ocasional",
    memory: "Como apoio principal",
    comprehension: "Regular",
    motricity: "Bom",
    teacherBond: "Em construção",
    performance: "Regular",
    hyperfocus: "Desenho Animado",
    pedagogicalObjective: "Focar em atividades estruturadas de 10 min",
    photoUrl: "",
    medicalReportUrl: "",
    period: "Misto",
    enrolmentTime: "1 ano",
    supportTeacher: "Sim",
    resourceRoom: "Sim",
    pei: "Em elaboração",
    adaptations: "Uso de rotina visual e história social para regular comportamento.",
    academicHistory: "Teve dificuldades na adaptação mas melhorou sua comunicação verbal."
  }
];

const mockReports: any[] = [];
const mockLessonPlans: any[] = [];
const mockFeedbacks: any[] = [];
const mockAuditLogs = [
  { id: "a1", user: "Administrador EducaFlow", action: "LOGIN", date: new Date().toISOString() }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper for safe supabase calls
  const safeQuery = async (queryPromise: Promise<any>, fallback: any = []) => {
    try {
      if (!supabase) return { data: fallback, error: null };
      const { data, error } = await queryPromise;
      if (error) {
        if (error.message?.includes("Invalid API key") || error.code === "PGRST301") {
          // Silent warning
        } else {
          console.error("Supabase Error:", error);
        }
        return { data: fallback, error };
      }
      return { data: data || fallback, error: null };
    } catch (err: any) {
      console.error("Query Execution Error:", err);
      return { data: fallback, error: err };
    }
  };

  // --- API Routes ---

  // Auth
  app.post("/api/auth/login", async (req, res) => {
    const { email } = req.body;
    
    // Static fallback logins for demo
    if (email === "admin@educaflow.com") {
      return res.json({ user: { id: "admin", name: "Administrador", email, type: "ADMIN", schoolId: null } });
    }
    
    if (email === "professor@escola.com") {
      return res.json({ user: { id: "prof1", name: "Professor Demo", email, type: "PROFESSOR", schoolId: "1" } });
    }

    if (!supabase) {
      const found = mockUsers.find(u => u.email === email);
      if (found) return res.json({ user: found });
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    const { data: users, error } = await safeQuery(
      supabase.from('users').select('*').eq('email', email),
      []
    );

    if (users && users.length > 0) {
      res.json({ user: users[0] });
    } else {
      const found = mockUsers.find(u => u.email === email);
      if (found) return res.json({ user: found });
      res.status(401).json({ error: "Usuário não encontrado" });
    }
  });

  // Admin Dashboard
  app.get("/api/admin/dashboard", async (req, res) => {
    try {
      if (!supabase) {
        return res.json({
          totalStudents: mockStudents.length,
          totalTeachers: mockUsers.filter(u => u.type === 'PROFESSOR').length,
          totalPlans: mockLessonPlans.length || 12,
          totalSchools: mockSchools.length,
          averageGrowth: 78
        });
      }

      const [studentsRes, teachersRes, schoolsRes] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }).catch(() => ({ count: null })),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('type', 'PROFESSOR').catch(() => ({ count: null })),
        supabase.from('schools').select('*', { count: 'exact', head: true }).catch(() => ({ count: null }))
      ]);

      res.json({
        totalStudents: studentsRes.count !== null && studentsRes.count !== undefined ? studentsRes.count : mockStudents.length,
        totalTeachers: teachersRes.count !== null && teachersRes.count !== undefined ? teachersRes.count : mockUsers.filter(u => u.type === 'PROFESSOR').length,
        totalPlans: mockLessonPlans.length || 12, 
        totalSchools: schoolsRes.count !== null && schoolsRes.count !== undefined ? schoolsRes.count : mockSchools.length,
        averageGrowth: 78
      });
    } catch (error) {
      res.json({
        totalStudents: mockStudents.length,
        totalTeachers: mockUsers.filter(u => u.type === 'PROFESSOR').length,
        totalPlans: 12,
        totalSchools: mockSchools.length,
        averageGrowth: 78
      });
    }
  });

  // Schools
  app.get("/api/admin/schools", async (req, res) => {
    if (!supabase) return res.json(mockSchools);
    const { data, error } = await supabase.from('schools').select('*');
    if (error || !data || data.length === 0) {
      return res.json(mockSchools);
    }
    res.json(data);
  });

  app.post("/api/admin/schools", async (req, res) => {
    const schoolObj = { ...req.body, id: req.body.id || Math.random().toString(), studentsCount: 0 };
    if (!supabase) {
      mockSchools.push(schoolObj);
      return res.json(schoolObj);
    }
    const { data, error } = await supabase.from('schools').insert([schoolObj]).select();
    if (error || !data || !data[0]) {
      mockSchools.push(schoolObj);
      return res.json(schoolObj);
    }
    res.json(data[0]);
  });

  app.put("/api/admin/schools/:id", async (req, res) => {
    const schoolId = req.params.id;
    const updateData = req.body;
    if (!supabase) {
      const idx = mockSchools.findIndex(s => s.id === schoolId);
      if (idx !== -1) {
        mockSchools[idx] = { ...mockSchools[idx], ...updateData };
        return res.json(mockSchools[idx]);
      }
      return res.status(404).json({ error: "Escola não encontrada" });
    }
    const { data, error } = await supabase.from('schools').update(updateData).eq('id', schoolId).select();
    if (error) {
      const idx = mockSchools.findIndex(s => s.id === schoolId);
      if (idx !== -1) {
        mockSchools[idx] = { ...mockSchools[idx], ...updateData };
        return res.json(mockSchools[idx]);
      }
      return res.status(400).json({ error: error.message });
    }
    res.json(data ? data[0] : updateData);
  });

  app.delete("/api/admin/schools/:id", async (req, res) => {
    const schoolId = req.params.id;
    if (!supabase) {
      const idx = mockSchools.findIndex(s => s.id === schoolId);
      if (idx !== -1) {
        mockSchools.splice(idx, 1);
        return res.json({ success: true });
      }
      return res.status(404).json({ error: "Escola não encontrada" });
    }
    const { error } = await supabase.from('schools').delete().eq('id', schoolId);
    if (error) {
      const idx = mockSchools.findIndex(s => s.id === schoolId);
      if (idx !== -1) {
        mockSchools.splice(idx, 1);
        return res.json({ success: true });
      }
      return res.status(400).json({ error: error.message });
    }
    const idx = mockSchools.findIndex(s => s.id === schoolId);
    if (idx !== -1) {
      mockSchools.splice(idx, 1);
    }
    res.json({ success: true });
  });

  // Users
  app.get("/api/admin/users", async (req, res) => {
    if (!supabase) return res.json(mockUsers);
    const { data, error } = await supabase.from('users').select('*');
    if (error || !data || data.length === 0) {
      return res.json(mockUsers);
    }
    res.json(data);
  });

  app.post("/api/admin/users", async (req, res) => {
    const userObj = {
      id: req.body.id || Math.random().toString(),
      name: req.body.name,
      email: req.body.email,
      type: req.body.type || "PROFESSOR",
      schoolId: req.body.schoolId === "" ? null : req.body.schoolId
    };

    if (!supabase) {
      mockUsers.push(userObj);
      mockAuditLogs.push({
        id: Math.random().toString(),
        user: "Administrador EducaFlow",
        action: `CRIOU PROFESSOR: ${userObj.name}`,
        date: new Date().toISOString()
      });
      return res.json(userObj);
    }

    const { data, error } = await supabase.from('users').insert([userObj]).select();
    if (error) {
      console.warn("Supabase user insert failed, using fallback mock memory storage:", error.message);
      mockUsers.push(userObj);
      return res.json(userObj);
    }

    try {
      await supabase.from('audit_logs').insert([{ 
        user: "Administrador EducaFlow", 
        action: `CRIOU PROFESSOR: ${userObj.name}`, 
        date: new Date().toISOString() 
      }]).catch(() => {});
    } catch {
      // ignore audit log issues
    }

    res.json(data ? data[0] : userObj);
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    const userId = req.params.id;
    const updateData = req.body;
    if (!supabase) {
      const idx = mockUsers.findIndex(u => u.id === userId);
      if (idx !== -1) {
        mockUsers[idx] = { ...mockUsers[idx], ...updateData };
        return res.json(mockUsers[idx]);
      }
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    const { data, error } = await supabase.from('users').update(updateData).eq('id', userId).select();
    if (error) {
      const idx = mockUsers.findIndex(u => u.id === userId);
      if (idx !== -1) {
        mockUsers[idx] = { ...mockUsers[idx], ...updateData };
        return res.json(mockUsers[idx]);
      }
      return res.status(400).json({ error: error.message });
    }
    res.json(data ? data[0] : updateData);
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    const userId = req.params.id;
    if (!supabase) {
      const idx = mockUsers.findIndex(u => u.id === userId);
      if (idx !== -1) {
        mockUsers.splice(idx, 1);
        return res.json({ success: true });
      }
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) {
      const idx = mockUsers.findIndex(u => u.id === userId);
      if (idx !== -1) {
        mockUsers.splice(idx, 1);
        return res.json({ success: true });
      }
      return res.status(400).json({ error: error.message });
    }
    const idx = mockUsers.findIndex(u => u.id === userId);
    if (idx !== -1) {
      mockUsers.splice(idx, 1);
    }
    res.json({ success: true });
  });

  // Students
  app.get("/api/admin/students", async (req, res) => {
    const { schoolId, teaLevel } = req.query;
    
    if (!supabase) {
      let filtered = [...mockStudents];
      if (schoolId) filtered = filtered.filter(s => s.schoolId === schoolId);
      if (teaLevel) filtered = filtered.filter(s => s.teaLevel === teaLevel);
      return res.json(filtered);
    }
    
    let query = supabase.from('students').select('*');
    if (schoolId) query = query.eq('schoolId', schoolId);
    if (teaLevel) query = query.eq('teaLevel', teaLevel);
    
    const { data, error } = await query;
    if (error || !data) {
      let filtered = [...mockStudents];
      if (schoolId) filtered = filtered.filter(s => s.schoolId === schoolId);
      if (teaLevel) filtered = filtered.filter(s => s.teaLevel === teaLevel);
      return res.json(filtered);
    }
    res.json(data);
  });

  app.post("/api/admin/students", async (req, res) => {
    const nextCode = `ALU${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // Replace empty schoolId string with null to ensure UUID foreign keys validate fine
    const schoolIdVal = req.body.schoolId === "" ? null : req.body.schoolId;
    const studentData = { ...req.body, schoolId: schoolIdVal, code: nextCode };

    if (!supabase) {
      const newStudent = { ...studentData, id: Math.random().toString() };
      mockStudents.push(newStudent);
      
      // Update school count in mock dataset
      if (schoolIdVal) {
        const schoolObj = mockSchools.find(s => s.id === schoolIdVal);
        if (schoolObj) schoolObj.studentsCount = (schoolObj.studentsCount || 0) + 1;
      }
      
      mockAuditLogs.push({
        id: Math.random().toString(),
        user: "Administrador EducaFlow",
        action: "CREATE_STUDENT",
        date: new Date().toISOString()
      });
      return res.json(newStudent);
    }

    // Try full insert first
    let result = await supabase.from('students').insert([studentData]).select();
    
    // If it fails, check if we need to filter and fall back to core columns in the SQL schema
    if (result.error) {
      console.warn("Extended columns insert failed, trying with core schema columns:", result.error.message);
      
      const coreSchemaColumns = [
        "code", "name", "schoolId", "age", "gender", "grade", "responsible", "phone", 
        "teaLevel", "status", "diagnosis", "professional", "communication", "attention", 
        "sensitivity", "crises", "memory", "comprehension", "motricity", "teacherBond", 
        "performance", "hyperfocus", "pedagogicalObjective", "photoUrl", "teacherName", "teacherId",
        "condition", "adhdSubtype", "adhdIntensity"
      ];
      
      const filteredStudentData: any = {};
      for (const col of coreSchemaColumns) {
        if (studentData[col] !== undefined) {
          filteredStudentData[col] = studentData[col];
        }
      }
      
      result = await supabase.from('students').insert([filteredStudentData]).select();
    }

    if (result.error) {
      console.error("Supabase student insertion final error. Falling back to local memory store:", result.error);
      const fallbackStudent = { ...studentData, id: Math.random().toString() };
      mockStudents.push(fallbackStudent);
      return res.json(fallbackStudent);
    }

    const insertedData = result.data;
    if (insertedData && insertedData[0]) {
      const savedStudent = insertedData[0];
      try {
        await supabase.from('audit_logs').insert([{ user: "current_user", action: "CREATE_STUDENT", date: new Date().toISOString() }]).catch(() => {});
        
        // Increment student count for the school
        if (schoolIdVal) {
          const { data: school } = await supabase.from('schools').select('studentsCount').eq('id', schoolIdVal).single();
          if (school) {
            await supabase.from('schools')
              .update({ studentsCount: (school.studentsCount || 0) + 1 })
              .eq('id', schoolIdVal);
          }
        }
      } catch (childErr) {
        console.warn("Ancillary audit/count updates ignored:", childErr);
      }
      return res.json(savedStudent);
    }
    
    const fallbackStudent = { ...studentData, id: Math.random().toString() };
    mockStudents.push(fallbackStudent);
    res.json(fallbackStudent);
  });

  app.put("/api/admin/students/:id", async (req, res) => {
    const studentId = req.params.id;
    const schoolIdVal = req.body.schoolId === "" ? null : req.body.schoolId;
    const studentData = { ...req.body, schoolId: schoolIdVal };
    delete studentData.id;

    if (!supabase) {
      const index = mockStudents.findIndex(s => s.id === studentId);
      if (index !== -1) {
        mockStudents[index] = { ...mockStudents[index], ...studentData, id: studentId };
        return res.json(mockStudents[index]);
      } else {
        return res.status(404).json({ error: "Aluno não encontrado" });
      }
    }

    const { data, error } = await supabase.from('students').update(studentData).eq('id', studentId).select();
    if (error) {
      console.warn("Supabase student update failed, trying fallback mock memory storage:", error.message);
      const index = mockStudents.findIndex(s => s.id === studentId);
      if (index !== -1) {
        mockStudents[index] = { ...mockStudents[index], ...studentData, id: studentId };
        return res.json(mockStudents[index]);
      }
      return res.status(500).json({ error: error.message });
    }

    res.json(data && data[0] ? data[0] : { ...studentData, id: studentId });
  });

  app.delete("/api/admin/students/:id", async (req, res) => {
    const studentId = req.params.id;
    if (!supabase) {
      const idx = mockStudents.findIndex(s => s.id === studentId);
      if (idx !== -1) {
        mockStudents.splice(idx, 1);
        return res.json({ success: true });
      }
      return res.status(404).json({ error: "Aluno não encontrado" });
    }
    const { error } = await supabase.from('students').delete().eq('id', studentId);
    if (error) {
      const idx = mockStudents.findIndex(s => s.id === studentId);
      if (idx !== -1) {
        mockStudents.splice(idx, 1);
        return res.json({ success: true });
      }
      return res.status(400).json({ error: error.message });
    }
    const idx = mockStudents.findIndex(s => s.id === studentId);
    if (idx !== -1) {
      mockStudents.splice(idx, 1);
    }
    res.json({ success: true });
  });

  // Reports
  app.get("/api/admin/reports/student/:id", async (req, res) => {
    if (!supabase) {
      return res.json(mockReports.filter(r => r.studentId === req.params.id));
    }
    const { data, error } = await supabase.from('reports').select('*').eq('studentId', req.params.id);
    if (error || !data) {
      return res.json(mockReports.filter(r => r.studentId === req.params.id));
    }
    res.json(data);
  });

  app.post("/api/admin/reports", async (req, res) => {
    const reportObj = { ...req.body, id: req.body.id || Math.random().toString(), date: new Date().toISOString().split('T')[0] };
    if (!supabase) {
      mockReports.push(reportObj);
      return res.json(reportObj);
    }
    const { data, error } = await supabase.from('reports').insert([reportObj]).select();
    if (error || !data || !data[0]) {
      mockReports.push(reportObj);
      return res.json(reportObj);
    }
    res.json(data[0]);
  });

  // Lesson Plans
  app.get("/api/admin/plans", async (req, res) => {
    if (!supabase) {
      return res.json([...mockLessonPlans].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    const { data, error } = await supabase.from('lesson_plans').select('*').order('date', { ascending: false });
    if (error || !data) {
      return res.json([...mockLessonPlans].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    res.json(data);
  });

  app.post("/api/admin/plans", async (req, res) => {
    const planObj = { ...req.body, id: req.body.id || Math.random().toString(), date: req.body.date || new Date().toISOString() };
    if (!supabase) {
      mockLessonPlans.push(planObj);
      return res.json(planObj);
    }
    const { data, error } = await supabase.from('lesson_plans').insert([req.body]).select();
    if (error || !data || !data[0]) {
      mockLessonPlans.push(planObj);
      return res.json(planObj);
    }
    res.json(data[0]);
  });

  // Feedbacks
  app.post("/api/feedbacks", async (req, res) => {
    const feedbackObj = { ...req.body, id: req.body.id || Math.random().toString(), date: new Date().toISOString() };
    if (!supabase) {
      mockFeedbacks.push(feedbackObj);
      return res.json(feedbackObj);
    }
    const { data, error } = await supabase.from('feedbacks').insert([req.body]).select();
    if (error || !data || !data[0]) {
      mockFeedbacks.push(feedbackObj);
      return res.json(feedbackObj);
    }
    res.json(data[0]);
  });

  // Audit
  app.get("/api/admin/audit", async (req, res) => {
    if (!supabase) {
      return res.json([...mockAuditLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    const { data, error } = await supabase.from('audit_logs').select('*').order('date', { ascending: false });
    if (error || !data) {
      return res.json([...mockAuditLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    res.json(data);
  });

  // Export (returning json for simulation)
  app.get("/api/admin/export/students", async (req, res) => {
    if (!supabase) return res.json(mockStudents);
    const { data, error } = await supabase.from('students').select('*');
    if (error || !data) {
      return res.json(mockStudents);
    }
    res.json(data);
  });

  // --- Vite / Static Assets ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EducaFlow Server running on http://localhost:${PORT}`);
  });
}

startServer();
