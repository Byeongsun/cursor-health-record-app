-- 건강 목표 테이블 생성
CREATE TABLE IF NOT EXISTS health_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('blood_pressure', 'blood_sugar', 'weight', 'exercise', 'medication')),
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) DEFAULT 0,
  unit VARCHAR(20) NOT NULL,
  target_date DATE NOT NULL,
  is_achieved BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 목표만 조회/수정/삭제 가능
CREATE POLICY "Users can view their own goals" ON health_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON health_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON health_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON health_goals
  FOR DELETE USING (auth.uid() = user_id);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_health_goals_user_id ON health_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_health_goals_goal_type ON health_goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_health_goals_target_date ON health_goals(target_date);
CREATE INDEX IF NOT EXISTS idx_health_goals_is_achieved ON health_goals(is_achieved);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_health_goals_updated_at 
  BEFORE UPDATE ON health_goals 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();





