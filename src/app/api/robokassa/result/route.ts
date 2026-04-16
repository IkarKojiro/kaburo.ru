import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyResultSignature, getRobokassaConfig } from '@/lib/robokassa'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const outSum = parseFloat(formData.get('OutSum') as string)
    const invId = formData.get('InvId') as string
    const signatureValue = formData.get('SignatureValue') as string

    const config = getRobokassaConfig()

    // Проверка подписи
    if (!verifyResultSignature(outSum, invId, signatureValue, config.password2)) {
      console.error('Invalid signature for order:', invId)
      return new NextResponse('Invalid signature', { status: 400 })
    }

    // Обновление статуса заказа
    await prisma.order.update({
      where: { id: invId },
      data: {
        status: 'paid',
        paidAt: new Date(),
        payment: {
          outSum,
          invId,
          signatureValue,
        },
      },
    })

    console.log('Order paid successfully:', invId)
    return new NextResponse(`OK${invId}`, { status: 200 })
  } catch (error) {
    console.error('Robokassa result callback error:', error)
    return new NextResponse('Error', { status: 500 })
  }
}
