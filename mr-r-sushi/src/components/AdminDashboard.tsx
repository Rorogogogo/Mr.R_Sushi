import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
  Alert,
  TextField,
  IconButton,
  Chip,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  Divider,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Check as CheckIcon,
  CalendarMonth as CalendarIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { zhCN } from 'date-fns/locale'
import { format } from 'date-fns'
import {
  getTodayOrders,
  getOrdersByDate,
  updateOrderStatus,
  deleteOrder,
} from '../services/orderService'

interface AddOn {
  name: string
  price: number
  $id?: string
  $ref?: string
}

interface OrderItem {
  id: number
  orderId: number
  menuItemId: number
  quantity: number
  unitPrice: number
  menuItem: {
    name: string
    price: string
    category: string
  }
  addOns?: AddOn[] | { $id?: string; $values: AddOn[] }
  $id?: string
  $ref?: string
}

interface Order {
  id: number
  orderNumber: string
  customerName: string
  phoneNumber: string
  reservationTime: string
  orderDate: string
  totalAmount: number
  status: string
  orderItems: OrderItem[] | { $id?: string; $values: OrderItem[] }
  $id?: string
  $ref?: string
}

// Helper function to get an array of OrderItems
const getOrderItemsArray = (order: Order): OrderItem[] => {
  if (Array.isArray(order.orderItems)) {
    return order.orderItems
  } else if (order.orderItems && '$values' in order.orderItems) {
    return order.orderItems.$values
  }
  return []
}

// Helper function to get an array of AddOns from an OrderItem
const getAddOnsArray = (orderItem: OrderItem): AddOn[] => {
  if (!orderItem.addOns) return []
  if (Array.isArray(orderItem.addOns)) {
    return orderItem.addOns
  } else if (
    typeof orderItem.addOns === 'object' &&
    '$values' in orderItem.addOns
  ) {
    return orderItem.addOns.$values
  }
  return []
}

