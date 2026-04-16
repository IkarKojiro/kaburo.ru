import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const invId = searchParams.get('InvId')

  // Можно добавить дополнительную логику проверки
  redirect('/payment/success')
}
