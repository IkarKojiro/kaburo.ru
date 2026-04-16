import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="product-card">
      <div className="product-media">
        <Image
          src={product.images[0]}
          alt={product.name}
          width={400}
          height={500}
        />
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt={product.name}
            width={400}
            height={500}
            className="product-media__hover"
          />
        )}
      </div>
      <div className="product-content simple">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">{product.price} ₽</p>
      </div>
    </Link>
  )
}
