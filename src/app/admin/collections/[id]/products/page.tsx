'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  sizes: string[]
  stock: Record<string, number>
  isNew: boolean
  order: number
}

interface Collection {
  id: string
  name: string
  slug: string
}

function SortableProduct({ product, onEdit, onDelete }: {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isValidUrl = (url: string) => {
    try {
      return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')
    } catch {
      return false
    }
  }

  const hasValidImage = product.images &&
                        product.images[0] &&
                        product.images[0].trim().length > 0 &&
                        isValidUrl(product.images[0])

  return (
    <div ref={setNodeRef} style={style} className="panel">
      {hasValidImage ? (
        <div style={{ marginBottom: '0.75rem', aspectRatio: '4/5', position: 'relative', overflow: 'hidden', cursor: 'grab' }} {...attributes} {...listeners}>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            style={{ objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      ) : (
        <div style={{ marginBottom: '0.75rem', aspectRatio: '4/5', background: 'var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '0.8rem', cursor: 'grab' }} {...attributes} {...listeners}>
          Нет изображения
        </div>
      )}
      <h3 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{product.name}</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
        {product.id}
      </p>
      <p style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>{product.price} ₽</p>
      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem' }}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(product)
          }}
          className="cta"
          style={{ flex: 1, padding: '0.4rem' }}
        >
          Изменить
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(product.id)
          }}
          className="ghost-btn"
          style={{ flex: 1, padding: '0.4rem', borderColor: 'red', color: 'red' }}
        >
          Удалить
        </button>
      </div>
    </div>
  )
}

export default function CollectionProductsPage() {
  const params = useParams()
  const router = useRouter()
  const collectionId = params.id as string

  const [collection, setCollection] = useState<Collection | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: 0,
    description: '',
    sizes: 'S,M,L,XL',
    stock: '{"S":5,"M":5,"L":5,"XL":5}',
    colors: '["BLACK"]',
    images: '',
    isNew: false,
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadData()
  }, [collectionId])

  const loadData = async () => {
    try {
      const [collRes, prodRes] = await Promise.all([
        fetch(`/api/admin/collections/${collectionId}`),
        fetch(`/api/admin/collections/${collectionId}/products`)
      ])

      if (collRes.ok) {
        const collData = await collRes.json()
        setCollection(collData.collection)
      }

      if (prodRes.ok) {
        const prodData = await prodRes.json()
        setProducts(prodData.products)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = products.findIndex((p) => p.id === active.id)
    const newIndex = products.findIndex((p) => p.id === over.id)

    const newProducts = arrayMove(products, oldIndex, newIndex)

    // Update order values
    const updatedProducts = newProducts.map((prod, index) => ({
      ...prod,
      order: index + 1,
    }))

    setProducts(updatedProducts)

    // Save new order to backend
    try {
      await Promise.all(
        updatedProducts.map((prod) =>
          fetch(`/api/admin/products/${prod.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: prod.name,
              price: prod.price,
              sizes: prod.sizes,
              stock: prod.stock,
              colors: ['BLACK'],
              images: prod.images,
              isNew: prod.isNew,
              collectionId,
              order: prod.order,
            }),
          })
        )
      )
    } catch (error) {
      console.error('Failed to update order:', error)
      loadData() // Reload on error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const sizes = formData.sizes.split(',').map(s => s.trim())
      const stock = JSON.parse(formData.stock)
      const colors = JSON.parse(formData.colors)
      const images = formData.images.split('\n').map(s => s.trim()).filter(Boolean)

      const payload = {
        id: formData.id,
        name: formData.name,
        price: formData.price,
        description: formData.description || null,
        sizes,
        stock,
        colors,
        images,
        isNew: formData.isNew,
        collectionId,
        order: products.length + 1,
      }

      const url = editingId
        ? `/api/admin/products/${editingId}`
        : '/api/admin/products'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        await loadData()
        setShowForm(false)
        setEditingId(null)
        setFormData({
          id: '',
          name: '',
          price: 0,
          description: '',
          sizes: 'S,M,L,XL',
          stock: '{"S":5,"M":5,"L":5,"XL":5}',
          colors: '["BLACK"]',
          images: '',
          isNew: false,
        })
      } else {
        const data = await res.json()
        alert(data.error || 'Ошибка сохранения')
      }
    } catch (error) {
      alert('Ошибка: ' + error)
    }
  }

  const handleEdit = (product: Product) => {
    setFormData({
      id: product.id,
      name: product.name,
      price: product.price,
      description: '',
      sizes: product.sizes.join(','),
      stock: JSON.stringify(product.stock),
      colors: '["BLACK"]',
      images: product.images.join('\n'),
      isNew: product.isNew,
    })
    setEditingId(product.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) return

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await loadData()
      } else {
        const data = await res.json()
        alert(data.error || 'Ошибка удаления')
      }
    } catch (error) {
      alert('Ошибка соединения')
    }
  }

  if (loading) return <main className="container"><p>Загрузка...</p></main>

  return (
    <main className="container" style={{ padding: '3rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">{collection?.name || 'Коллекция'}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Управление товарами в коллекции. Перетаскивайте для изменения порядка.
          </p>
        </div>
        <Link href="/admin/collections" className="ghost-btn">← К коллекциям</Link>
      </div>

      {products.length === 0 && !showForm && (
        <div className="panel" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Коллекция пуста</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Добавьте первый товар в коллекцию "{collection?.name}". Укажите ID, название, цену и изображения.
          </p>
          <button
            className="cta"
            style={{ fontSize: '1rem', padding: '1rem 2rem' }}
            onClick={() => {
              setShowForm(true)
              setFormData({
                id: '',
                name: '',
                price: 0,
                description: '',
                sizes: 'S,M,L,XL',
                stock: '{"S":5,"M":5,"L":5,"XL":5}',
                colors: '["BLACK"]',
                images: '',
                isNew: false,
              })
            }}
          >
            + Добавить первый товар
          </button>
        </div>
      )}

      {products.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <button
            className="cta"
            onClick={() => {
              setShowForm(!showForm)
              setEditingId(null)
              setFormData({
                id: '',
                name: '',
                price: 0,
                description: '',
                sizes: 'S,M,L,XL',
                stock: '{"S":5,"M":5,"L":5,"XL":5}',
                colors: '["BLACK"]',
                images: '',
                isNew: false,
              })
            }}
          >
            {showForm ? 'Отмена' : '+ Добавить товар'}
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="panel" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>
            {editingId ? 'Редактировать товар' : 'Новый товар'}
          </h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <label>
              <div style={{ marginBottom: '0.5rem', fontWeight: 500 }}>ID товара *</div>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="kb-001"
                required
                disabled={!!editingId}
              />
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                Уникальный идентификатор, например: kb-001, kb-002
              </div>
            </label>

            <label>
              <div style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Название *</div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="IN THE STREAM ZIP HOODIE in GREY"
                required
              />
            </label>

            <label>
              <div style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Цена (₽) *</div>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                placeholder="8990"
                required
              />
            </label>

            <label>
              <div style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Описание</div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Описание товара..."
              />
            </label>

            <label>
              <div style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Размеры *</div>
              <input
                type="text"
                value={formData.sizes}
                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                placeholder="S,M,L,XL"
                required
              />
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                Через запятую без пробелов
              </div>
            </label>

            <label>
              <div style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Остатки (JSON) *</div>
              <textarea
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                rows={2}
                placeholder='{"S":5,"M":10,"L":5,"XL":3}'
                required
                style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
              />
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                Количество для каждого размера в формате JSON
              </div>
            </label>

            <label>
              <div style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Цвета (JSON) *</div>
              <input
                type="text"
                value={formData.colors}
                onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                placeholder='["BLACK","WHITE"]'
                required
                style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
              />
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                Массив цветов в формате JSON
              </div>
            </label>

            <label>
              <div style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Изображения *</div>
              <textarea
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                rows={4}
                placeholder="/images/kb-001-1.png&#10;/images/kb-001-2.png"
                required
                style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
              />
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                Путь к каждому изображению на новой строке. Первое изображение — главное.
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isNew}
                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 500 }}>Отметить как новинку</span>
            </label>

            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--line)' }}>
              <button type="submit" className="cta" style={{ flex: 1 }}>
                {editingId ? 'Сохранить изменения' : 'Создать товар'}
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
                style={{ flex: 1 }}
              >
                Отмена
              </button>
            </div>
          </div>
        </form>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={products.map((p) => p.id)}
          strategy={rectSortingStrategy}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {products.map((product) => (
              <SortableProduct
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {products.length === 0 && (
        <p className="empty" style={{ gridColumn: '1 / -1' }}>
          Товаров в коллекции пока нет. Добавьте первый товар.
        </p>
      )}
    </main>
  )
}
