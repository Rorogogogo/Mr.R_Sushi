import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  FormControl,
  FormHelperText,
  useTheme,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker'
import {
  format,
  addMinutes,
  setMinutes,
  setHours,
  isAfter,
  isBefore,
  startOfDay,
} from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { checkout } from '../services/orderService'
import { clearCart } from '../services/cartService'

interface CheckoutConfirmationDialogProps {
  open: boolean
  onClose: () => void
  totalAmount: number
  onSuccess: (orderNumber: string) => void
}

interface FormData {
  customerName: string
  phoneNumber: string
  reservationTime: Date | null
}

interface FormErrors {
  customerName?: string
  phoneNumber?: string
  reservationTime?: string
}

export default function CheckoutConfirmationDialog({
  open,
  onClose,
  totalAmount,
  onSuccess,
}: CheckoutConfirmationDialogProps) {
  const theme = useTheme()

  // Initial time is 10 minutes from now (using China timezone)
  const initialDate = addMinutes(new Date(), 10)
  // Round to nearest 10 minutes
  const roundedInitialDate = new Date(
    Math.ceil(initialDate.getTime() / (10 * 60 * 1000)) * (10 * 60 * 1000)
  )

  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    phoneNumber: '',
    reservationTime: roundedInitialDate,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        customerName: '',
        phoneNumber: '',
        reservationTime: roundedInitialDate,
      })
      setErrors({})
      setIsSubmitting(false)
      setShowPayment(false)
      setOrderNumber('')
    }
  }, [open])

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.customerName.trim()) {
      newErrors.customerName = '请输入姓名'
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = '请输入电话号码'
    } else if (!/^1[3-9]\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = '请输入有效的电话号码'
    }

    if (!formData.reservationTime) {
      newErrors.reservationTime = '请选择取餐时间'
    } else {
      const now = new Date()
      const minTime = addMinutes(now, 10)

      // Create limits for the day (7am to 11pm)
      const today = startOfDay(new Date())
      const openTime = setHours(setMinutes(today, 0), 7)
      const closeTime = setHours(setMinutes(today, 0), 23)

      // Create a new date with today's date and selected time
      const selectedTime = formData.reservationTime

      if (isBefore(selectedTime, minTime)) {
        newErrors.reservationTime = '取餐时间至少需要10分钟后'
      } else if (
        isBefore(selectedTime, openTime) ||
        isAfter(selectedTime, closeTime)
      ) {
        newErrors.reservationTime = '营业时间为早上7点至晚上11点'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleTimeChange = (newValue: Date | null) => {
    if (newValue) {
      // Set the time while keeping today's date (China timezone)
      const today = startOfDay(new Date())
      const newDate = new Date(today)
      newDate.setHours(newValue.getHours())
      newDate.setMinutes(newValue.getMinutes())

      // Round to nearest 10 minutes
      const roundedDate = new Date(
        Math.ceil(newDate.getTime() / (10 * 60 * 1000)) * (10 * 60 * 1000)
      )

      setFormData({
        ...formData,
        reservationTime: roundedDate,
      })
    } else {
      setFormData({
        ...formData,
        reservationTime: null,
      })
    }
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setIsSubmitting(true)

    try {
      // Ensure we use today's date with the selected time
      const reservationDate = formData.reservationTime!

      const result = await checkout({
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        reservationTime: reservationDate,
      })

      setOrderNumber(result.data.orderNumber)
      setShowPayment(true)

      // Clear the cart in session storage after successful checkout
      await clearCart()
    } catch (error) {
      console.error('Checkout error:', error)
      setErrors({
        ...errors,
        reservationTime: '下单失败，请重试',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFinish = () => {
    onSuccess(orderNumber)
    onClose()
  }

  // The minimum selectable time is 10 minutes from now
  const minTime = addMinutes(new Date(), 10)

  return (
    <Dialog
      open={open}
      onClose={!isSubmitting ? onClose : undefined}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[10],
        },
      }}>
      <DialogTitle
        sx={{
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          py: 2,
        }}>
        {showPayment ? '确认付款' : '确认预定信息'}
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {!showPayment ? (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              请填写预定信息
            </Typography>

            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                required
                label="姓名"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                error={!!errors.customerName}
                helperText={errors.customerName}
                disabled={isSubmitting}
              />

              <TextField
                fullWidth
                required
                label="电话号码"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                disabled={isSubmitting}
              />

              <Box>
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={zhCN}>
                  <MobileTimePicker
                    label="取餐时间"
                    value={formData.reservationTime}
                    onChange={handleTimeChange}
                    minTime={minTime}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !!errors.reservationTime,
                        helperText: errors.reservationTime,
                      },
                    }}
                    disabled={isSubmitting}
                    minutesStep={10}
                  />
                </LocalizationProvider>
                <FormHelperText>
                  请选择今天的取餐时间（10分钟为间隔），营业时间为早7点至晚11点
                </FormHelperText>
              </Box>
            </Stack>

            <Box sx={{ mt: 3 }}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: theme.palette.info.light + '20',
                  borderRadius: 1,
                }}>
                <Typography
                  variant="subtitle2"
                  color="primary.main"
                  gutterBottom>
                  预定总金额
                </Typography>
                <Typography variant="h5" color="primary.dark" fontWeight="bold">
                  {totalAmount.toFixed(2)} 元
                </Typography>
              </Paper>
            </Box>
          </Box>
        ) : (
          <Box sx={{ mt: 1 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="subtitle1">您的订单已下单成功!</Typography>
              <Typography variant="body2">
                订单号: <strong>{orderNumber}</strong>
              </Typography>
            </Alert>

            <Typography variant="subtitle1" gutterBottom>
              请使用微信扫描下方二维码完成支付
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              付款时请备注您的订单号: <strong>{orderNumber}</strong>
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                my: 3,
              }}>
              <img
                src="/qrcode/Wechat_pay.jpg"
                alt="WeChat Payment QR Code"
                style={{
                  width: '100%',
                  maxWidth: 250,
                  height: 'auto',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 4,
                }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              预计取餐时间:{' '}
              <strong>
                {formData.reservationTime
                  ? format(formData.reservationTime, 'HH:mm')
                  : '未指定'}
              </strong>
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {!showPayment ? (
          <>
            <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}>
              {isSubmitting ? '处理中...' : '确认'}
            </Button>
          </>
        ) : (
          <Button
            onClick={handleFinish}
            variant="contained"
            color="primary"
            fullWidth>
            完成
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
