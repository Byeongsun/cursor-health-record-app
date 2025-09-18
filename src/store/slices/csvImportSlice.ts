// CSV 데이터 일괄 입력 Redux slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'
import { parseCSVFile, validateCSVData, type CSVHealthRecord } from '../../utils/csvParser'

// CSV 가져오기 상태 타입
interface CSVImportState {
  isImporting: boolean
  importProgress: number
  totalRecords: number
  importedRecords: number
  failedRecords: number
  errors: string[]
  success: boolean
  previewData: CSVHealthRecord[]
  validRecords: CSVHealthRecord[]
}

const initialState: CSVImportState = {
  isImporting: false,
  importProgress: 0,
  totalRecords: 0,
  importedRecords: 0,
  failedRecords: 0,
  errors: [],
  success: false,
  previewData: [],
  validRecords: [],
}

// CSV 파일에서 건강 기록 일괄 가져오기
export const importCSVHealthRecords = createAsyncThunk(
  'csvImport/importCSVHealthRecords',
  async ({ userId, csvContent }: { userId: string; csvContent: string }) => {
    try {
      console.log('CSV 가져오기 시작:', { userId, csvContentLength: csvContent.length })
      
      // CSV 파싱
      const records = parseCSVFile(csvContent)
      console.log('파싱된 기록 수:', records.length)
      
      if (records.length === 0) {
        throw new Error('CSV 파일에 유효한 데이터가 없습니다.')
      }

      // 데이터 검증
      const { valid, invalid } = validateCSVData(records)
      console.log('유효한 기록:', valid.length, '무효한 기록:', invalid.length)
      
      if (valid.length === 0) {
        console.error('모든 데이터가 무효:', invalid)
        throw new Error('모든 데이터가 유효하지 않습니다.')
      }

      // 유효한 데이터를 Supabase에 일괄 삽입
      const healthRecordsData = valid.map(record => ({
        user_id: userId,
        record_type: record.record_type,
        systolic_pressure: record.systolic_pressure || null,
        diastolic_pressure: record.diastolic_pressure || null,
        heart_rate: record.heart_rate || null,
        blood_sugar: record.blood_sugar || null,
        blood_sugar_type: record.blood_sugar_type || null,
        weight: record.weight || null,
        measurement_time: record.measurement_time,
        notes: record.notes || null,
      }))

      console.log('삽입할 데이터:', healthRecordsData.slice(0, 2)) // 처음 2개만 로그

      const { data, error } = await supabase
        .from('health_records')
        .insert(healthRecordsData)
        .select()

      if (error) {
        console.error('Supabase 삽입 오류:', error)
        throw error
      }

      console.log('성공적으로 삽입된 데이터:', data?.length || 0)

      return {
        importedCount: data?.length || 0,
        totalCount: records.length,
        invalidCount: invalid.length,
        errors: invalid.map(item => item.error),
        invalidRecords: invalid.map(item => item.record)
      }
    } catch (error: any) {
      console.error('CSV 가져오기 전체 오류:', error)
      throw new Error(error.message || 'CSV 가져오기에 실패했습니다.')
    }
  }
)

// CSV 파일 미리보기 (파싱만 하고 저장하지 않음)
export const previewCSVData = createAsyncThunk(
  'csvImport/previewCSVData',
  async (csvContent: string) => {
    try {
      console.log('CSV 미리보기 시작:', csvContent.length)
      const records = parseCSVFile(csvContent)
      console.log('미리보기 파싱된 기록:', records.length)
      
      const { valid, invalid } = validateCSVData(records)
      console.log('미리보기 유효한 기록:', valid.length, '무효한 기록:', invalid.length)
      
      return {
        totalRecords: records.length,
        validRecords: valid,
        invalidRecords: invalid,
        preview: valid.slice(0, 10) // 처음 10개만 미리보기
      }
    } catch (error: any) {
      console.error('CSV 미리보기 오류:', error)
      throw new Error(error.message || 'CSV 미리보기에 실패했습니다.')
    }
  }
)

const csvImportSlice = createSlice({
  name: 'csvImport',
  initialState,
  reducers: {
    // 가져오기 상태 초기화
    resetImportState: (state) => {
      state.isImporting = false
      state.importProgress = 0
      state.totalRecords = 0
      state.importedRecords = 0
      state.failedRecords = 0
      state.errors = []
      state.success = false
      state.previewData = []
      state.validRecords = []
    },
    
    // 진행률 업데이트
    updateProgress: (state, action: PayloadAction<{ imported: number; total: number }>) => {
      state.importedRecords = action.payload.imported
      state.totalRecords = action.payload.total
      state.importProgress = Math.round((action.payload.imported / action.payload.total) * 100)
    },
    
    // 에러 추가
    addError: (state, action: PayloadAction<string>) => {
      state.errors.push(action.payload)
    },
    
    // 에러 초기화
    clearErrors: (state) => {
      state.errors = []
    },
  },
  extraReducers: (builder) => {
    builder
      // CSV 가져오기
      .addCase(importCSVHealthRecords.pending, (state) => {
        state.isImporting = true
        state.importProgress = 0
        state.errors = []
        state.success = false
      })
      .addCase(importCSVHealthRecords.fulfilled, (state, action) => {
        state.isImporting = false
        state.importProgress = 100
        state.importedRecords = action.payload.importedCount
        state.totalRecords = action.payload.totalCount
        state.failedRecords = action.payload.invalidCount
        state.errors = action.payload.errors
        state.success = true
      })
      .addCase(importCSVHealthRecords.rejected, (state, action) => {
        state.isImporting = false
        state.importProgress = 0
        state.errors = [action.error.message || '가져오기에 실패했습니다.']
        state.success = false
      })
      
      // CSV 미리보기
      .addCase(previewCSVData.pending, (state) => {
        state.errors = []
        state.previewData = []
        state.validRecords = []
      })
      .addCase(previewCSVData.fulfilled, (state, action) => {
        state.totalRecords = action.payload.totalRecords
        state.validRecords = action.payload.validRecords
        state.previewData = action.payload.preview
        state.errors = action.payload.invalidRecords.map(item => item.error)
      })
      .addCase(previewCSVData.rejected, (state, action) => {
        state.errors = [action.error.message || '미리보기에 실패했습니다.']
        state.previewData = []
        state.validRecords = []
      })
  },
})

export const { resetImportState, updateProgress, addError, clearErrors } = csvImportSlice.actions
export default csvImportSlice.reducer
