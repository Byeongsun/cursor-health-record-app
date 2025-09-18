import React, { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Download as DownloadIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../store'
import { fetchHealthRecords, deleteHealthRecord } from '../store/slices/healthRecordsSlice'
import { useAuth } from '../hooks/useAuth'
import UnifiedNavigation from '../components/UnifiedNavigation'
import HealthRecordEditDialog from '../components/HealthRecordEditDialog'
import BulkDeleteDialog from '../components/BulkDeleteDialog'

const RecordsListPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useAuth()
  const { records, loading, error } = useSelector((state: RootState) => state.healthRecords)
  
  // 상태 관리
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)

  const recordsPerPage = 10

  // 데이터 로드
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchHealthRecords(user.id))
    }
  }, [dispatch, user?.id])

  // 필터링 및 정렬된 데이터
  const filteredRecords = React.useMemo(() => {
    let filtered = records

    // 타입 필터링
    if (filterType !== 'all') {
      filtered = filtered.filter(record => record.record_type === filterType)
    }

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.record_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 정렬 (배열을 복사한 후 정렬)
    return [...filtered].sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.measurement_time).getTime()
          bValue = new Date(b.measurement_time).getTime()
          break
        case 'type':
          aValue = a.record_type
          bValue = b.record_type
          break
        default:
          aValue = new Date(a.measurement_time).getTime()
          bValue = new Date(b.measurement_time).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [records, filterType, searchTerm, sortBy, sortOrder])

  // 페이지네이션
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)
  const paginatedRecords = filteredRecords.slice(
    (page - 1) * recordsPerPage,
    page * recordsPerPage
  )

  // 헬퍼 함수들
  const getRecordTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      blood_pressure: '혈압',
      blood_sugar: '혈당',
      weight: '체중',
      heart_rate: '맥박',
      temperature: '체온'
    }
    return labels[type] || type
  }

  const getRecordTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      blood_pressure: '#ff6b6b',
      blood_sugar: '#4ecdc4',
      weight: '#45b7d1',
      heart_rate: '#ffa726',
      temperature: '#ab47bc'
    }
    return colors[type] || '#666'
  }

  const formatRecordValue = (record: any) => {
    switch (record.record_type) {
      case 'blood_pressure':
        return `${record.systolic_pressure || '-'}/${record.diastolic_pressure || '-'} mmHg`
      case 'blood_sugar':
        return `${record.blood_sugar || '-'} mg/dL (${record.blood_sugar_type === 'fasting' ? '공복' : '식후'})`
      case 'weight':
        return `${record.weight || '-'} kg`
      case 'heart_rate':
        return `${record.heart_rate || '-'} bpm`
      case 'temperature':
        return `${record.temperature || '-'}°C`
      default:
        return '-'
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 이벤트 핸들러들
  const handleEditRecord = (record: any) => {
    setSelectedRecord(record)
    setEditDialogOpen(true)
  }

  const handleDeleteRecord = (recordId: string) => {
    setRecordToDelete(recordId)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (recordToDelete) {
      try {
        await dispatch(deleteHealthRecord(recordToDelete)).unwrap()
        setDeleteConfirmOpen(false)
        setRecordToDelete(null)
      } catch (error) {
        console.error('삭제 실패:', error)
      }
    }
  }

  const handleBulkDelete = () => {
    const recordsToDelete = records.filter(record => selectedRecords.includes(record.id))
    setSelectedRecords(recordsToDelete)
    setBulkDeleteOpen(true)
  }

  const handleSelectAll = () => {
    if (selectedRecords.length === paginatedRecords.length) {
      setSelectedRecords([])
    } else {
      setSelectedRecords(paginatedRecords.map(record => record.id))
    }
  }

  const handleSelectRecord = (recordId: string) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    )
  }

  const handleEditSuccess = () => {
    if (user?.id) {
      dispatch(fetchHealthRecords(user.id))
    }
    setEditDialogOpen(false)
    setSelectedRecord(null)
  }

  const handleBulkDeleteSuccess = () => {
    if (user?.id) {
      dispatch(fetchHealthRecords(user.id))
    }
    setBulkDeleteOpen(false)
    setSelectedRecords([])
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* 통합 네비게이션 */}
      <UnifiedNavigation
        onGoalSetting={() => {/* TODO: 목표 설정 구현 */}}
        onNotificationCenter={() => {/* TODO: 알림 센터 구현 */}}
        onNotificationSettings={() => {/* TODO: 알림 설정 구현 */}}
        onCsvImport={() => {/* TODO: CSV 가져오기 구현 */}}
        onHealthRecord={(type) => navigate(`/record?type=${type}`)}
        onDataExport={() => {/* TODO: 데이터 내보내기 구현 */}}
        onBulkDelete={() => {/* TODO: 다중 삭제 구현 */}}
        onEditRecord={() => {/* TODO: 편집 구현 */}}
      />

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        {/* 페이지 제목 */}
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
          📋 전체 건강 기록
        </Typography>
        
        {/* 검색 및 필터 섹션 */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* 검색 */}
              <TextField
                placeholder="기록 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 200 }}
              />

              {/* 타입 필터 */}
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>측정 유형</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="측정 유형"
                >
                  <MenuItem value="all">전체</MenuItem>
                  <MenuItem value="blood_pressure">혈압</MenuItem>
                  <MenuItem value="blood_sugar">혈당</MenuItem>
                  <MenuItem value="weight">체중</MenuItem>
                  <MenuItem value="heart_rate">맥박</MenuItem>
                  <MenuItem value="temperature">체온</MenuItem>
                </Select>
              </FormControl>

              {/* 정렬 기준 */}
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>정렬 기준</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="정렬 기준"
                >
                  <MenuItem value="date">날짜</MenuItem>
                  <MenuItem value="type">유형</MenuItem>
                </Select>
              </FormControl>

              {/* 정렬 순서 */}
              <FormControl sx={{ minWidth: 100 }}>
                <InputLabel>순서</InputLabel>
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  label="순서"
                >
                  <MenuItem value="desc">최신순</MenuItem>
                  <MenuItem value="asc">오래된순</MenuItem>
                </Select>
              </FormControl>

              {/* 새 기록 추가 */}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/health-record')}
                sx={{ ml: 'auto' }}
              >
                새 기록 추가
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* 기록 테이블 */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : paginatedRecords.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {filteredRecords.length === 0 ? '기록이 없습니다.' : '검색 결과가 없습니다.'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/health-record')}
                sx={{ mt: 2 }}
              >
                첫 기록 추가하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedRecords.length === paginatedRecords.length && paginatedRecords.length > 0}
                        onChange={handleSelectAll}
                        style={{ transform: 'scale(1.2)' }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1.1rem' }}>측정 유형</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1.1rem' }}>측정값</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1.1rem' }}>측정 시간</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1.1rem' }}>메모</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '1.1rem' }}>작업</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRecords.map((record) => (
                    <TableRow 
                      key={record.id}
                      hover
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                        '&:hover': { backgroundColor: '#f0f0f0' }
                      }}
                    >
                      <TableCell padding="checkbox">
                        <input
                          type="checkbox"
                          checked={selectedRecords.includes(record.id)}
                          onChange={() => handleSelectRecord(record.id)}
                          style={{ transform: 'scale(1.2)' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getRecordTypeLabel(record.record_type)}
                          sx={{
                            backgroundColor: getRecordTypeColor(record.record_type),
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatRecordValue(record)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTime(record.measurement_time)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {record.notes || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditRecord(record)}
                            sx={{ color: 'primary.main' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRecord(record.id)}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}

        {/* 수정 다이얼로그 */}
        <HealthRecordEditDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          record={selectedRecord}
          onSuccess={handleEditSuccess}
        />

        {/* 다중 삭제 다이얼로그 */}
        <BulkDeleteDialog
          open={bulkDeleteOpen}
          onClose={() => setBulkDeleteOpen(false)}
          records={records.filter(record => selectedRecords.includes(record.id))}
          onSuccess={handleBulkDeleteSuccess}
        />

        {/* 삭제 확인 다이얼로그 */}
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>기록 삭제</DialogTitle>
          <DialogContent>
            <Typography>이 기록을 삭제하시겠습니까?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>취소</Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">
              삭제
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}

export default RecordsListPage
