// CSV 파일 파싱 유틸리티

// CSV 데이터 타입 정의
export interface CSVHealthRecord {
  record_type: 'blood_pressure' | 'blood_sugar' | 'weight' | 'exercise'
  systolic_pressure?: number
  diastolic_pressure?: number
  heart_rate?: number
  blood_sugar?: number
  blood_sugar_type?: 'fasting' | 'post_meal'
  weight?: number
  measurement_time: string
  notes?: string
}

// CSV 컬럼 순서 정의 (고정된 순서)
export const CSV_COLUMN_ORDER = [
  'record_type',           // 0: 측정 유형 (blood_pressure, blood_sugar, weight, exercise)
  'systolic_pressure',     // 1: 수축기 혈압
  'diastolic_pressure',    // 2: 이완기 혈압
  'heart_rate',           // 3: 맥박
  'blood_sugar',          // 4: 혈당 수치
  'blood_sugar_type',     // 5: 혈당 유형 (fasting, post_meal)
  'weight',               // 6: 체중
  'measurement_time',     // 7: 측정 시간 (YYYY-MM-DD HH:MM 또는 YYYY-MM-DD)
  'notes'                 // 8: 메모
]

// CSV 헤더 매핑 (다양한 언어 지원)
export const CSV_HEADER_MAPPING = {
  // 한국어
  '측정유형': 'record_type',
  '수축기혈압': 'systolic_pressure',
  '이완기혈압': 'diastolic_pressure',
  '맥박': 'heart_rate',
  '혈당': 'blood_sugar',
  '혈당유형': 'blood_sugar_type',
  '체중': 'weight',
  '측정시간': 'measurement_time',
  '메모': 'notes',
  
  // 영어
  'type': 'record_type',
  'systolic': 'systolic_pressure',
  'diastolic': 'diastolic_pressure',
  'heart_rate': 'heart_rate',
  'blood_sugar': 'blood_sugar',
  'sugar_type': 'blood_sugar_type',
  'weight': 'weight',
  'time': 'measurement_time',
  'note': 'notes',
  
  // 기타 변형
  'record_type': 'record_type',
  'systolic_pressure': 'systolic_pressure',
  'diastolic_pressure': 'diastolic_pressure',
  'blood_sugar_type': 'blood_sugar_type',
  'measurement_time': 'measurement_time'
}

// CSV 파일을 파싱하여 건강 기록 배열로 변환
export const parseCSVFile = (csvContent: string): CSVHealthRecord[] => {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '')
  
  if (lines.length < 2) {
    throw new Error('CSV 파일에 데이터가 충분하지 않습니다.')
  }

  const records: CSVHealthRecord[] = []
  const firstLine = lines[0].trim()
  
  // 헤더가 있는지 확인 (첫 번째 줄이 숫자가 아닌 경우)
  const hasHeader = isNaN(parseFloat(firstLine.split(',')[0]))
  const dataLines = hasHeader ? lines.slice(1) : lines

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim()
    if (!line) continue

    try {
      const record = parseCSVLine(line, i + (hasHeader ? 2 : 1))
      if (record) {
        records.push(record)
      }
    } catch (error) {
      console.warn(`CSV 라인 ${i + (hasHeader ? 2 : 1)} 파싱 실패:`, error)
      // 개별 라인 파싱 실패는 무시하고 계속 진행
    }
  }

  return records
}

// CSV 라인을 파싱하여 건강 기록 객체로 변환
const parseCSVLine = (line: string, lineNumber: number): CSVHealthRecord | null => {
  const columns = parseCSVColumns(line)
  
  if (columns.length < 2) {
    throw new Error(`데이터가 충분하지 않습니다. (${lineNumber}번째 줄)`)
  }

  const record: CSVHealthRecord = {
    record_type: columns[0] as any,
    measurement_time: columns[7] || new Date().toISOString()
  }

  // 수치 데이터 파싱
  if (columns[1] && !isNaN(parseFloat(columns[1]))) {
    record.systolic_pressure = parseFloat(columns[1])
  }
  
  if (columns[2] && !isNaN(parseFloat(columns[2]))) {
    record.diastolic_pressure = parseFloat(columns[2])
  }
  
  if (columns[3] && !isNaN(parseFloat(columns[3]))) {
    record.heart_rate = parseFloat(columns[3])
  }
  
  if (columns[4] && !isNaN(parseFloat(columns[4]))) {
    record.blood_sugar = parseFloat(columns[4])
  }
  
  if (columns[5]) {
    record.blood_sugar_type = columns[5] as 'fasting' | 'post_meal'
  }
  
  if (columns[6] && !isNaN(parseFloat(columns[6]))) {
    record.weight = parseFloat(columns[6])
  }
  
  if (columns[8]) {
    record.notes = columns[8]
  }

  // 측정 시간 형식 정규화
  record.measurement_time = normalizeDateTime(record.measurement_time)

  // 유효성 검사
  if (!isValidRecord(record)) {
    throw new Error(`유효하지 않은 데이터입니다. (${lineNumber}번째 줄)`)
  }

  return record
}

