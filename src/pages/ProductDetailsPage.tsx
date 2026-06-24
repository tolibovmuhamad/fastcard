import { useParams } from 'react-router'

export default function ProductDetailsPage() {
  const { productId } = useParams()

  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-bold">Карточка товара</h1>
      <p className="text-muted-foreground">
        Товар <code>#{productId}</code>. Галерея, варианты и «Buy Now» — Этап
        3.3.
      </p>
    </section>
  )
}
