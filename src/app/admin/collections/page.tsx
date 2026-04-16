'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  order: number
  _count: {
    products: number
  }
}

function SortableCollection({ collection, onEdit, onDelete }: {
  collection: Collection
  onEdit: (collection: Collection) => void
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: collection.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="panel"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <button
              {...attributes}
              {...listeners}
              style={{
                cursor: 'grab',
                border: 'none',
                background: 'transparent',
                fontSize: '1.2rem',
                padding: '0.25rem',
                lineHeight: 1,
              }}
              title="Перетащите для изменения порядка"
            >
              ⋮⋮
            </button>
            <h3 style={{ margin: 0 }}>{collection.name}</h3>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.5rem', marginLeft: '2.5rem' }}>
            /{collection.slug}
          </p>
          {collection.description && (
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', marginLeft: '2.5rem' }}>
              {collection.description}
            </p>
          )}
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginLeft: '2.5rem' }}>
            Товаров: {collection._count.products} | Порядок: {collection.order}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link
            href={`/admin/collections/${collection.id}/products`}
            className="cta"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            Товары
          </Link>
          <button
            onClick={() => onEdit(collection)}
            className="ghost-btn"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            Изменить
          </button>
          <button
            onClick={() => onDelete(collection.id)}
            className="ghost-btn"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', borderColor: 'red', color: 'red' }}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    order: 0,
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = async () => {
    try {
      const res = await fetch('/api/admin/collections')
      if (res.ok) {
        const data = await res.json()
        setCollections(data.collections)
      }
    } catch (error) {
      console.error('Failed to load collections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = collections.findIndex((c) => c.id === active.id)
    const newIndex = collections.findIndex((c) => c.id === over.id)

    const newCollections = arrayMove(collections, oldIndex, newIndex)

    // Update order values
    const updatedCollections = newCollections.map((col, index) => ({
      ...col,
      order: index + 1,
    }))

    setCollections(updatedCollections)

    // Save new order to backend
    try {
      await Promise.all(
        updatedCollections.map((col: any) =>
          fetch(`/api/admin/collections/${col.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: col.name,
              slug: col.slug,
              description: col.description,
              order: col.order,
            }),
          })
        )
      )
    } catch (error) {
      console.error('Failed to update order:', error)
      loadCollections() // Reload on error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editingId
      ? `/api/admin/collections/${editingId}`
      : '/api/admin/collections'
    const method = editingId ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        await loadCollections()
        setShowForm(false)
        setEditingId(null)
        setFormData({ name: '', slug: '', description: '', order: 0 })
      } else {
        const data = await res.json()
        alert(data.error || 'Ошибка сохранения')
      }
    } catch (error) {
      alert('Ошибка соединения')
    }
  }

  const handleEdit = (collection: Collection) => {
    setFormData({
      name: collection.name,
      slug: collection.slug,
      description: collection.description || '',
      order: collection.order,
    })
    setEditingId(collection.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить коллекцию? Товары останутся без коллекции.')) return

    try {
      const res = await fetch(`/api/admin/collections/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await loadCollections()
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
          <h1 className="page-title">Управление товарами</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Создавайте коллекции и добавляйте в них товары. Перетаскивайте для изменения порядка.
          </p>
        </div>
        <Link href="/admin" className="ghost-btn">← Назад</Link>
      </div>

      {collections.length === 0 && !showForm && (
        <div className="panel" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Добро пожаловать!</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Начните с создания первой коллекции. Коллекция — это группа товаров, например "DROP #001" или "Весна 2026".
          </p>
          <button
            className="cta"
            style={{ fontSize: '1rem', padding: '1rem 2rem' }}
            onClick={() => {
              setShowForm(true)
              setFormData({ name: 'DROP #001', slug: 'drop-001', description: 'Первая коллекция', order: 1 })
            }}
          >
            + Создать первую коллекцию
          </button>
        </div>
      )}

      {collections.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <button
            className="cta"
            onClick={() => {
              setShowForm(!showForm)
              setEditingId(null)
              setFormData({ name: '', slug: '', description: '', order: collections.length + 1 })
            }}
          >
            {showForm ? 'Отмена' : '+ Добавить коллекцию'}
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="panel" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>
            {editingId ? 'Редактировать коллекцию' : 'Новая коллекция'}
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <label>
              Название
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </label>
            <label>
              Slug (URL)
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="drop-001"
                required
              />
            </label>
            <label>
              Описание
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </label>
            <button type="submit" className="cta">
              {editingId ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={collections.map((c: any) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ display: 'grid', gap: '1rem' }}>
            {collections.map((collection: any) => (
              <SortableCollection
                key={collection.id}
                collection={collection}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {collections.length === 0 && (
        <p className="empty">Коллекций пока нет. Создайте первую коллекцию.</p>
      )}
    </main>
  )
}
