import { type FormEvent, useState } from 'react'
import { Mail, Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // Email-бэкенда нет (ТЗ §14) — форма-заглушка
    setSent(true)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid gap-8 md:grid-cols-[280px_1fr]">

        {/* ── Инфо-панель ── */}
        <aside className="rounded-xl border bg-card shadow-sm overflow-hidden">
          {/* Телефон */}
          <div className="border-b p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-destructive text-white shrink-0">
                <Phone className="size-5" />
              </span>
              <h2 className="font-semibold">Call To Us</h2>
            </div>
            <p className="text-sm text-muted-foreground">We are available 24/7, 7 days a week.</p>
            <p className="text-sm font-medium">Phone: +992 00 000 00 00</p>
          </div>

          {/* Email */}
          <div className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-destructive text-white shrink-0">
                <Mail className="size-5" />
              </span>
              <h2 className="font-semibold">Write To Us</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Fill out our form and we will contact you within 24 hours.
            </p>
            <p className="text-sm font-medium">support@fastcart.tj</p>
            <p className="text-sm font-medium">info@fastcart.tj</p>
          </div>
        </aside>

        {/* ── Форма ── */}
        <div className="rounded-xl border bg-card shadow-sm p-6">
          {sent ? (
            <div className="flex flex-col items-center justify-center h-full min-h-64 gap-4 text-center">
              <span className="text-5xl">✅</span>
              <h2 className="text-xl font-semibold">Сообщение отправлено!</h2>
              <p className="text-muted-foreground text-sm max-w-xs">
                Мы получили ваш запрос и свяжемся с вами в течение 24 часов.
              </p>
              <Button variant="outline" onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }) }}>
                Отправить ещё
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name">Имя *</Label>
                  <Input
                    id="contact-name"
                    placeholder="Your Name"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email">Email *</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="Your Email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-phone">Телефон</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="Your Phone"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-message">Сообщение *</Label>
                <Textarea
                  id="contact-message"
                  placeholder="Your Message"
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="px-10">
                  Send Message
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
