import { useState } from 'react'

import { useOrderStore } from '@/store/orderStore'
import type { Order } from '@/types/cart'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Ожидает',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

const STATUS_VARIANTS: Record<Order['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  processing: 'secondary',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive',
}

const ALL_STATUSES: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrdersPage() {
  const orders = useOrderStore((s) => s.orders)
  const [selected, setSelected] = useState<Order | null>(null)
  const [statuses, setStatuses] = useState<Record<string, Order['status']>>({})

  function getStatus(order: Order): Order['status'] {
    return statuses[order.id] ?? order.status
  }

  function setStatus(orderId: string, status: Order['status']) {
    setStatuses((prev) => ({ ...prev, [orderId]: status }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Заказы</h1>
        <p className="text-sm text-muted-foreground">Данные из локального хранилища (API заказов нет)</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border py-20 text-center text-muted-foreground">
          <p className="text-4xl mb-3">📦</p>
          <p>Заказов пока нет</p>
          <p className="text-sm mt-1">Они появятся после оформления в витрине</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>№ заказа</TableHead>
                <TableHead>Покупатель</TableHead>
                <TableHead>Товаров</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Оплата</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {order.billing.firstName} {order.billing.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">{order.billing.email}</div>
                  </TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell className="font-medium">${order.total.toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">
                    {order.paymentMethod}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={getStatus(order)}
                      onValueChange={(v) => setStatus(order.id, v as Order['status'])}
                    >
                      <SelectTrigger className="h-8 w-36 text-xs">
                        <Badge variant={STATUS_VARIANTS[getStatus(order)]} className="text-xs">
                          {STATUS_LABELS[getStatus(order)]}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="text-sm">
                            {STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setSelected(order)}>
                      Детали
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order details dialog */}
      <Dialog open={selected !== null} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Заказ {selected.id}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium mb-1">Покупатель</p>
                <p>{selected.billing.firstName} {selected.billing.lastName}</p>
                <p className="text-muted-foreground">{selected.billing.email}</p>
                <p className="text-muted-foreground">{selected.billing.phone}</p>
              </div>

              <div>
                <p className="font-medium mb-1">Адрес доставки</p>
                <p className="text-muted-foreground">
                  {selected.billing.streetAddress}
                  {selected.billing.apartment ? `, кв. ${selected.billing.apartment}` : ''}
                  , {selected.billing.city}
                </p>
              </div>

              <div>
                <p className="font-medium mb-2">Товары</p>
                <div className="space-y-2">
                  {selected.items.map((item, i) => {
                    const price =
                      item.product.hasDiscount && item.product.discountPrice != null
                        ? item.product.discountPrice
                        : item.product.price
                    return (
                      <div key={i} className="flex items-center gap-3">
                        {item.product.images[0] && (
                          <img
                            src={item.product.images[0]}
                            alt=""
                            className="h-10 w-10 rounded object-cover bg-muted shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{item.product.productName}</p>
                          <p className="text-muted-foreground text-xs">
                            {item.quantity} × ${price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium shrink-0">
                          ${(price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Товары</span>
                  <span>${selected.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Доставка</span>
                  <span>{selected.shipping === 0 ? 'Бесплатно' : `$${selected.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-base">
                  <span>Итого</span>
                  <span>${selected.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Способ оплаты</span>
                <span className="capitalize">{selected.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Дата</span>
                <span>{new Date(selected.createdAt).toLocaleString('ru-RU')}</span>
              </div>
              <div className="flex justify-between">
                <span>Статус</span>
                <Badge variant={STATUS_VARIANTS[getStatus(selected)]}>
                  {STATUS_LABELS[getStatus(selected)]}
                </Badge>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
