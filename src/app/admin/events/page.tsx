"use client";

import { ExternalLink, Pencil, Plus, Ticket, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, Drawer, EmptyState, Field, IconButton, ImageInput, Input, PageHeader, PageSkeleton, Textarea, Thumb, Toggle, useConfirm } from "@/components/admin/ui";
import { todayISO } from "@/components/admin/analytics";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import type { CafeEvent } from "@/lib/types";
import { fmtDate, money, slugify, timeAgo, to12h, uid } from "@/lib/utils";

export default function EventsPage() {
  const hydrated = useDB((s) => s.hydrated);
  const events = useDB((s) => s.events);
  const bookings = useDB((s) => s.eventBookings);
  const currency = useDB((s) => s.settings.site.currency);
  const upsert = useDB((s) => s.upsert);
  const remove = useDB((s) => s.remove);
  const [edit, setEdit] = useState<CafeEvent | null>(null);
  const [view, setView] = useState<CafeEvent | null>(null);
  const { confirm, node } = useConfirm();
  if (!hydrated) return <PageSkeleton />;

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const t = todayISO();

  return (
    <div>
      {node}
      <PageHeader
        title="Events"
        subtitle="Workshops, tastings and live music. Guests book seats from the website."
        actions={
          <Button
            variant="primary"
            onClick={() => setEdit({ id: uid("e-"), slug: "", title: "", date: t, time: "18:00", description: "", image: "", price: 0, seats: 20, booked: 0, category: "Workshop", published: true })}
          >
            <Plus className="size-4" /> New event
          </Button>
        }
      />
      {sorted.length === 0 ? (
        <Card>
          <EmptyState icon={<Ticket className="size-5" />} title="No events yet" />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((e) => {
            const pct = Math.min(100, (e.booked / Math.max(1, e.seats)) * 100);
            const count = bookings.filter((b) => b.eventId === e.id).length;
            return (
              <Card key={e.id} pad={false} className="overflow-hidden">
                <div className="relative">
                  <Thumb src={e.image} className="aspect-[16/9] w-full !rounded-none" />
                  <div className="absolute left-3 top-3 flex gap-1.5">
                    <Badge className="bg-white/90 backdrop-blur">{e.category}</Badge>
                    {!e.published && <Badge tone="orange" className="bg-white/90">Draft</Badge>}
                    {e.date < t && <Badge className="bg-white/90">Past</Badge>}
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-xs text-[var(--a-muted)]">
                    {fmtDate(e.date + "T00:00", { weekday: "short", day: "numeric", month: "short" })} · {to12h(e.time)} · {e.price ? money(e.price, currency) : "Free"}
                  </div>
                  <div className="mt-1 text-[17px] font-semibold tracking-tight">{e.title}</div>
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-[var(--a-muted)]">
                        {e.booked}/{e.seats} seats booked
                      </span>
                      <span className="font-medium">{Math.round(pct)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--a-line)]">
                      <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1">
                    <Button size="sm" onClick={() => setView(e)}>
                      <Users className="size-3.5" /> Bookings ({count})
                    </Button>
                    <div className="ml-auto flex">
                      <a href={`/events/${e.slug}`} target="_blank">
                        <IconButton aria-label="View">
                          <ExternalLink className="size-4" />
                        </IconButton>
                      </a>
                      <IconButton onClick={() => setEdit(e)} aria-label="Edit">
                        <Pencil className="size-4" />
                      </IconButton>
                      <IconButton
                        onClick={async () => {
                          if (await confirm("Delete event?", `“${e.title}” and its bookings list will be removed.`)) {
                            remove("events", e.id);
                            toast("Event deleted");
                          }
                        }}
                        aria-label="Delete"
                      >
                        <Trash2 className="size-4" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Drawer
        open={!!edit}
        onClose={() => setEdit(null)}
        title="Event"
        footer={
          <>
            <Button onClick={() => setEdit(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!edit?.title.trim()) return toast("Title is required", "error");
                upsert("events", { ...edit, slug: edit.slug || slugify(edit.title) });
                toast("Event saved");
                setEdit(null);
              }}
            >
              Save
            </Button>
          </>
        }
      >
        {edit && (
          <div className="space-y-4">
            <Field label="Title">
              <Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value, slug: events.some((x) => x.id === edit.id) ? edit.slug : slugify(e.target.value) })} />
            </Field>
            <Field label="Slug">
              <Input value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: slugify(e.target.value) })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <Input type="date" value={edit.date} onChange={(e) => setEdit({ ...edit, date: e.target.value })} />
              </Field>
              <Field label="Time">
                <Input type="time" value={edit.time} onChange={(e) => setEdit({ ...edit, time: e.target.value })} />
              </Field>
              <Field label={`Price (${currency})`} hint="0 = free">
                <Input type="number" value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} />
              </Field>
              <Field label="Category">
                <Input value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} />
              </Field>
              <Field label="Total seats">
                <Input type="number" value={edit.seats} onChange={(e) => setEdit({ ...edit, seats: Number(e.target.value) })} />
              </Field>
              <Field label="Booked">
                <Input type="number" value={edit.booked} onChange={(e) => setEdit({ ...edit, booked: Number(e.target.value) })} />
              </Field>
            </div>
            <Field label="Description">
              <Textarea value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} rows={4} />
            </Field>
            <ImageInput value={edit.image} onChange={(v) => setEdit({ ...edit, image: v })} aspect="aspect-[16/9]" />
            <Toggle checked={edit.published} onChange={(v) => setEdit({ ...edit, published: v })} label="Published" description="Drafts are hidden from the website" />
          </div>
        )}
      </Drawer>

      <Drawer open={!!view} onClose={() => setView(null)} title={view?.title}>
        {view && (
          <div>
            {bookings.filter((b) => b.eventId === view.id).length === 0 ? (
              <EmptyState icon={<Users className="size-5" />} title="No online bookings yet" text={`${view.booked} seats are marked as booked.`} />
            ) : (
              <div className="divide-y divide-[var(--a-line)]">
                {bookings
                  .filter((b) => b.eventId === view.id)
                  .map((b) => (
                    <div key={b.id} className="flex items-center justify-between py-3">
                      <div>
                        <div className="font-medium">{b.name}</div>
                        <div className="text-xs text-[var(--a-muted)]">
                          {b.email} · {b.phone}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge tone="accent">{b.seats} seats</Badge>
                        <div className="mt-1 text-[11px] text-[var(--a-muted)]">{timeAgo(b.createdAt)}</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
