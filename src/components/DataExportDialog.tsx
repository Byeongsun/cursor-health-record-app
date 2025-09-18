// 데이터 내보내기 다이얼로그 컴포넌트
import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Assessment as ReportIcon,
  DateRange as DateIcon
} from '@mui/icons-material'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { ko } from 'date-fns/locale'

// 타입 정의
interface HealthRecord {
  id: string
  user_id: string
  record_type: 'blood_pressure' | 'blood_sugar' | 'weight' | 'heart_rate' | 'temperature'
  systolic_pressure?: number
  diastolic_pressure?: number
  blood_sugar?: number
  blood_sugar_type?: 'fasting' | 'post_meal'
  weight?: number
  heart_rate?: number
  measurement_time: string
  notes?: string
  created_at: string
}

interface DataExportDialogProps {
  open: boolean
  onClose: () => void
  records: HealthRecord[]
  userName: string
}

// 기간 옵션
const PERIOD_OPTIONS = [
  { value: '7days', label: '최근 7일', days: 7 },
  { value: '30days', label: '최근 30일', days: 30 },
  { value: '90days', label: '최근 90일', days: 90 },
  { value: 'thisMonth', label: '이번 달', days: null },
  { value: 'lastMonth', label: '지난 달', days: null },
  { value: 'all', label: '전체 기간', days: null }
]

