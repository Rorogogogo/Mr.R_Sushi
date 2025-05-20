import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  useTheme,
  Paper,
  Chip,
} from '@mui/material'
import type { MenuItem } from '../types/menu'

interface CompanionSelectionDialogProps {
  open: boolean
  onClose: () => void
  onAddToCart: (companions: string[]) => void
  menuItem: MenuItem | null
}

// Available companions with their prices
const PANCAKE_COMPANIONS = [
  { id: 'seaweed', name: '加海苔', price: 3 },
  { id: 'meat_floss', name: '加肉松', price: 4 },
  { id: 'ham', name: '加火腿肉', price: 6 },
  { id: 'bacon', name: '加培根', price: 7 },
]

const CompanionSelectionDialog = ({
  open,
  onClose,
  onAddToCart,
  menuItem,
}: CompanionSelectionDialogProps) => {
  const theme = useTheme()
  const [selectedCompanions, setSelectedCompanions] = useState<string[]>([])

  // Calculate additional price
  const additionalPrice = selectedCompanions.reduce((total, companion) => {
    const comp = PANCAKE_COMPANIONS.find((c) => c.name === companion)
    return total + (comp ? comp.price : 0)
  }, 0)

  // Calculate total price
  const basePrice = menuItem ? parseFloat(menuItem.price.replace('元', '')) : 0
  const totalPrice = basePrice + additionalPrice

  const handleToggleCompanion = (companion: string) => {
    if (selectedCompanions.includes(companion)) {
      setSelectedCompanions(selectedCompanions.filter((c) => c !== companion))
    } else {
      setSelectedCompanions([...selectedCompanions, companion])
    }
  }

  const handleAddToCart = () => {
    onAddToCart(selectedCompanions)
    setSelectedCompanions([]) // Reset selections
  }

  const handleClose = () => {
    setSelectedCompanions([]) // Reset selections
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: 500,
        },
      }}>
      <DialogTitle
        sx={{
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.warning.light})`,
          color: 'white',
          py: 2,
        }}>
        {menuItem ? menuItem.name : '煎饼选项'}
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {menuItem && (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                {menuItem.description}
              </Typography>
              <Chip
                label={`基础价格: ${menuItem.price}`}
                sx={{
                  bgcolor: theme.palette.warning.light,
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              煎饼伴侣
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              您可以选择添加以下配料，每项需额外收费
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                }}>
                {PANCAKE_COMPANIONS.map((companion) => (
                  <Box key={companion.id} sx={{ width: 'calc(50% - 8px)' }}>
                    <Paper
                      elevation={
                        selectedCompanions.includes(companion.name) ? 3 : 1
                      }
                      sx={{
                        p: 2,
                        border: selectedCompanions.includes(companion.name)
                          ? `2px solid ${theme.palette.primary.main}`
                          : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        bgcolor: selectedCompanions.includes(companion.name)
                          ? 'rgba(255, 152, 0, 0.1)'
                          : 'background.paper',
                        '&:hover': {
                          bgcolor: 'rgba(255, 152, 0, 0.05)',
                        },
                      }}
                      onClick={() => handleToggleCompanion(companion.name)}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                        <Typography variant="body1">
                          {companion.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={`+${companion.price} 元`}
                          sx={{
                            bgcolor: selectedCompanions.includes(companion.name)
                              ? theme.palette.primary.main
                              : theme.palette.grey[200],
                            color: selectedCompanions.includes(companion.name)
                              ? 'white'
                              : 'text.primary',
                          }}
                        />
                      </Box>
                    </Paper>
                  </Box>
                ))}
              </Box>
            </Box>

            {selectedCompanions.length > 0 && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                }}>
                <Typography variant="subtitle2" gutterBottom>
                  已选择的伴侣:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedCompanions.map((companion) => (
                    <Chip
                      key={companion}
                      label={companion}
                      onDelete={() => handleToggleCompanion(companion)}
                      color="primary"
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: theme.palette.warning.light + '20',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Typography variant="subtitle1">总价:</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {totalPrice.toFixed(2)} 元
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit">
          取消
        </Button>
        <Button
          onClick={handleAddToCart}
          variant="contained"
          color="primary"
          sx={{ px: 3 }}>
          预定
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CompanionSelectionDialog
