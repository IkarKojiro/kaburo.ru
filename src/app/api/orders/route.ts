import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPaymentUrl, getRobokassaConfig } from '@/lib/robokassa'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Валидация
    if (!body.customer || !body.delivery || !body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 })
    }

    if (!body.consentAccepted) {
      return NextResponse.json(
        { error: 'Consent required' },
        { status: 400 }
      )
    }

    // Генерация ID заказа
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Расчет итогов
    const subtotal = body.items.reduce(
      (sum: number, item: any) => sum + item.unitPrice * item.quantity,
      0
    )
    const shipping = body.delivery.shippingType === 'cdek_pvz' ? 600 : 0
    const discount = 0
    const total = subtotal + shipping - discount

    // Создание заказа в БД
    await prisma.order.create({
      data: {
        id: orderId,
        status: 'awaiting_payment',
        customer: body.customer,
        delivery: body.delivery,
        paymentMethod: body.paymentMethod,
        comment: body.comment || null,
        promoCode: body.promoCode || null,
        consentAccepted: body.consentAccepted,
        totals: {
          subtotal,
          shipping,
          discount,
          total,
        },
        payment: undefined,
        items: {
          create: body.items.map((item: any) => ({
            productId: item.productId,
            name: item.name,
            size: item.size,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.unitPrice * item.quantity,
          })),
        },
      },
    })

    // Генерация URL оплаты Robokassa
    const config = getRobokassaConfig()
    const paymentUrl = getPaymentUrl(
      config,
      orderId,
      total,
      `Заказ ${orderId} в KABURO`
    )

    return NextResponse.json({
      orderId,
      status: 'awaiting_payment',
      totals: { subtotal, shipping, discount, total },
      paymentUrl,
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('id')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
