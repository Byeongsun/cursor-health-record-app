import React, { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Timeline as TimelineIcon,
  TableChart as TableIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../store'
import { fetchHealthRecords } from '../store/slices/healthRecordsSlice'
import { useAuth } from '../hooks/useAuth'
import UnifiedNavigation from '../components/UnifiedNavigation'
import BloodPressureChart from '../components/charts/BloodPressureChart'
import BloodSugarChart from '../components/charts/BloodSugarChart'
import WeightChart from '../components/charts/WeightChart'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

const AllDataViewPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useAuth()
  const { records, loading, error } = useSelector((state: RootState) => state.healthRecords)
  
  // 상태 관리
  const [tabValue, setTabValue] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'timeline' | 'table' | 'charts'>('timeline')

  const recordsPerPage = 20

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleRefresh = () => {
    if (user?.id) {
      dispatch(fetchHealthRecords(user.id))
    }
  }

  // 통계 계산
  const stats = React.useMemo(() => {
    const bloodPressureRecords = records.filter(r => r.record_type === 'blood_pressure')
    const bloodSugarRecords = records.filter(r => r.record_type === 'blood_sugar')
    const weightRecords = records.filter(r => r.record_type === 'weight')
    
    return {
      total: records.length,
      bloodPressure: bloodPressureRecords.length,
      bloodSugar: bloodSugarRecords.length,
      weight: weightRecords.length,
      other: records.length - bloodPressureRecords.length - bloodSugarRecords.length - weightRecords.length
    }
  }, [records])

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* 통합 네비게이션 */}
      <UnifiedNavigation
        onGoalSetting={() => {/* TODO: 목표 설정 구현 */}}
        onNotificationCenter={() => {/* TODO: 알림 센터 구현 */}}
        onNotificationSettings={() => {/* TODO: 알림 설정 구현 */}}
        onCsvImport={() => {/* TODO: CSV 가져오기 구현 */}}
        onHealthRecord={(type) => navigate(`/record?type=${type}`)}
        onBulkDelete={() => {/* TODO: 다중 삭제 구현 */}}
        onEditRecord={() => {/* TODO: 편집 구현 */}}
      />

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        {/* 페이지 제목 */}
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
          📊 전체 데이터 뷰
        </Typography>
        
        {/* 통계 카드 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: '#fff', border: '2px solid #667eea' }}>
              <CardContent>
                <Typography variant="h4" sx={{ color: '#667eea', fontWeight: 'bold' }}>
                  {stats.total}
                </Typography>
                <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 600 }}>
                  전체 기록
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: '#fff', border: '2px solid #ff6b6b' }}>
              <CardContent>
                <Typography variant="h4" sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                  {stats.bloodPressure}
                </Typography>
                <Typography variant="h6" sx={{ color: '#ff6b6b', fontWeight: 600 }}>
                  혈압 기록
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: '#fff', border: '2px solid #4ecdc4' }}>
              <CardContent>
                <Typography variant="h4" sx={{ color: '#4ecdc4', fontWeight: 'bold' }}>
                  {stats.bloodSugar}
                </Typography>
                <Typography variant="h6" sx={{ color: '#4ecdc4', fontWeight: 600 }}>
                  혈당 기록
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: '#fff', border: '2px solid #45b7d1' }}>
              <CardContent>
                <Typography variant="h4" sx={{ color: '#45b7d1', fontWeight: 'bold' }}>
                  {stats.weight}
                </Typography>
                <Typography variant="h6" sx={{ color: '#45b7d1', fontWeight: 600 }}>
                  체중 기록
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/health-record')}
                sx={{ ml: 'auto' }}
              >
                새 기록 추가
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* 탭 네비게이션 */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="data view tabs">
              <Tab 
                icon={<TimelineIcon />} 
                label="타임라인 뷰" 
                iconPosition="start"
                sx={{ fontSize: '1rem', fontWeight: 600 }}
              />
              <Tab 
                icon={<TableIcon />} 
                label="테이블 뷰" 
                iconPosition="start"
                sx={{ fontSize: '1rem', fontWeight: 600 }}
              />
              <Tab 
                icon={<BarChartIcon />} 
                label="차트 뷰" 
                iconPosition="start"
                sx={{ fontSize: '1rem', fontWeight: 600 }}
              />
            </Tabs>
          </Box>

          {/* 타임라인 뷰 */}
          <TabPanel value={tabValue} index={0}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={60} />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            ) : paginatedRecords.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {filteredRecords.length === 0 ? '기록이 없습니다.' : '검색 결과가 없습니다.'}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/health-record')}
                  sx={{ mt: 2 }}
                >
                  첫 기록 추가하기
                </Button>
              </Box>
            ) : (
              <Box>
                {paginatedRecords.map((record, index) => (
                  <Box key={record.id} sx={{ mb: 3 }}>
                    <Card sx={{ 
                      backgroundColor: '#fff',
                      border: `2px solid ${getRecordTypeColor(record.record_type)}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip
                              label={getRecordTypeLabel(record.record_type)}
                              sx={{
                                backgroundColor: getRecordTypeColor(record.record_type),
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '1rem'
                              }}
                            />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {formatRecordValue(record)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatDateTime(record.measurement_time)}
                          </Typography>
                        </Box>
                        {record.notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            📝 {record.notes}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                ))}
                
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
              </Box>
            )}
          </TabPanel>

          {/* 테이블 뷰 */}
          <TabPanel value={tabValue} index={1}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={60} />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            ) : paginatedRecords.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {filteredRecords.length === 0 ? '기록이 없습니다.' : '검색 결과가 없습니다.'}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/health-record')}
                  sx={{ mt: 2 }}
                >
                  첫 기록 추가하기
                </Button>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '1.1rem' }}>측정 유형</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '1.1rem' }}>측정값</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '1.1rem' }}>측정 시간</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '1.1rem' }}>메모</TableCell>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* 차트 뷰 */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <BloodPressureChart data={records} height={400} />
              </Grid>
              <Grid item xs={12}>
                <BloodSugarChart data={records} height={400} />
              </Grid>
              <Grid item xs={12}>
                <WeightChart data={records} height={400} />
              </Grid>
            </Grid>
          </TabPanel>
        </Card>
      </Container>
    </Box>
  )
}

export default AllDataViewPage
