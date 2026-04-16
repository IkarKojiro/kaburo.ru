import Link from 'next/link'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-row">
        <div className="footer-links">
          <Link href="/offer">публичная оферта</Link>
          <Link href="/privacy">
            политика конфиденциальности и обработки персональных данных
          </Link>
        </div>
        <p className="footer-contact">контактные данные: kaburo-club@mail.ru</p>
        <p className="footer-copy">© 2026 KABURO STREETWEAR</p>
      </div>
    </footer>
  )
}
