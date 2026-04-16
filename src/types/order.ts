export interface Order {
  id: string
  status: OrderStatus
  createdAt: Date
  paidAt: Date | null
  failedAt: Date | null
  failureReason: string | null
  customer: CustomerInfo
  delivery: DeliveryInfo
  paymentMethod: string
  comment: string | null
  promoCode: string | null
  consentAccepted: boolean
  totals: OrderTotals
  payment: PaymentInfo | null
  items: OrderItem[]
}

export type OrderStatus =
  | 'awaiting_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface CustomerInfo {
  fullName: string
  phone: string
  email: string
}

export interface DeliveryInfo {
  shippingType: 'cdek_pvz' | 'omsk_courier'
  city: string
  address: string
}

export interface OrderTotals {
  subtotal: number
  shipping: number
  discount: number
  total: number
}

export interface PaymentInfo {
  outSum: number
  invId: string
  signatureValue: string
}

export interface OrderItem {
  id: number
  orderId: string
  productId: string
  name: string
  size: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface OrderCreateInput {
  customer: CustomerInfo
  delivery: DeliveryInfo
  paymentMethod: string
  comment?: string
  promoCode?: string
  consentAccepted: boolean
  items: Array<{
    productId: string
    name: string
    size: string
    quantity: number
    unitPrice: number
  }>
}
