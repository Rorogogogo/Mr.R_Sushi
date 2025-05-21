import { getSessionId } from './cartService'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5131/api'

interface CheckoutFormData {
  customerName: string
  phoneNumber: string
  reservationTime: Date
}

interface OrderResponse {
  success: boolean
  message: string
  data: {
    orderNumber: string
  }
}

// Send checkout request to create an order
export const checkout = async (
  formData: CheckoutFormData
): Promise<OrderResponse> => {
  const sessionId = getSessionId()

  try {
    // No need to send cart items, the server will use the sessionId to find them
    const response = await fetch(`${API_URL}/cart/${sessionId}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        reservationTime: formData.reservationTime.toISOString(),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.message || '结账失败，请重试')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Checkout error:', error)
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('结账失败，请重试')
    }
  }
}

// Get order status by order number
export const getOrderStatus = async (orderNumber: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/orders/status/${orderNumber}`)

    if (!response.ok) {
      throw new Error('获取订单状态失败')
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting order status:', error)
    throw error
  }
}

// Admin functions

// Get all orders
export const getAllOrders = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/order`)

    if (!response.ok) {
      throw new Error('获取订单失败')
    }

    const jsonResponse = await response.json()

    // Handle the new response format with ReferenceHandler.Preserve
    if (jsonResponse.data && jsonResponse.data.$values) {
      // Replace the data with the $values array
      jsonResponse.data = jsonResponse.data.$values
    }

    return jsonResponse
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
}

// Get today's orders
export const getTodayOrders = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/order/today`)

    if (!response.ok) {
      throw new Error('获取今日订单失败')
    }

    const jsonResponse = await response.json()

    // Handle the new response format with ReferenceHandler.Preserve
    if (jsonResponse.data && jsonResponse.data.$values) {
      // Replace the data with the $values array
      jsonResponse.data = jsonResponse.data.$values
    }

    return jsonResponse
  } catch (error) {
    console.error('Error fetching today orders:', error)
    throw error
  }
}

// Get orders by date
export const getOrdersByDate = async (date: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/order/bydate/${date}`)

    if (!response.ok) {
      throw new Error('获取指定日期订单失败')
    }

    const jsonResponse = await response.json()

    // Handle the new response format with ReferenceHandler.Preserve
    if (jsonResponse.data && jsonResponse.data.$values) {
      // Replace the data with the $values array
      jsonResponse.data = jsonResponse.data.$values
    }

    return jsonResponse
  } catch (error) {
    console.error('Error fetching orders by date:', error)
    throw error
  }
}

// Update order status
export const updateOrderStatus = async (
  orderId: number,
  status: string
): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/order/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(status),
    })

    if (!response.ok) {
      throw new Error('更新订单状态失败')
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
}

// Delete order
export const deleteOrder = async (orderId: number): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/order/${orderId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('删除订单失败')
    }

    return await response.json()
  } catch (error) {
    console.error('Error deleting order:', error)
    throw error
  }
}
