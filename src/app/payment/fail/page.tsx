import Link from 'next/link'

export default function PaymentFailPage() {
  return (
    <main className="checkout-page">
      <div className="container">
        <div className="panel" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h1 className="page-title">Ошибка оплаты</h1>
          <p style={{ margin: '1.5rem 0' }}>
            К сожалению, произошла ошибка при обработке платежа.
          </p>
          <p style={{ margin: '1.5rem 0', color: 'var(--muted)' }}>
            Пожалуйста, попробуйте еще раз или свяжитесь с нами для помощи.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <Link href="/cart" className="cta">
              Вернуться в корзину
            </Link>
            <Link href="/" className="ghost-btn">
              На главную
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
