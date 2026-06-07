-- SCRIPT PARA CONFIGURAÇÃO DO BANCO NO SUPABASE SQL EDITOR

-- 1. Tabela de Escolas
CREATE TABLE schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  studentsCount INTEGER DEFAULT 0
);

-- 2. Tabela de Usuários
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('ADMIN', 'PROFESSOR')),
  schoolId UUID REFERENCES schools(id)
);

-- 3. Tabela de Alunos
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  schoolId UUID REFERENCES schools(id),
  age INTEGER,
  gender TEXT,
  grade TEXT,
  responsible TEXT,
  phone TEXT,
  teaLevel TEXT,
  status TEXT DEFAULT 'Ativo',
  diagnosis TEXT,
  professional TEXT,
  communication TEXT,
  attention TEXT,
  sensitivity TEXT,
  crises TEXT,
  memory TEXT,
  comprehension TEXT,
  motricity TEXT,
  teacherBond TEXT,
  performance TEXT,
  hyperfocus TEXT,
  pedagogicalObjective TEXT,
  photoUrl TEXT,
  medicalReportUrl TEXT,
  period TEXT,
  enrolmentTime TEXT,
  supportTeacher TEXT,
  resourceRoom TEXT,
  pei TEXT,
  adaptations TEXT,
  academicHistory TEXT
);

-- 4. Tabela de Relatórios
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  studentId UUID REFERENCES students(id),
  date DATE DEFAULT CURRENT_DATE,
  behavior TEXT,
  participation TEXT,
  progress TEXT,
  difficulties TEXT,
  crises TEXT,
  reading TEXT,
  writing TEXT,
  logic TEXT,
  pendingTasks TEXT
);

-- 5. Tabela de Planos de Aula
CREATE TABLE lesson_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  studentId UUID REFERENCES students(id),
  studentName TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  objective TEXT,
  activities JSONB,
  sensoryTips JSONB,
  feedback TEXT CHECK (feedback IN ('Útil', 'Pouco Útil', 'Não Útil'))
);

-- 6. Tabela de Feedbacks do Sistema
CREATE TABLE feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  userId TEXT,
  type TEXT CHECK (type IN ('SUGGESTION', 'BUG', 'SUPPORT')),
  subject TEXT,
  message TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabela de Auditoria
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user" TEXT,
  action TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INSERIR USUÁRIO ADMIN PADRÃO
INSERT INTO users (id, name, email, type) 
VALUES (gen_random_uuid(), 'Administrador EducaFlow', 'admin@educaflow.com', 'ADMIN')
ON CONFLICT (email) DO NOTHING;
