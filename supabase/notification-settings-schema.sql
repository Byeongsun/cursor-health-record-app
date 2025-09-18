-- 알림 설정 테이블 생성
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  setting_type VARCHAR(50) NOT NULL CHECK (setting_type IN ('measurement_reminder', 'danger_alert', 'goal_achievement', 'daily_summary')),
  is_enabled BOOLEAN DEFAULT TRUE,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  time VARCHAR(5) NOT NULL, -- HH:MM 형식
  days INTEGER[] DEFAULT '{}', -- 요일 배열 (0=일요일, 1=월요일, ...)
  measurement_types VARCHAR(50)[] DEFAULT '{}', -- 측정 유형 배열
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 알림 설정만 조회/수정/삭제 가능
CREATE POLICY "Users can view their own notification settings" ON notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings" ON notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings" ON notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification settings" ON notification_settings
  FOR DELETE USING (auth.uid() = user_id);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_type ON notification_settings(setting_type);
CREATE INDEX IF NOT EXISTS idx_notification_settings_enabled ON notification_settings(is_enabled);

-- 업데이트 시간 자동 갱신 트리거
CREATE TRIGGER update_notification_settings_updated_at 
  BEFORE UPDATE ON notification_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 기본 알림 설정을 위한 함수
CREATE OR REPLACE FUNCTION create_default_notification_settings(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO notification_settings (user_id, setting_type, is_enabled, frequency, time, days, measurement_types)
  VALUES 
    (user_uuid, 'measurement_reminder', true, 'daily', '09:00', ARRAY[1,2,3,4,5], ARRAY['blood_pressure', 'blood_sugar']),
    (user_uuid, 'danger_alert', true, 'daily', '00:00', ARRAY[]::INTEGER[], ARRAY['blood_pressure', 'blood_sugar']),
    (user_uuid, 'goal_achievement', true, 'daily', '00:00', ARRAY[]::INTEGER[], ARRAY[]::VARCHAR[]),
    (user_uuid, 'daily_summary', false, 'daily', '20:00', ARRAY[1,2,3,4,5], ARRAY[]::VARCHAR[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

