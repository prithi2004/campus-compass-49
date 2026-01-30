
-- =============================================
-- ROLE MANAGEMENT SYSTEM (Security First)
-- =============================================

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'student');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- =============================================
-- CORE TABLES
-- =============================================

-- Profiles (basic user info)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Departments
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  hod_id UUID,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Academic Years
CREATE TABLE public.academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Courses/Programs
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  duration_years INTEGER NOT NULL DEFAULT 4,
  total_semesters INTEGER NOT NULL DEFAULT 8,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subject type enum
CREATE TYPE public.subject_type AS ENUM ('theory', 'practical', 'both');

-- Subjects
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  semester INTEGER NOT NULL,
  credits INTEGER NOT NULL DEFAULT 3,
  subject_type subject_type NOT NULL DEFAULT 'theory',
  theory_hours INTEGER DEFAULT 0,
  practical_hours INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- STAFF MANAGEMENT
-- =============================================

-- Staff status enum
CREATE TYPE public.staff_status AS ENUM ('active', 'on_leave', 'resigned', 'retired');

-- Staff table
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE,
  staff_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  designation TEXT NOT NULL,
  qualification TEXT,
  specialization TEXT,
  join_date DATE NOT NULL,
  end_date DATE,
  status staff_status NOT NULL DEFAULT 'active',
  is_hod BOOLEAN DEFAULT false,
  max_hours_per_week INTEGER DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update departments HOD reference
ALTER TABLE public.departments ADD CONSTRAINT fk_hod FOREIGN KEY (hod_id) REFERENCES public.staff(id) ON DELETE SET NULL;

-- Staff-Subject mapping
CREATE TABLE public.staff_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_id, subject_id, academic_year_id)
);

-- =============================================
-- STUDENT MANAGEMENT
-- =============================================

-- Student status enum
CREATE TYPE public.student_status AS ENUM ('active', 'graduated', 'dropped', 'suspended');

-- Students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE,
  student_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  current_semester INTEGER NOT NULL DEFAULT 1,
  admission_date DATE NOT NULL,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
  status student_status NOT NULL DEFAULT 'active',
  guardian_name TEXT,
  guardian_phone TEXT,
  blood_group TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Classes/Sections
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  semester INTEGER NOT NULL,
  section TEXT DEFAULT 'A',
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  class_teacher_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  max_strength INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, semester, section, academic_year_id)
);

-- Student-Class enrollment
CREATE TABLE public.student_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  roll_number INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, class_id)
);

-- =============================================
-- TIMETABLE MANAGEMENT
-- =============================================

-- Rooms
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  building TEXT,
  floor INTEGER,
  capacity INTEGER NOT NULL DEFAULT 60,
  room_type TEXT NOT NULL DEFAULT 'classroom',
  has_projector BOOLEAN DEFAULT true,
  has_ac BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Time slots
CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_order INTEGER NOT NULL,
  is_break BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(start_time, end_time)
);

-- Days enum
CREATE TYPE public.weekday AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');

-- Timetable entries
CREATE TABLE public.timetable_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  time_slot_id UUID REFERENCES public.time_slots(id) ON DELETE CASCADE NOT NULL,
  day weekday NOT NULL,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Prevent clashes
  UNIQUE(class_id, day, time_slot_id),
  UNIQUE(staff_id, day, time_slot_id),
  UNIQUE(room_id, day, time_slot_id)
);

-- =============================================
-- ATTENDANCE MANAGEMENT
-- =============================================

-- Attendance status enum
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'excused');

-- Student Attendance
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  time_slot_id UUID REFERENCES public.time_slots(id) ON DELETE SET NULL,
  status attendance_status NOT NULL DEFAULT 'present',
  marked_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject_id, date, time_slot_id)
);

-- Staff Attendance
CREATE TABLE public.staff_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status attendance_status NOT NULL DEFAULT 'present',
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_id, date)
);

-- =============================================
-- EXAM MANAGEMENT
-- =============================================

