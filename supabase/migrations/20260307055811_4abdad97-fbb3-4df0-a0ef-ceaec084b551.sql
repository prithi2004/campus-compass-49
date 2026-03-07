
CREATE TABLE public.syllabus_coverage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  unit_name TEXT NOT NULL,
  unit_number INTEGER NOT NULL DEFAULT 1,
  total_topics INTEGER NOT NULL DEFAULT 5,
  completed_topics INTEGER NOT NULL DEFAULT 0,
  staff_id UUID REFERENCES public.staff(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subject_id, unit_number, staff_id)
);

ALTER TABLE public.syllabus_coverage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff and admins can manage syllabus coverage"
  ON public.syllabus_coverage FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view syllabus coverage"
  ON public.syllabus_coverage FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