const AdminDashboard: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [totalAmount, setTotalAmount] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const calculatePaidTotal = (currentOrders: Order[]): number => {
    return currentOrders.reduce((sum, order) => {
      if (
        order.status === 'Paid' ||
        order.status === '已确认付款' ||
        order.status === 'Completed' ||
        order.status === '已取货'
      ) {
        const amount = Number(order.totalAmount)
        if (!isNaN(amount)) {
          return sum + amount
        }
      }
      return sum
    }, 0)
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        let response

        if (selectedDate) {
          const dateStr = format(selectedDate, 'yyyy-MM-dd')
          response = await getOrdersByDate(dateStr)
        } else {
          response = await getTodayOrders()
        }

        if (response.success) {
          setOrders(response.data)
          // Extract total amount from the message
          if (response.message) {
            const match = response.message.match(/(\d+(\.\d+)?)元/)
            if (match) {
              setTotalAmount(parseFloat(match[1]))
            }
          }
        } else {
          setError('加载订单失败')
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
        setError('加载订单时出错')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [selectedDate, refreshKey])

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date)
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await updateOrderStatus(orderId, newStatus)
      if (response.success) {
        setOrders((prevOrders) => {
          const updatedOrders = prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
          const newTotal = calculatePaidTotal(updatedOrders)
          setTotalAmount(newTotal)
          return updatedOrders
        })
      } else {
        setError('更新订单状态失败')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      setError('更新订单状态时出错')
    }
  }

  const openDeleteDialog = (orderId: number) => {
    setOrderToDelete(orderId)
    setDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setOrderToDelete(null)
  }

  const handleDeleteOrder = async () => {
    if (orderToDelete === null) return

    try {
      const response = await deleteOrder(orderToDelete)
      if (response.success) {
        setOrders((prevOrders) => {
          const updatedOrders = prevOrders.filter(
            (order) => order.id !== orderToDelete
          )
          const newTotal = calculatePaidTotal(updatedOrders)
          setTotalAmount(newTotal)
          return updatedOrders
        })
        closeDeleteDialog()
      } else {
        setError('删除订单失败')
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      setError('删除订单时出错')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
      case 'Unpaid':
        return theme.palette.warning.main
      case 'Paid':
      case '已确认付款':
        return theme.palette.info.main
      case 'Completed':
      case '已取货':
        return theme.palette.success.main
      case 'Cancelled':
        return theme.palette.error.main
      default:
        return theme.palette.grey[500]
    }
  }

  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr)
      return format(date, 'yyyy-MM-dd HH:mm')
    } catch (e) {
      return dateTimeStr
    }
  }

  const getNextStatus = (currentStatus: string) => {
    if (currentStatus === 'Pending' || currentStatus === 'Unpaid') {
      return '已确认付款'
    } else if (currentStatus === 'Paid' || currentStatus === '已确认付款') {
      return '已取货'
    }
    return null
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: { xs: 2, md: 0 },
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}>
          订单管理
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={zhCN}>
            <DatePicker
              label="选择日期"
              value={selectedDate}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: { width: 150 },
                },
              }}
            />
          </LocalizationProvider>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            size="small">
            刷新
          </Button>
        </Box>
      </Box>

      {/* Summary card */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 2,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}22, ${theme.palette.secondary.main}22)`,
        }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6} component="div">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CalendarIcon color="primary" />
                <Typography variant="h6">
                  {selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '今日'}
                  订单概览
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} component="div">
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                }}>
                <MoneyIcon color="success" />
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  总收入: {totalAmount.toFixed(2)} 元
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary">
            暂无订单
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Mobile View */}
          {isMobile && (
            <Box sx={{ mb: 4 }}>
              {orders.map((order) => (
                <Paper
                  key={order.id}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    overflow: 'hidden',
                    borderLeft: `4px solid ${getStatusColor(order.status)}`,
                  }}>
                  <Box sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        订单 #{order.orderNumber}
                      </Typography>
                      <Chip
                        label={
                          order.status === 'Pending' ||
                          order.status === 'Unpaid'
                            ? '待付款'
                            : order.status === 'Paid' ||
                              order.status === '已确认付款'
                            ? '已付款'
                            : order.status === 'Completed' ||
                              order.status === '已取货'
                            ? '已完成'
                            : order.status
                        }
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(order.status),
                          color: 'white',
                        }}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      客户: {order.customerName} ({order.phoneNumber})
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      预约: {formatDateTime(order.reservationTime)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      下单: {formatDateTime(order.orderDate)}
                    </Typography>

                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        订单内容:
                      </Typography>
                      {getOrderItemsArray(order).map((item) => (
                        <React.Fragment key={item.id}>
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {item.menuItem.name} x{item.quantity} (
                            {(item.unitPrice * item.quantity).toFixed(2)}元)
                          </Typography>
                          {/* Display AddOns for Mobile View, now using getAddOnsArray */}
                          {getAddOnsArray(item).map((addOn) => (
                            <Typography
                              key={addOn.name}
                              variant="caption"
                              sx={{ ml: 2, display: 'block' }}
                              color="text.secondary">
                              + {addOn.name} ({addOn.price.toFixed(2)}元)
                            </Typography>
                          ))}
                        </React.Fragment>
                      ))}
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 2,
                      }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="primary.main">
                        总计: {order.totalAmount.toFixed(2)}元
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {getNextStatus(order.status) && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={
                              order.status === 'Pending' ||
                              order.status === 'Unpaid' ? (
                                <MoneyIcon />
                              ) : (
                                <ShippingIcon />
                              )
                            }
                            onClick={() =>
                              handleUpdateStatus(
                                order.id,
                                getNextStatus(order.status) || ''
                              )
                            }>
                            {order.status === 'Pending' ||
                            order.status === 'Unpaid'
                              ? '确认付款'
                              : '确认取货'}
                          </Button>
                        )}

                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => openDeleteDialog(order.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}

          {/* Desktop View */}
          {!isMobile && (
            <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 4 }}>
              <Table>
                <TableHead
                  sx={{ backgroundColor: theme.palette.primary.light + '22' }}>
                  <TableRow>
                    <TableCell>订单号</TableCell>
                    <TableCell>客户</TableCell>
                    <TableCell>预约时间</TableCell>
                    <TableCell>订单内容</TableCell>
                    <TableCell>总金额</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}>
                          <ReceiptIcon fontSize="small" color="primary" />
                          {order.orderNumber}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {order.customerName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.phoneNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(order.reservationTime)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          下单: {formatDateTime(order.orderDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            maxWidth: 250,
                            maxHeight: 100,
                            overflow: 'auto',
                          }}>
                          {getOrderItemsArray(order).map((item) => (
                            <React.Fragment key={item.id}>
                              <Typography variant="body2" noWrap>
                                {item.menuItem.name} x{item.quantity}
                              </Typography>
                              {/* Display AddOns for Desktop View, now using getAddOnsArray */}
                              {getAddOnsArray(item).map((addOn) => (
                                <Typography
                                  key={addOn.name}
                                  variant="caption"
                                  sx={{ display: 'block', ml: 1 }}
                                  color="text.secondary">
                                  + {addOn.name} ({addOn.price.toFixed(2)}元)
                                </Typography>
                              ))}
                            </React.Fragment>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {order.totalAmount.toFixed(2)}元
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            order.status === 'Pending' ||
                            order.status === 'Unpaid'
                              ? '待付款'
                              : order.status === 'Paid' ||
                                order.status === '已确认付款'
                              ? '已付款'
                              : order.status === 'Completed' ||
                                order.status === '已取货'
                              ? '已完成'
                              : order.status
                          }
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(order.status),
                            color: 'white',
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            justifyContent: 'center',
                          }}>
                          {getNextStatus(order.status) && (
                            <Button
                              variant="contained"
                              size="small"
                              color="primary"
                              onClick={() =>
                                handleUpdateStatus(
                                  order.id,
                                  getNextStatus(order.status) || ''
                                )
                              }>
                              {order.status === 'Pending' ||
                              order.status === 'Unpaid'
                                ? '确认付款'
                                : '确认取货'}
                            </Button>
                          )}
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => openDeleteDialog(order.id)}>
                            删除
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定要删除这个订单吗？此操作无法撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            取消
          </Button>
          <Button onClick={handleDeleteOrder} color="error" autoFocus>
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default AdminDashboard