-- Exam type enum
CREATE TYPE public.exam_type AS ENUM ('internal', 'midterm', 'final', 'practical', 'quiz');

-- Exams
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  exam_type exam_type NOT NULL,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exam Schedule
CREATE TABLE public.exam_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  max_marks INTEGER NOT NULL DEFAULT 100,
  passing_marks INTEGER NOT NULL DEFAULT 40,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exam Results
CREATE TABLE public.exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_schedule_id UUID REFERENCES public.exam_schedules(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  marks_obtained DECIMAL(5,2),
  grade TEXT,
  remarks TEXT,
  is_absent BOOLEAN DEFAULT false,
  evaluated_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(exam_schedule_id, student_id)
);

-- Question Papers
CREATE TABLE public.question_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- FEE MANAGEMENT
-- =============================================

-- Fee types
CREATE TABLE public.fee_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_recurring BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fee structures
CREATE TABLE public.fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  fee_type_id UUID REFERENCES public.fee_types(id) ON DELETE CASCADE NOT NULL,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  semester INTEGER,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, fee_type_id, academic_year_id, semester)
);

-- Payment status enum
CREATE TYPE public.payment_status AS ENUM ('pending', 'partial', 'paid', 'overdue', 'waived');

-- Student Fees
CREATE TABLE public.student_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  fee_structure_id UUID REFERENCES public.fee_structures(id) ON DELETE CASCADE NOT NULL,
  amount_due DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  status payment_status NOT NULL DEFAULT 'pending',
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fee Payments
CREATE TABLE public.fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_fee_id UUID REFERENCES public.student_fees(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  payment_method TEXT NOT NULL DEFAULT 'cash',
  transaction_id TEXT,
  receipt_number TEXT UNIQUE,
  remarks TEXT,
  received_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- LEAVE MANAGEMENT
-- =============================================

-- Leave status enum
CREATE TYPE public.leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- Leave Types
CREATE TABLE public.leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  max_days INTEGER NOT NULL DEFAULT 10,
  is_paid BOOLEAN DEFAULT true,
  applies_to app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Leave Requests
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  leave_type_id UUID REFERENCES public.leave_types(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status leave_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- NOTIFICATIONS
-- =============================================

-- Notification type enum
CREATE TYPE public.notification_type AS ENUM ('general', 'academic', 'fee', 'exam', 'attendance', 'leave', 'urgent');

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'general',
  target_role app_role,
  target_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- POINTS/REWARDS SYSTEM
-- =============================================

-- Point categories
CREATE TABLE public.point_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  default_points INTEGER NOT NULL DEFAULT 10,
  is_positive BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student Points
CREATE TABLE public.student_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.point_categories(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT,
  awarded_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_points ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- User Roles policies
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff can view profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'staff'));

-- Departments policies (readable by all authenticated, manageable by admin)
CREATE POLICY "Authenticated can view departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage departments" ON public.departments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Academic years policies
CREATE POLICY "Authenticated can view academic years" ON public.academic_years FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage academic years" ON public.academic_years FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Courses policies
CREATE POLICY "Authenticated can view courses" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Subjects policies
CREATE POLICY "Authenticated can view subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage subjects" ON public.subjects FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Staff policies
CREATE POLICY "Staff can view own record" ON public.staff FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage staff" ON public.staff FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff can view all staff" ON public.staff FOR SELECT USING (public.has_role(auth.uid(), 'staff'));

-- Staff subjects policies
CREATE POLICY "Staff can view assignments" ON public.staff_subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage staff subjects" ON public.staff_subjects FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Students policies
CREATE POLICY "Students can view own record" ON public.students FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage students" ON public.students FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff can view students" ON public.students FOR SELECT USING (public.has_role(auth.uid(), 'staff'));

-- Classes policies
CREATE POLICY "Authenticated can view classes" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage classes" ON public.classes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Student classes policies
CREATE POLICY "Students can view own enrollment" ON public.student_classes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.students WHERE students.id = student_classes.student_id AND students.user_id = auth.uid())
);
CREATE POLICY "Staff can view enrollments" ON public.student_classes FOR SELECT USING (public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admins can manage enrollments" ON public.student_classes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Rooms policies
CREATE POLICY "Authenticated can view rooms" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage rooms" ON public.rooms FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Time slots policies
CREATE POLICY "Authenticated can view time slots" ON public.time_slots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage time slots" ON public.time_slots FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Timetable entries policies
CREATE POLICY "Authenticated can view timetable" ON public.timetable_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage timetable" ON public.timetable_entries FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Attendance policies
CREATE POLICY "Students can view own attendance" ON public.attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.students WHERE students.id = attendance.student_id AND students.user_id = auth.uid())
);
CREATE POLICY "Staff can manage attendance" ON public.attendance FOR ALL USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

