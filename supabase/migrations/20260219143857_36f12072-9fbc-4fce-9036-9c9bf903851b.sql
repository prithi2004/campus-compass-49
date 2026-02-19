
-- Insert academic years
INSERT INTO public.academic_years (name, start_date, end_date, is_current) VALUES
  ('2024-2025', '2024-06-01', '2025-05-31', false),
  ('2025-2026', '2025-06-01', '2026-05-31', true);

-- Insert departments
INSERT INTO public.departments (name, code, description, is_active) VALUES
  ('Computer Science & Engineering', 'CSE', 'Department of Computer Science', true),
  ('Electronics & Communication', 'ECE', 'Department of Electronics', true),
  ('Mechanical Engineering', 'ME', 'Department of Mechanical Engineering', true);

-- Insert courses (using subquery for department_id)
INSERT INTO public.courses (name, code, department_id, duration_years, total_semesters, is_active) VALUES
  ('B.Tech Computer Science', 'BTCS', (SELECT id FROM departments WHERE code = 'CSE'), 4, 8, true),
  ('B.Tech Electronics', 'BTEC', (SELECT id FROM departments WHERE code = 'ECE'), 4, 8, true);

-- Insert subjects (using subquery for course_id)
INSERT INTO public.subjects (name, code, course_id, semester, credits, subject_type, is_active) VALUES
  ('Data Structures', 'CS201', (SELECT id FROM courses WHERE code = 'BTCS'), 3, 4, 'theory', true),
  ('Algorithms', 'CS301', (SELECT id FROM courses WHERE code = 'BTCS'), 5, 3, 'theory', true),
  ('Database Management', 'CS302', (SELECT id FROM courses WHERE code = 'BTCS'), 5, 4, 'both', true),
  ('Operating Systems', 'CS303', (SELECT id FROM courses WHERE code = 'BTCS'), 4, 4, 'theory', true),
  ('Digital Electronics', 'EC201', (SELECT id FROM courses WHERE code = 'BTEC'), 3, 3, 'both', true);
