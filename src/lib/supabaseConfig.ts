// Supabase 설정 및 연결 테스트
import { supabase } from './supabase'

// Supabase 연결 상태 확인
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase 연결 실패:', error)
      return false
    }
    
    console.log('Supabase 연결 성공!')
    return true
  } catch (error) {
    console.error('Supabase 연결 오류:', error)
    return false
  }
}

// 환경 변수 확인
export const checkEnvironmentVariables = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  console.log('환경 변수 확인:')
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '설정됨' : '설정되지 않음')
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '설정됨' : '설정되지 않음')
  
  return {
    url: !!supabaseUrl,
    key: !!supabaseKey,
    allSet: !!supabaseUrl && !!supabaseKey
  }
}