const DataExportDialog: React.FC<DataExportDialogProps> = ({
  open,
  onClose,
  records,
  userName
}) => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf')
  const [period, setPeriod] = useState('30days')
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeSummary, setIncludeSummary] = useState(true)
  const [includeNotes, setIncludeNotes] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  // 기간별 데이터 필터링
  const getFilteredRecords = () => {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case '7days':
        startDate = subDays(now, 7)
        break
      case '30days':
        startDate = subDays(now, 30)
        break
      case '90days':
        startDate = subDays(now, 90)
        break
      case 'thisMonth':
        startDate = startOfMonth(now)
        break
      case 'lastMonth':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        startDate = startOfMonth(lastMonth)
        break
      default:
        return records
    }

    return records.filter(record => {
      const recordDate = new Date(record.measurement_time)
      return recordDate >= startDate
    })
  }

  // 건강 수치 요약 통계 계산
  const calculateSummary = (records: HealthRecord[]) => {
    const bloodPressureRecords = records.filter(r => r.record_type === 'blood_pressure')
    const bloodSugarRecords = records.filter(r => r.record_type === 'blood_sugar')
    const weightRecords = records.filter(r => r.record_type === 'weight')

    const summary = {
      totalRecords: records.length,
      bloodPressure: {
        count: bloodPressureRecords.length,
        avgSystolic: 0,
        avgDiastolic: 0,
        maxSystolic: 0,
        minSystolic: 0,
        maxDiastolic: 0,
        minDiastolic: 0
      },
      bloodSugar: {
        count: bloodSugarRecords.length,
        avgFasting: 0,
        avgPostMeal: 0,
        maxFasting: 0,
        minFasting: 0,
        maxPostMeal: 0,
        minPostMeal: 0
      },
      weight: {
        count: weightRecords.length,
        avgWeight: 0,
        maxWeight: 0,
        minWeight: 0,
        latestWeight: 0
      }
    }

    // 혈압 통계
    if (bloodPressureRecords.length > 0) {
      const systolicValues = bloodPressureRecords.map(r => r.systolic_pressure!).filter(v => v)
      const diastolicValues = bloodPressureRecords.map(r => r.diastolic_pressure!).filter(v => v)
      
      summary.bloodPressure.avgSystolic = Math.round(systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length)
      summary.bloodPressure.avgDiastolic = Math.round(diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length)
      summary.bloodPressure.maxSystolic = Math.max(...systolicValues)
      summary.bloodPressure.minSystolic = Math.min(...systolicValues)
      summary.bloodPressure.maxDiastolic = Math.max(...diastolicValues)
      summary.bloodPressure.minDiastolic = Math.min(...diastolicValues)
    }

    // 혈당 통계
    if (bloodSugarRecords.length > 0) {
      const fastingValues = bloodSugarRecords.filter(r => r.blood_sugar_type === 'fasting').map(r => r.blood_sugar!).filter(v => v)
      const postMealValues = bloodSugarRecords.filter(r => r.blood_sugar_type === 'post_meal').map(r => r.blood_sugar!).filter(v => v)
      
      if (fastingValues.length > 0) {
        summary.bloodSugar.avgFasting = Math.round(fastingValues.reduce((a, b) => a + b, 0) / fastingValues.length)
        summary.bloodSugar.maxFasting = Math.max(...fastingValues)
        summary.bloodSugar.minFasting = Math.min(...fastingValues)
      }
      
      if (postMealValues.length > 0) {
        summary.bloodSugar.avgPostMeal = Math.round(postMealValues.reduce((a, b) => a + b, 0) / postMealValues.length)
        summary.bloodSugar.maxPostMeal = Math.max(...postMealValues)
        summary.bloodSugar.minPostMeal = Math.min(...postMealValues)
      }
    }

    // 체중 통계
    if (weightRecords.length > 0) {
      const weightValues = weightRecords.map(r => r.weight!).filter(v => v)
      summary.weight.avgWeight = Math.round(weightValues.reduce((a, b) => a + b, 0) / weightValues.length * 10) / 10
      summary.weight.maxWeight = Math.max(...weightValues)
      summary.weight.minWeight = Math.min(...weightValues)
      summary.weight.latestWeight = weightValues[0] // 최신 체중
    }

    return summary
  }

  // PDF 내보내기
  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      const filteredRecords = getFilteredRecords()
      const summary = calculateSummary(filteredRecords)
      const periodLabel = PERIOD_OPTIONS.find(p => p.value === period)?.label || '전체 기간'

      const doc = new jsPDF('p', 'mm', 'a4')
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      let yPosition = 20

      // 헤더
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('건강 기록 보고서', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 10

      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`${userName}님의 건강 기록`, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 5
      doc.text(`기간: ${periodLabel}`, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 5
      doc.text(`생성일: ${format(new Date(), 'yyyy년 MM월 dd일', { locale: ko })}`, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 15

      // 요약 정보
      if (includeSummary) {
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('📊 건강 수치 요약', 20, yPosition)
        yPosition += 10

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        
        // 혈압 요약
        if (summary.bloodPressure.count > 0) {
          doc.text(`❤️ 혈압 측정: ${summary.bloodPressure.count}회`, 25, yPosition)
          yPosition += 6
          doc.text(`   평균: ${summary.bloodPressure.avgSystolic}/${summary.bloodPressure.avgDiastolic} mmHg`, 30, yPosition)
          yPosition += 6
          doc.text(`   최고: ${summary.bloodPressure.maxSystolic}/${summary.bloodPressure.maxDiastolic} mmHg`, 30, yPosition)
          yPosition += 6
          doc.text(`   최저: ${summary.bloodPressure.minSystolic}/${summary.bloodPressure.minDiastolic} mmHg`, 30, yPosition)
          yPosition += 8
        }

        // 혈당 요약
        if (summary.bloodSugar.count > 0) {
          doc.text(`🩸 혈당 측정: ${summary.bloodSugar.count}회`, 25, yPosition)
          yPosition += 6
          if (summary.bloodSugar.avgFasting > 0) {
            doc.text(`   공복 평균: ${summary.bloodSugar.avgFasting} mg/dL`, 30, yPosition)
            yPosition += 6
          }
          if (summary.bloodSugar.avgPostMeal > 0) {
            doc.text(`   식후 평균: ${summary.bloodSugar.avgPostMeal} mg/dL`, 30, yPosition)
            yPosition += 6
          }
          yPosition += 8
        }

        // 체중 요약
        if (summary.weight.count > 0) {
          doc.text(`⚖️ 체중 측정: ${summary.weight.count}회`, 25, yPosition)
          yPosition += 6
          doc.text(`   평균: ${summary.weight.avgWeight} kg`, 30, yPosition)
          yPosition += 6
          doc.text(`   최고: ${summary.weight.maxWeight} kg`, 30, yPosition)
          yPosition += 6
          doc.text(`   최저: ${summary.weight.minWeight} kg`, 30, yPosition)
          yPosition += 6
          doc.text(`   최신: ${summary.weight.latestWeight} kg`, 30, yPosition)
          yPosition += 10
        }

        // 페이지 넘김 체크
        if (yPosition > pageHeight - 50) {
          doc.addPage()
          yPosition = 20
        }
      }

      // 상세 기록
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('📋 상세 기록', 20, yPosition)
      yPosition += 10

      // 테이블 헤더
      const tableHeaders = ['측정일시', '종류', '수치', '메모']
      const tableData: any[][] = []

      filteredRecords.forEach(record => {
        const measurementTime = format(new Date(record.measurement_time), 'MM/dd HH:mm', { locale: ko })
        let recordType = ''
        let value = ''

        switch (record.record_type) {
          case 'blood_pressure':
            recordType = '혈압'
            value = `${record.systolic_pressure}/${record.diastolic_pressure} mmHg`
            if (record.heart_rate) value += ` (맥박: ${record.heart_rate})`
            break
          case 'blood_sugar':
            recordType = record.blood_sugar_type === 'fasting' ? '공복혈당' : '식후혈당'
            value = `${record.blood_sugar} mg/dL`
            break
          case 'weight':
            recordType = '체중'
            value = `${record.weight} kg`
            break
        }

        const notes = includeNotes && record.notes ? record.notes.substring(0, 30) : ''
        tableData.push([measurementTime, recordType, value, notes])
      })

      // 테이블 생성
      ;(doc as any).autoTable({
        head: [tableHeaders],
        body: tableData,
        startY: yPosition,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [66, 139, 202] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 20, right: 20 }
      })

      // 파일 저장
      const fileName = `${userName}_건강기록_${periodLabel}_${format(new Date(), 'yyyyMMdd')}.pdf`
      doc.save(fileName)

    } catch (error) {
      console.error('PDF 내보내기 오류:', error)
      alert('PDF 내보내기 중 오류가 발생했습니다.')
    } finally {
      setIsExporting(false)
    }
  }

  // Excel 내보내기
  const exportToExcel = async () => {
    setIsExporting(true)
    try {
      const filteredRecords = getFilteredRecords()
      const summary = calculateSummary(filteredRecords)
      const periodLabel = PERIOD_OPTIONS.find(p => p.value === period)?.label || '전체 기간'

      const workbook = XLSX.utils.book_new()

      // 상세 기록 시트
      const recordsData = [
        ['측정일시', '종류', '수치', '측정값1', '측정값2', '측정값3', '메모'],
        ...filteredRecords.map(record => {
          const measurementTime = format(new Date(record.measurement_time), 'yyyy-MM-dd HH:mm', { locale: ko })
          let recordType = ''
          let value = ''
          let value1 = ''
          let value2 = ''
          let value3 = ''

          switch (record.record_type) {
            case 'blood_pressure':
              recordType = '혈압'
              value = `${record.systolic_pressure}/${record.diastolic_pressure} mmHg`
              value1 = record.systolic_pressure?.toString() || ''
              value2 = record.diastolic_pressure?.toString() || ''
              value3 = record.heart_rate?.toString() || ''
              break
            case 'blood_sugar':
              recordType = record.blood_sugar_type === 'fasting' ? '공복혈당' : '식후혈당'
              value = `${record.blood_sugar} mg/dL`
              value1 = record.blood_sugar?.toString() || ''
              break
            case 'weight':
              recordType = '체중'
              value = `${record.weight} kg`
              value1 = record.weight?.toString() || ''
              break
          }

          return [
            measurementTime,
            recordType,
            value,
            value1,
            value2,
            value3,
            record.notes || ''
          ]
        })
      ]

      const recordsSheet = XLSX.utils.aoa_to_sheet(recordsData)
      XLSX.utils.book_append_sheet(workbook, recordsSheet, '건강기록')

      // 요약 시트
      if (includeSummary) {
        const summaryData = [
          ['건강 수치 요약', ''],
          ['기간', periodLabel],
          ['총 기록 수', summary.totalRecords],
          ['', ''],
          ['혈압 측정', ''],
          ['측정 횟수', summary.bloodPressure.count],
          ['평균 수축기', summary.bloodPressure.avgSystolic],
          ['평균 이완기', summary.bloodPressure.avgDiastolic],
          ['최고 수축기', summary.bloodPressure.maxSystolic],
          ['최저 수축기', summary.bloodPressure.minSystolic],
          ['최고 이완기', summary.bloodPressure.maxDiastolic],
          ['최저 이완기', summary.bloodPressure.minDiastolic],
          ['', ''],
          ['혈당 측정', ''],
          ['측정 횟수', summary.bloodSugar.count],
          ['공복 평균', summary.bloodSugar.avgFasting],
          ['공복 최고', summary.bloodSugar.maxFasting],
          ['공복 최저', summary.bloodSugar.minFasting],
          ['식후 평균', summary.bloodSugar.avgPostMeal],
          ['식후 최고', summary.bloodSugar.maxPostMeal],
          ['식후 최저', summary.bloodSugar.minPostMeal],
          ['', ''],
          ['체중 측정', ''],
          ['측정 횟수', summary.weight.count],
          ['평균 체중', summary.weight.avgWeight],
          ['최고 체중', summary.weight.maxWeight],
          ['최저 체중', summary.weight.minWeight],
          ['최신 체중', summary.weight.latestWeight]
        ]

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
        XLSX.utils.book_append_sheet(workbook, summarySheet, '요약')
      }

      // 파일 저장
      const fileName = `${userName}_건강기록_${periodLabel}_${format(new Date(), 'yyyyMMdd')}.xlsx`
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(data, fileName)

    } catch (error) {
      console.error('Excel 내보내기 오류:', error)
      alert('Excel 내보내기 중 오류가 발생했습니다.')
    } finally {
      setIsExporting(false)
    }
  }

  // 내보내기 실행
  const handleExport = async () => {
    if (exportFormat === 'pdf') {
      await exportToPDF()
    } else {
      await exportToExcel()
    }
    onClose()
  }

  const filteredRecords = getFilteredRecords()
  const summary = calculateSummary(filteredRecords)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        backgroundColor: '#f5f5f5', 
        borderBottom: '1px solid #e0e0e0',
        fontSize: '1.5rem',
        fontWeight: 600
      }}>
        📊 데이터 내보내기
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* 내보내기 형식 선택 */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>내보내기 형식</InputLabel>
              <Select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'excel')}
                label="내보내기 형식"
              >
                <MenuItem value="pdf">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PdfIcon color="error" />
                    <span>PDF 보고서</span>
                  </Box>
                </MenuItem>
                <MenuItem value="excel">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ExcelIcon color="success" />
                    <span>Excel 파일</span>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* 기간 선택 */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>기간</InputLabel>
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                label="기간"
              >
                {PERIOD_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DateIcon fontSize="small" />
                      <span>{option.label}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* 옵션 선택 */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              포함할 내용
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeSummary}
                      onChange={(e) => setIncludeSummary(e.target.checked)}
                    />
                  }
                  label="요약 통계 포함"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeNotes}
                      onChange={(e) => setIncludeNotes(e.target.checked)}
                    />
                  }
                  label="메모 포함"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* 미리보기 정보 */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              내보내기 미리보기
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        {filteredRecords.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        총 기록 수
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                        {summary.bloodPressure.count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        혈압 측정
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: 'info.main', fontWeight: 'bold' }}>
                        {summary.bloodSugar.count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        혈당 측정
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                        {summary.weight.count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        체중 측정
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<PdfIcon />} 
                    label={exportFormat === 'pdf' ? 'PDF 형식' : 'Excel 형식'} 
                    color={exportFormat === 'pdf' ? 'error' : 'success'}
                    variant="outlined"
                  />
                  <Chip 
                    icon={<DateIcon />} 
                    label={PERIOD_OPTIONS.find(p => p.value === period)?.label} 
                    variant="outlined"
                  />
                  {includeSummary && <Chip label="요약 포함" color="primary" variant="outlined" />}
                  {includeNotes && <Chip label="메모 포함" color="secondary" variant="outlined" />}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 안내 메시지 */}
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                💡 <strong>PDF 형식</strong>은 의료진과 공유하기에 적합하며, <strong>Excel 형식</strong>은 추가 분석이나 다른 프로그램에서 활용하기에 좋습니다.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} disabled={isExporting}>
          취소
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          startIcon={isExporting ? <CircularProgress size={20} /> : <DownloadIcon />}
          disabled={isExporting || filteredRecords.length === 0}
          sx={{
            backgroundColor: exportFormat === 'pdf' ? '#d32f2f' : '#2e7d32',
            '&:hover': {
              backgroundColor: exportFormat === 'pdf' ? '#b71c1c' : '#1b5e20'
            }
          }}
        >
          {isExporting ? '내보내는 중...' : `${exportFormat === 'pdf' ? 'PDF' : 'Excel'} 다운로드`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DataExportDialog

