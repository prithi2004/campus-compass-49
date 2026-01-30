export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      academic_years: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_current: boolean | null
          name: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_current?: boolean | null
          name: string
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_current?: boolean | null
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          class_id: string
          created_at: string
          date: string
          id: string
          marked_by: string | null
          remarks: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          subject_id: string
          time_slot_id: string | null
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          date: string
          id?: string
          marked_by?: string | null
          remarks?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          subject_id: string
          time_slot_id?: string | null
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          remarks?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
          subject_id?: string
          time_slot_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year_id: string
          class_teacher_id: string | null
          course_id: string
          created_at: string
          id: string
          max_strength: number | null
          name: string
          section: string | null
          semester: number
        }
        Insert: {
          academic_year_id: string
          class_teacher_id?: string | null
          course_id: string
          created_at?: string
          id?: string
          max_strength?: number | null
          name: string
          section?: string | null
          semester: number
        }
        Update: {
          academic_year_id?: string
          class_teacher_id?: string | null
          course_id?: string
          created_at?: string
          id?: string
          max_strength?: number | null
          name?: string
          section?: string | null
          semester?: number
        }
        Relationships: [
          {
            foreignKeyName: "classes_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_class_teacher_id_fkey"
            columns: ["class_teacher_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string
          department_id: string
          description: string | null
          duration_years: number
          id: string
          is_active: boolean | null
          name: string
          total_semesters: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          department_id: string
          description?: string | null
          duration_years?: number
          id?: string
          is_active?: boolean | null
          name: string
          total_semesters?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          department_id?: string
          description?: string | null
          duration_years?: number
          id?: string
          is_active?: boolean | null
          name?: string
          total_semesters?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string
          description: string | null
          hod_id: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          hod_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          hod_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_hod"
            columns: ["hod_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_results: {
        Row: {
          created_at: string
          evaluated_by: string | null
          exam_schedule_id: string
          grade: string | null
          id: string
          is_absent: boolean | null
          marks_obtained: number | null
          remarks: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          evaluated_by?: string | null
          exam_schedule_id: string
          grade?: string | null
          id?: string
          is_absent?: boolean | null
          marks_obtained?: number | null
          remarks?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          evaluated_by?: string | null
          exam_schedule_id?: string
          grade?: string | null
          id?: string
          is_absent?: boolean | null
          marks_obtained?: number | null
          remarks?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_evaluated_by_fkey"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_exam_schedule_id_fkey"
            columns: ["exam_schedule_id"]
            isOneToOne: false
            referencedRelation: "exam_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_schedules: {
        Row: {
          class_id: string
          created_at: string
          end_time: string
          exam_date: string
          exam_id: string
          id: string
          max_marks: number
          passing_marks: number
          room_id: string | null
          start_time: string
          subject_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          end_time: string
          exam_date: string
          exam_id: string
          id?: string
          max_marks?: number
          passing_marks?: number
          room_id?: string | null
          start_time: string
          subject_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          end_time?: string
          exam_date?: string
          exam_id?: string
          id?: string
          max_marks?: number
          passing_marks?: number
          room_id?: string | null
          start_time?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_schedules_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_schedules_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_schedules_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_schedules_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          academic_year_id: string
          created_at: string
          description: string | null
          end_date: string
          exam_type: Database["public"]["Enums"]["exam_type"]
          id: string
          is_published: boolean | null
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          description?: string | null
          end_date: string
          exam_type: Database["public"]["Enums"]["exam_type"]
          id?: string
          is_published?: boolean | null
          name: string
          start_date: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          description?: string | null
          end_date?: string
          exam_type?: Database["public"]["Enums"]["exam_type"]
          id?: string
          is_published?: boolean | null
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_date: string
          payment_method: string
          receipt_number: string | null
          received_by: string | null
          remarks: string | null
          student_fee_id: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_date?: string
          payment_method?: string
          receipt_number?: string | null
          received_by?: string | null
          remarks?: string | null
          student_fee_id: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_date?: string
          payment_method?: string
          receipt_number?: string | null
          received_by?: string | null
          remarks?: string | null
          student_fee_id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_student_fee_id_fkey"
            columns: ["student_fee_id"]
            isOneToOne: false
            referencedRelation: "student_fees"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          academic_year_id: string
          amount: number
          course_id: string
          created_at: string
          due_date: string | null
          fee_type_id: string
          id: string
          semester: number | null
        }
        Insert: {
          academic_year_id: string
          amount: number
          course_id: string
          created_at?: string
          due_date?: string | null
          fee_type_id: string
          id?: string
          semester?: number | null
        }
        Update: {
          academic_year_id?: string
          amount?: number
          course_id?: string
          created_at?: string
          due_date?: string | null
          fee_type_id?: string
          id?: string
          semester?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structures_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structures_fee_type_id_fkey"
            columns: ["fee_type_id"]
            isOneToOne: false
            referencedRelation: "fee_types"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_recurring: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          name?: string
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          end_date: string
          id: string
          leave_type_id: string
          reason: string
          rejection_reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["leave_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_date: string
          id?: string
          leave_type_id: string
          reason: string
          rejection_reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["leave_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_date?: string
          id?: string
          leave_type_id?: string
          reason?: string
          rejection_reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["leave_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          applies_to: Database["public"]["Enums"]["app_role"]
          created_at: string
          id: string
          is_paid: boolean | null
          max_days: number
          name: string
        }
        Insert: {
          applies_to: Database["public"]["Enums"]["app_role"]
          created_at?: string
          id?: string
          is_paid?: boolean | null
          max_days?: number
          name: string
        }
        Update: {
          applies_to?: Database["public"]["Enums"]["app_role"]
          created_at?: string
          id?: string
          is_paid?: boolean | null
          max_days?: number
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          target_department_id: string | null
          target_role: Database["public"]["Enums"]["app_role"] | null
          target_user_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          target_department_id?: string | null
          target_role?: Database["public"]["Enums"]["app_role"] | null
          target_user_id?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          target_department_id?: string | null
          target_role?: Database["public"]["Enums"]["app_role"] | null
          target_user_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_target_department_id_fkey"
            columns: ["target_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      point_categories: {
        Row: {
          created_at: string
          default_points: number
          description: string | null
          id: string
          is_positive: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          default_points?: number
          description?: string | null
          id?: string
          is_positive?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          default_points?: number
          description?: string | null
          id?: string
          is_positive?: boolean | null
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_papers: {
        Row: {
          approved_by: string | null
          created_at: string
          exam_id: string
          file_name: string
          file_url: string
          id: string
          is_approved: boolean | null
          subject_id: string
          uploaded_by: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          exam_id: string
          file_name: string
          file_url: string
          id?: string
          is_approved?: boolean | null
          subject_id: string
          uploaded_by?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          exam_id?: string
          file_name?: string
          file_url?: string
          id?: string
          is_approved?: boolean | null
          subject_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "question_papers_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_papers_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_papers_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_papers_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          building: string | null
          capacity: number
          code: string
          created_at: string
          floor: number | null
          has_ac: boolean | null
          has_projector: boolean | null
          id: string
          is_active: boolean | null
          name: string
          room_type: string
        }
        Insert: {
          building?: string | null
          capacity?: number
          code: string
          created_at?: string
          floor?: number | null
          has_ac?: boolean | null
          has_projector?: boolean | null
          id?: string
          is_active?: boolean | null
          name: string
          room_type?: string
        }
        Update: {
          building?: string | null
          capacity?: number
          code?: string
          created_at?: string
          floor?: number | null
          has_ac?: boolean | null
          has_projector?: boolean | null
          id?: string
          is_active?: boolean | null
          name?: string
          room_type?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string
          department_id: string | null
          designation: string
          email: string
          end_date: string | null
          full_name: string
          id: string
          is_hod: boolean | null
          join_date: string
          max_hours_per_week: number | null
          phone: string | null
          qualification: string | null
          specialization: string | null
          staff_id: string
          status: Database["public"]["Enums"]["staff_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          designation: string
          email: string
          end_date?: string | null
          full_name: string
          id?: string
          is_hod?: boolean | null
          join_date: string
          max_hours_per_week?: number | null
          phone?: string | null
          qualification?: string | null
          specialization?: string | null
          staff_id: string
          status?: Database["public"]["Enums"]["staff_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          department_id?: string | null
          designation?: string
          email?: string
          end_date?: string | null
          full_name?: string
          id?: string
          is_hod?: boolean | null
          join_date?: string
          max_hours_per_week?: number | null
          phone?: string | null
          qualification?: string | null
          specialization?: string | null
          staff_id?: string
          status?: Database["public"]["Enums"]["staff_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string
          date: string
          id: string
          remarks: string | null
          staff_id: string
          status: Database["public"]["Enums"]["attendance_status"]
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date: string
          id?: string
          remarks?: string | null
          staff_id: string
          status?: Database["public"]["Enums"]["attendance_status"]
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date?: string
          id?: string
          remarks?: string | null
          staff_id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
        }
        Relationships: [
          {
            foreignKeyName: "staff_attendance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_subjects: {
        Row: {
          academic_year_id: string
          created_at: string
          id: string
          is_primary: boolean | null
          staff_id: string
          subject_id: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          staff_id: string
          subject_id: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          staff_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_subjects_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_subjects_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      student_classes: {
        Row: {
          class_id: string
          created_at: string
          id: string
          roll_number: number | null
          student_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          roll_number?: number | null
          student_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          roll_number?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_classes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fees: {
        Row: {
          amount_due: number
          amount_paid: number | null
          created_at: string
          discount: number | null
          due_date: string | null
          fee_structure_id: string
          id: string
          status: Database["public"]["Enums"]["payment_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          amount_due: number
          amount_paid?: number | null
          created_at?: string
          discount?: number | null
          due_date?: string | null
          fee_structure_id: string
          id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          amount_due?: number
          amount_paid?: number | null
          created_at?: string
          discount?: number | null
          due_date?: string | null
          fee_structure_id?: string
          id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_fees_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_points: {
        Row: {
          awarded_by: string | null
          category_id: string
          created_at: string
          id: string
          points: number
          reason: string | null
          student_id: string
        }
        Insert: {
          awarded_by?: string | null
          category_id: string
          created_at?: string
          id?: string
          points: number
          reason?: string | null
          student_id: string
        }
        Update: {
          awarded_by?: string | null
          category_id?: string
          created_at?: string
          id?: string
          points?: number
          reason?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_points_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_points_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "point_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_points_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          academic_year_id: string | null
          address: string | null
          admission_date: string
          blood_group: string | null
          course_id: string | null
          created_at: string
          current_semester: number
          date_of_birth: string | null
          department_id: string | null
          email: string
          full_name: string
          gender: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          phone: string | null
          status: Database["public"]["Enums"]["student_status"]
          student_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          academic_year_id?: string | null
          address?: string | null
          admission_date: string
          blood_group?: string | null
          course_id?: string | null
          created_at?: string
          current_semester?: number
          date_of_birth?: string | null
          department_id?: string | null
          email: string
          full_name: string
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          student_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          academic_year_id?: string | null
          address?: string | null
          admission_date?: string
          blood_group?: string | null
          course_id?: string | null
          created_at?: string
          current_semester?: number
          date_of_birth?: string | null
          department_id?: string | null
          email?: string
          full_name?: string
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          student_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string
          course_id: string
          created_at: string
          credits: number
          id: string
          is_active: boolean | null
          name: string
          practical_hours: number | null
          semester: number
          subject_type: Database["public"]["Enums"]["subject_type"]
          theory_hours: number | null
          updated_at: string
        }
        Insert: {
          code: string
          course_id: string
          created_at?: string
          credits?: number
          id?: string
          is_active?: boolean | null
          name: string
          practical_hours?: number | null
          semester: number
          subject_type?: Database["public"]["Enums"]["subject_type"]
          theory_hours?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          course_id?: string
          created_at?: string
          credits?: number
          id?: string
          is_active?: boolean | null
          name?: string
          practical_hours?: number | null
          semester?: number
          subject_type?: Database["public"]["Enums"]["subject_type"]
          theory_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      time_slots: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_break: boolean | null
          name: string
          slot_order: number
          start_time: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_break?: boolean | null
          name: string
          slot_order: number
          start_time: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_break?: boolean | null
          name?: string
          slot_order?: number
          start_time?: string
        }
        Relationships: []
      }
      timetable_entries: {
        Row: {
          academic_year_id: string
          class_id: string
          created_at: string
          day: Database["public"]["Enums"]["weekday"]
          id: string
          is_active: boolean | null
          room_id: string | null
          staff_id: string
          subject_id: string
          time_slot_id: string
        }
        Insert: {
          academic_year_id: string
          class_id: string
          created_at?: string
          day: Database["public"]["Enums"]["weekday"]
          id?: string
          is_active?: boolean | null
          room_id?: string | null
          staff_id: string
          subject_id: string
          time_slot_id: string
        }
        Update: {
          academic_year_id?: string
          class_id?: string
          created_at?: string
          day?: Database["public"]["Enums"]["weekday"]
          id?: string
          is_active?: boolean | null
          room_id?: string | null
          staff_id?: string
          subject_id?: string
          time_slot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_entries_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "student"
      attendance_status: "present" | "absent" | "late" | "excused"
      exam_type: "internal" | "midterm" | "final" | "practical" | "quiz"
      leave_status: "pending" | "approved" | "rejected" | "cancelled"
      notification_type:
        | "general"
        | "academic"
        | "fee"
        | "exam"
        | "attendance"
        | "leave"
        | "urgent"
      payment_status: "pending" | "partial" | "paid" | "overdue" | "waived"
      staff_status: "active" | "on_leave" | "resigned" | "retired"
      student_status: "active" | "graduated" | "dropped" | "suspended"
      subject_type: "theory" | "practical" | "both"
      weekday:
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "student"],
      attendance_status: ["present", "absent", "late", "excused"],
      exam_type: ["internal", "midterm", "final", "practical", "quiz"],
      leave_status: ["pending", "approved", "rejected", "cancelled"],
      notification_type: [
        "general",
        "academic",
        "fee",
        "exam",
        "attendance",
        "leave",
        "urgent",
      ],
      payment_status: ["pending", "partial", "paid", "overdue", "waived"],
      staff_status: ["active", "on_leave", "resigned", "retired"],
      student_status: ["active", "graduated", "dropped", "suspended"],
      subject_type: ["theory", "practical", "both"],
      weekday: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ],
    },
  },
} as const
