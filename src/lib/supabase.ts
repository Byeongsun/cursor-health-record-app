// Supabase 클라이언트 설정
import { createClient } from '@supabase/supabase-js'

// 환경 변수에서 Supabase 설정 가져오기 (fallback 포함)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rkidyixevbnqkogcvhhy.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJraWR5aXhldmJucWtvZ2N2aGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NzM4MjcsImV4cCI6MjA3MzQ0OTgyN30.vxYr0kJhVhm1CZvxpVdn1KAi1SlKRgxTPDoVLiPT9Do'

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 데이터베이스 타입 정의
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          birth_year: number | null
          gender: string | null
          phone: string | null
          emergency_contact: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          birth_year?: number | null
          gender?: string | null
          phone?: string | null
          emergency_contact?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          birth_year?: number | null
          gender?: string | null
          phone?: string | null
          emergency_contact?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      health_records: {
        Row: {
          id: string
          user_id: string
          record_type: string
          systolic_pressure: number | null
          diastolic_pressure: number | null
          blood_sugar: number | null
          blood_sugar_type: string | null
          weight: number | null
          heart_rate: number | null
          temperature: number | null
          measurement_time: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          record_type: string
          systolic_pressure?: number | null
          diastolic_pressure?: number | null
          blood_sugar?: number | null
          blood_sugar_type?: string | null
          weight?: number | null
          heart_rate?: number | null
          temperature?: number | null
          measurement_time: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          record_type?: string
          systolic_pressure?: number | null
          diastolic_pressure?: number | null
          blood_sugar?: number | null
          blood_sugar_type?: string | null
          weight?: number | null
          heart_rate?: number | null
          temperature?: number | null
          measurement_time?: string
          notes?: string | null
          created_at?: string
        }
      }
      health_goals: {
        Row: {
          id: string
          user_id: string
          goal_type: string
          target_value: number | null
          target_range_min: number | null
          target_range_max: number | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_type: string
          target_value?: number | null
          target_range_min?: number | null
          target_range_max?: number | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_type?: string
          target_value?: number | null
          target_range_min?: number | null
          target_range_max?: number | null
          is_active?: boolean
          created_at?: string
        }
      }
      medications: {
        Row: {
          id: string
          user_id: string
          medication_name: string
          dosage: string | null
          frequency: string | null
          start_date: string | null
          end_date: string | null
          is_active: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          medication_name: string
          dosage?: string | null
          frequency?: string | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          medication_name?: string
          dosage?: string | null
          frequency?: string | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}