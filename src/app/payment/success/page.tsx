import Link from 'next/link'

export default function PaymentSuccessPage() {
  return (
    <main className="checkout-page">
      <div className="container">
        <div className="panel" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h1 className="page-title">Оплата успешна!</h1>
          <p style={{ margin: '1.5rem 0' }}>
            Спасибо за ваш заказ! Мы получили оплату и начнем обработку заказа в ближайшее время.
          </p>
          <p style={{ margin: '1.5rem 0', color: 'var(--muted)' }}>
            Информация о заказе отправлена на указанный email.
          </p>
          <Link href="/" className="cta">
            Вернуться на главную
          </Link>
        </div>
      </div>
    </main>
  )
}
