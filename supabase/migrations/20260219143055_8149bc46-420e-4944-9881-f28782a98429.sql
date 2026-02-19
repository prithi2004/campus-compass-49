
-- Question Bank table for storing individual questions
CREATE TABLE public.question_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  type text NOT NULL DEFAULT 'short',
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  unit text NOT NULL DEFAULT 'Unit 1',
  difficulty text NOT NULL DEFAULT 'medium',
  bloom_level text NOT NULL DEFAULT 'Understand',
  marks integer NOT NULL DEFAULT 5,
  tags text[] DEFAULT '{}',
  options jsonb DEFAULT NULL,
  correct_answer text DEFAULT NULL,
  is_favorite boolean DEFAULT false,
  created_by uuid REFERENCES public.staff(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff and admins can manage question bank"
ON public.question_bank FOR ALL
USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view question bank"
ON public.question_bank FOR SELECT
USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Question Paper Configs table to store generated paper settings
CREATE TABLE public.question_paper_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES public.exams(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  semester integer,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  exam_date date,
  duration text,
  max_marks integer DEFAULT 100,
  paper_pattern jsonb DEFAULT '{}',
  difficulty_mix jsonb DEFAULT '{"easy":30,"medium":50,"hard":20}',
  bloom_distribution jsonb DEFAULT '{}',
  security_options jsonb DEFAULT '{}',
  output_format text DEFAULT 'pdf',
  status text NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES public.staff(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.question_paper_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff and admins can manage paper configs"
ON public.question_paper_configs FOR ALL
USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Junction table: questions selected for a paper
CREATE TABLE public.question_paper_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_config_id uuid REFERENCES public.question_paper_configs(id) ON DELETE CASCADE NOT NULL,
  question_bank_id uuid REFERENCES public.question_bank(id) ON DELETE CASCADE NOT NULL,
  part text DEFAULT 'A',
  question_order integer DEFAULT 1,
  marks_override integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.question_paper_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff and admins can manage paper questions"
ON public.question_paper_questions FOR ALL
USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_question_bank_updated_at
BEFORE UPDATE ON public.question_bank
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_question_paper_configs_updated_at
BEFORE UPDATE ON public.question_paper_configs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