// CSV 컬럼 파싱 (쉼표로 구분, 따옴표 처리)
const parseCSVColumns = (line: string): string[] => {
  const columns: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      columns.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  columns.push(current.trim())
  return columns
}

// 날짜/시간 형식 정규화
const normalizeDateTime = (dateTimeStr: string): string => {
  // 다양한 날짜 형식 지원
  const formats = [
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,  // YYYY-MM-DD HH:MM
    /^\d{4}-\d{2}-\d{2}$/,               // YYYY-MM-DD
    /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/, // YYYY/MM/DD HH:MM
    /^\d{4}\/\d{2}\/\d{2}$/,             // YYYY/MM/DD
    /^\d{2}-\d{2}-\d{4}$/,               // DD-MM-YYYY
    /^\d{2}\/\d{2}\/\d{4}$/              // DD/MM/YYYY
  ]

  let normalized = dateTimeStr.trim()
  
  // 시간이 없으면 00:00 추가
  if (!normalized.includes(':')) {
    normalized += ' 00:00'
  }

  // 날짜 형식 변환
  try {
    const date = new Date(normalized)
    if (isNaN(date.getTime())) {
      throw new Error('유효하지 않은 날짜 형식')
    }
    return date.toISOString()
  } catch (error) {
    // 현재 시간으로 대체
    console.warn(`날짜 파싱 실패: ${dateTimeStr}, 현재 시간으로 대체`)
    return new Date().toISOString()
  }
}

// 기록 유효성 검사
const isValidRecord = (record: CSVHealthRecord): boolean => {
  // 측정 시간이 없으면 현재 시간으로 설정
  if (!record.measurement_time) {
    record.measurement_time = new Date().toISOString()
  }

  // record_type이 없으면 기본값 설정
  if (!record.record_type) {
    // 데이터가 있는 경우 유형 추정
    if (record.systolic_pressure || record.diastolic_pressure) {
      record.record_type = 'blood_pressure'
    } else if (record.blood_sugar) {
      record.record_type = 'blood_sugar'
    } else if (record.weight) {
      record.record_type = 'weight'
    } else {
      record.record_type = 'exercise' // 기본값
    }
  }

  // 측정 유형별 유효성 검사 (매우 관대하게)
  switch (record.record_type) {
    case 'blood_pressure':
      // 수축기, 이완기, 맥박 중 하나라도 있으면 유효
      return !!(record.systolic_pressure || record.diastolic_pressure || record.heart_rate)
    case 'blood_sugar':
      return !!record.blood_sugar
    case 'weight':
      return !!record.weight
    case 'exercise':
      return true // 운동은 특별한 수치가 필요하지 않음
    default:
      // 알 수 없는 유형도 허용 (어떤 데이터라도 있으면)
      return !!(record.notes || record.systolic_pressure || record.blood_sugar || record.weight || record.heart_rate)
  }
}

// CSV 템플릿 생성
export const generateCSVTemplate = (): string => {
  const headers = [
    '측정유형',
    '수축기혈압',
    '이완기혈압', 
    '맥박',
    '혈당',
    '혈당유형',
    '체중',
    '측정시간(실제측정한시간)',
    '메모'
  ]
  
  const sampleData = [
    'blood_pressure,120,80,72,,,2024-01-15 09:00,아침 혈압 측정',
    'blood_pressure,130,85,75,,,2024-01-15 21:00,저녁 혈압 측정',
    'blood_sugar,,,,85,fasting,,2024-01-15 09:30,공복 혈당',
    'blood_sugar,,,,140,post_meal,,2024-01-15 14:30,식후 혈당',
    'weight,,,,,,70.5,2024-01-15 10:00,체중 측정',
    'weight,,,,,,70.2,2024-01-16 10:00,체중 측정'
  ]
  
  return [headers.join(','), ...sampleData].join('\n')
}

// CSV 데이터 검증
export const validateCSVData = (records: CSVHealthRecord[]): { valid: CSVHealthRecord[], invalid: { record: CSVHealthRecord, error: string }[] } => {
  const valid: CSVHealthRecord[] = []
  const invalid: { record: CSVHealthRecord, error: string }[] = []

  records.forEach((record, index) => {
    try {
      if (isValidRecord(record)) {
        valid.push(record)
      } else {
        invalid.push({
          record,
          error: '필수 데이터가 누락되었습니다.'
        })
      }
    } catch (error) {
      invalid.push({
        record,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  })

  return { valid, invalid }
}