-- Staff attendance policies
CREATE POLICY "Staff can view own attendance" ON public.staff_attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.staff WHERE staff.id = staff_attendance.staff_id AND staff.user_id = auth.uid())
);
CREATE POLICY "Admins can manage staff attendance" ON public.staff_attendance FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Exams policies
CREATE POLICY "Authenticated can view published exams" ON public.exams FOR SELECT TO authenticated USING (is_published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Staff and admins can manage exams" ON public.exams FOR ALL USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

-- Exam schedules policies
CREATE POLICY "Authenticated can view exam schedules" ON public.exam_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff and admins can manage schedules" ON public.exam_schedules FOR ALL USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

-- Exam results policies
CREATE POLICY "Students can view own results" ON public.exam_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.students WHERE students.id = exam_results.student_id AND students.user_id = auth.uid())
);
CREATE POLICY "Staff can manage results" ON public.exam_results FOR ALL USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

-- Question papers policies
CREATE POLICY "Staff can view question papers" ON public.question_papers FOR SELECT USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff can manage question papers" ON public.question_papers FOR ALL USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

-- Fee types policies
CREATE POLICY "Authenticated can view fee types" ON public.fee_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage fee types" ON public.fee_types FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Fee structures policies
CREATE POLICY "Authenticated can view fee structures" ON public.fee_structures FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage fee structures" ON public.fee_structures FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Student fees policies
CREATE POLICY "Students can view own fees" ON public.student_fees FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.students WHERE students.id = student_fees.student_id AND students.user_id = auth.uid())
);
CREATE POLICY "Staff and admins can manage fees" ON public.student_fees FOR ALL USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

-- Fee payments policies
CREATE POLICY "Students can view own payments" ON public.fee_payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.student_fees sf 
    JOIN public.students s ON sf.student_id = s.id 
    WHERE sf.id = fee_payments.student_fee_id AND s.user_id = auth.uid()
  )
);
CREATE POLICY "Admins can manage payments" ON public.fee_payments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Leave types policies
CREATE POLICY "Authenticated can view leave types" ON public.leave_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage leave types" ON public.leave_types FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Leave requests policies
CREATE POLICY "Users can view own leave requests" ON public.leave_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own leave requests" ON public.leave_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff and admins can view all leave requests" ON public.leave_requests FOR SELECT USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage leave requests" ON public.leave_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (
  target_user_id = auth.uid() OR 
  (target_user_id IS NULL AND (target_role IS NULL OR target_role = public.get_user_role(auth.uid())))
);
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Point categories policies
CREATE POLICY "Authenticated can view point categories" ON public.point_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage point categories" ON public.point_categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Student points policies
CREATE POLICY "Students can view own points" ON public.student_points FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.students WHERE students.id = student_points.student_id AND students.user_id = auth.uid())
);
CREATE POLICY "Staff and admins can manage points" ON public.student_points FOR ALL USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));

-- =============================================
-- TRIGGERS
-- =============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_exam_results_updated_at BEFORE UPDATE ON public.exam_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_fees_updated_at BEFORE UPDATE ON public.student_fees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
