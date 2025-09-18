// CSV 데이터 가져오기 다이얼로그 컴포넌트
import React, { useState, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  FileDownload as DownloadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { importCSVHealthRecords, previewCSVData, resetImportState } from '../store/slices/csvImportSlice'
import { fetchHealthRecords } from '../store/slices/healthRecordsSlice'
import { generateCSVTemplate, type CSVHealthRecord } from '../utils/csvParser'
import type { RootState } from '../store'
import type { AppDispatch } from '../store'

interface CSVImportDialogProps {
  open: boolean
  onClose: () => void
  userId: string
}

const CSVImportDialog: React.FC<CSVImportDialogProps> = ({ open, onClose, userId }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { isImporting, importProgress, totalRecords, importedRecords, failedRecords, errors, success, previewData } = useSelector((state: RootState) => state.csvImport)
  
  const [currentStep, setCurrentStep] = useState(0)
  const [csvContent, setCsvContent] = useState('')
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const steps = ['파일 선택', '데이터 미리보기', '가져오기 완료']

  // 파일 선택 처리
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const content = e.target?.result as string
      setCsvContent(content)
      setCurrentStep(1)
      
      // 자동으로 미리보기 실행
      dispatch(previewCSVData(content))
    }
    
    reader.readAsText(file, 'UTF-8')
  }

  // CSV 템플릿 다운로드
  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate()
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', 'health_data_template.csv')
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 데이터 가져오기 실행
  const handleImportData = async () => {
    if (!csvContent) return
    
    try {
      console.log('CSV 가져오기 시작...')
      const result = await dispatch(importCSVHealthRecords({ userId, csvContent })).unwrap()
      console.log('CSV 가져오기 결과:', result)
      
      // CSV 가져오기 성공 후 건강 기록 목록을 다시 불러오기
      if (result.importedCount > 0) {
        console.log('CSV 가져오기 성공! 가져온 데이터 수:', result.importedCount)
        
        // 즉시 새로고침
        console.log('건강 기록 즉시 새로고침 시작...')
        await dispatch(fetchHealthRecords(userId))
        console.log('건강 기록 즉시 새로고침 완료')
        
        // 1초 후 추가 새로고침
        setTimeout(async () => {
          console.log('CSV 다이얼로그에서 1초 후 새로고침...')
          await dispatch(fetchHealthRecords(userId))
        }, 1000)
        
        // 2초 후 최종 새로고침
        setTimeout(async () => {
          console.log('CSV 다이얼로그에서 2초 후 최종 새로고침...')
          await dispatch(fetchHealthRecords(userId))
        }, 2000)
        
        // 3초 후 강제 페이지 새로고침 (데이터 표시 보장)
        setTimeout(() => {
          console.log('페이지 강제 새로고침 실행...')
          window.location.reload()
        }, 3000)
      }
      
      setCurrentStep(2)
      
      // 5초 후 자동으로 다이얼로그 닫기 (페이지 새로고침 후)
      setTimeout(() => {
        handleClose()
      }, 5000)
      
      // 성공 상태를 즉시 리셋 (대시보드 새로고침 후)
      setTimeout(() => {
        dispatch(resetImportState())
      }, 4000)
    } catch (error) {
      console.error('CSV 가져오기 실패:', error)
    }
  }

  // 다이얼로그 닫기
  const handleClose = () => {
    dispatch(resetImportState())
    setCurrentStep(0)
    setCsvContent('')
    setFileName('')
    onClose()
  }

  // 측정 유형별 색상
  const getRecordTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      blood_pressure: '#f44336',
      blood_sugar: '#2196f3',
      weight: '#4caf50',
      exercise: '#ff9800'
    }
    return colors[type] || '#9e9e9e'
  }

  // 측정 유형별 한국어
  const getRecordTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      blood_pressure: '혈압',
      blood_sugar: '혈당',
      weight: '체중',
      exercise: '운동'
    }
    return labels[type] || type
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UploadIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              CSV 데이터 가져오기
            </Typography>
          </Box>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* 진행 단계 */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* 1단계: 파일 선택 */}
        {currentStep === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <UploadIcon sx={{ fontSize: '4rem', color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              CSV 파일을 선택해주세요
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              건강 측정 데이터가 포함된 CSV 파일을 업로드하세요.
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={() => fileInputRef.current?.click()}
                sx={{ mr: 2, py: 1.5, px: 4 }}
              >
                파일 선택
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleDownloadTemplate}
                startIcon={<DownloadIcon />}
                sx={{ py: 1.5, px: 4 }}
              >
                템플릿 다운로드
              </Button>
            </Box>

            <Alert severity="info" sx={{ textAlign: 'left', mt: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                📋 CSV 파일 형식 안내
              </Typography>
              <Typography variant="body2">
                • 컬럼 순서: 측정유형, 수축기혈압, 이완기혈압, 맥박, 혈당, 혈당유형, 체중, 측정시간, 메모
              </Typography>
              <Typography variant="body2">
                • 측정유형: blood_pressure, blood_sugar, weight, exercise
              </Typography>
              <Typography variant="body2">
                • 혈당유형: fasting (공복), post_meal (식후)
              </Typography>
              <Typography variant="body2">
                • 측정시간: YYYY-MM-DD HH:MM 형식 (예: 2024-01-15 09:00)
              </Typography>
            </Alert>
          </Box>
        )}

        {/* 2단계: 데이터 미리보기 */}
        {currentStep === 1 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <CheckIcon sx={{ color: 'success.main', fontSize: '2rem' }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  파일 분석 완료: {fileName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  총 {totalRecords}개의 기록을 발견했습니다.
                </Typography>
              </Box>
            </Box>

            {errors.length > 0 && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  ⚠️ {errors.length}개의 데이터에 문제가 있습니다
                </Typography>
                {errors.slice(0, 3).map((error, index) => (
                  <Typography key={index} variant="body2">
                    • {error}
                  </Typography>
                ))}
                {errors.length > 3 && (
                  <Typography variant="body2">
                    • ... 외 {errors.length - 3}개
                  </Typography>
                )}
              </Alert>
            )}

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  📊 데이터 미리보기 (처음 10개)
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>측정유형</TableCell>
                        <TableCell>수축기</TableCell>
                        <TableCell>이완기</TableCell>
                        <TableCell>맥박</TableCell>
                        <TableCell>혈당</TableCell>
                        <TableCell>체중</TableCell>
                        <TableCell>측정시간</TableCell>
                        <TableCell>메모</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewData.map((record, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip
                              label={getRecordTypeLabel(record.record_type)}
                              size="small"
                              sx={{ 
                                backgroundColor: getRecordTypeColor(record.record_type),
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell>{record.systolic_pressure || '-'}</TableCell>
                          <TableCell>{record.diastolic_pressure || '-'}</TableCell>
                          <TableCell>{record.heart_rate || '-'}</TableCell>
                          <TableCell>{record.blood_sugar || '-'}</TableCell>
                          <TableCell>{record.weight || '-'}</TableCell>
                          <TableCell>
                            {new Date(record.measurement_time).toLocaleString('ko-KR')}
                          </TableCell>
                          <TableCell>{record.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* 3단계: 가져오기 완료 */}
        {currentStep === 2 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            {success ? (
              <>
                <CheckIcon sx={{ fontSize: '4rem', color: 'success.main', mb: 2 }} />
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>
                  🎉 가져오기 완료!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  <strong>{importedRecords}개</strong>의 건강 기록을 성공적으로 가져왔습니다.
                  <br />
                  대시보드에서 최근 기록과 차트를 확인해보세요!
                </Typography>
                
                {failedRecords > 0 && (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      {failedRecords}개의 기록은 형식 오류로 인해 가져오지 못했습니다.
                    </Typography>
                  </Alert>
                )}

                <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                  <Typography variant="body2">
                    <strong>📊 데이터 새로고침 중...</strong>
                    <br />
                    • 최근 건강 기록 업데이트
                    <br />
                    • 차트 데이터 새로고침
                    <br />
                    • 5초 후 자동으로 닫힙니다
                  </Typography>
                </Alert>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleClose}
                    size="large"
                    sx={{ py: 1.5, px: 4 }}
                  >
                    지금 닫기
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <ErrorIcon sx={{ fontSize: '4rem', color: 'error.main', mb: 2 }} />
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: 'error.main' }}>
                  가져오기 실패
                </Typography>
                {errors.map((error, index) => (
                  <Alert key={index} severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                ))}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentStep(0)}
                    size="large"
                    sx={{ py: 1.5, px: 4 }}
                  >
                    다시 시도
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleClose}
                    size="large"
                    sx={{ py: 1.5, px: 4 }}
                  >
                    닫기
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )}

        {/* 가져오기 진행률 */}
        {isImporting && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              데이터를 가져오는 중... ({importedRecords}/{totalRecords})
            </Typography>
            <LinearProgress variant="determinate" value={importProgress} />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        {currentStep === 0 && (
          <Button onClick={handleClose} size="large">
            취소
          </Button>
        )}
        
        {currentStep === 1 && (
          <>
            <Button onClick={() => setCurrentStep(0)} size="large">
              이전
            </Button>
            <Button
              onClick={handleImportData}
              variant="contained"
              size="large"
              disabled={isImporting || totalRecords === 0}
              sx={{ py: 1.5, px: 4 }}
            >
              {isImporting ? '가져오는 중...' : '데이터 가져오기'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default CSVImportDialog
