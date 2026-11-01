"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Mail, Phone, Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Button, Card, Drawer, EmptyState, Field, Input, PageHeader, PageSkeleton, SearchInput, Segmented, Select, StatusPill, Textarea } from "@/components/admin/ui";
import { todayISO } from "@/components/admin/analytics";
import { toast } from "@/components/admin/toast";
import { useDB } from "@/store/db";
import type { Reservation, ReservationStatus } from "@/lib/types";
import { to12h } from "@/lib/utils";

const STATUSES: ReservationStatus[] = ["pending", "confirmed", "seated", "completed", "cancelled", "no-show"];
const AREAS: Reservation["area"][] = ["indoor", "garden", "bar", "private"];

type Draft = Omit<Reservation, "id" | "createdAt" | "status">;
const blank = (): Draft => ({ name: "", email: "", phone: "", date: todayISO(), time: "12:00", guests: 2, area: "indoor", occasion: "", notes: "" });

export default function ReservationsPage() {
  const hydrated = useDB((s) => s.hydrated);
  const reservations = useDB((s) => s.reservations);
  const upsert = useDB((s) => s.upsert);
  const addReservation = useDB((s) => s.addReservation);
  const [tab, setTab] = useState<"today" | "upcoming" | "past" | "all">("upcoming");
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [walkIn, setWalkIn] = useState(false);

  const groups = useMemo(() => {
    const t = todayISO();
    const s = q.trim().toLowerCase();
    const list = reservations
      .filter((r) => (tab === "today" ? r.date === t : tab === "upcoming" ? r.date >= t : tab === "past" ? r.date < t : true))
      .filter((r) => !s || r.name.toLowerCase().includes(s) || r.phone.includes(s) || r.email.toLowerCase().includes(s))
      .sort((a, b) => (tab === "past" ? -1 : 1) * (a.date + a.time).localeCompare(b.date + b.time));
    const m = new Map<string, Reservation[]>();
    list.forEach((r) => m.set(r.date, [...(m.get(r.date) ?? []), r]));
    return [...m.entries()];
  }, [reservations, tab, q]);

  if (!hydrated) return <PageSkeleton />;
  const t = todayISO();
  const todayList = reservations.filter((r) => r.date === t && !["cancelled", "no-show"].includes(r.status));

  const dayLabel = (d: string) => {
    const tomorrow = new Date(Date.now() + 86400000);
    const tm = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    if (d === t) return "Today";
    if (d === tm) return "Tomorrow";
    return new Date(d + "T00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  };

  return (
    <div>
      <PageHeader
        title="Reservations"
        subtitle={`Today: ${todayList.length} tables · ${todayList.reduce((a, b) => a + b.guests, 0)} guests`}
        actions={
          <>
            <Button onClick={() => { setWalkIn(true); setDraft({ ...blank(), time: new Date().toTimeString().slice(0, 5) }); }}>Walk-in</Button>
            <Button variant="primary" onClick={() => { setWalkIn(false); setDraft(blank()); }}>
              <Plus className="size-4" /> New booking
            </Button>
          </>
        }
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Segmented value={tab} onChange={setTab} options={[{ value: "today", label: "Today" }, { value: "upcoming", label: "Upcoming" }, { value: "past", label: "Past" }, { value: "all", label: "All" }]} />
        <SearchInput value={q} onChange={setQ} placeholder="Name, phone, email" className="sm:w-72" />
      </div>

      {groups.length === 0 ? (
        <Card>
          <EmptyState icon={<CalendarDays className="size-5" />} title="No reservations" text="Bookings from the website appear here." />
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map(([date, list]) => (
            <div key={date}>
              <div className="mb-2 flex items-baseline gap-2 px-1">
                <h2 className="text-[15px] font-semibold">{dayLabel(date)}</h2>
                <span className="text-xs text-[var(--a-muted)]">
                  {list.length} bookings · {list.reduce((a, b) => a + b.guests, 0)} guests
                </span>
              </div>
              <Card pad={false}>
                <div className="divide-y divide-[var(--a-line)]">
                  <AnimatePresence initial={false}>
                    {list.map((r) => (
                      <motion.div layout key={r.id} className="grid gap-3 px-5 py-4 md:grid-cols-[90px_1fr_auto] md:items-center">
                        <div className="flex items-center gap-2 md:block">
                          <div className="text-lg font-semibold tabular-nums">{to12h(r.time)}</div>
                          <div className="flex items-center gap-1 text-xs text-[var(--a-muted)]">
                            <Users className="size-3.5" /> {r.guests}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{r.name}</span>
                            <Badge className="capitalize">{r.area}</Badge>
                            {r.occasion && <Badge tone="purple">{r.occasion}</Badge>}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--a-muted)]">
                            <a href={`tel:${r.phone}`} className="flex items-center gap-1 hover:text-[var(--a-ink)]">
                              <Phone className="size-3" /> {r.phone}
                            </a>
                            <a href={`mailto:${r.email}`} className="flex items-center gap-1 hover:text-[var(--a-ink)]">
                              <Mail className="size-3" /> {r.email}
                            </a>
                          </div>
                          {r.notes && <p className="mt-1.5 text-xs text-[#8a5300]">“{r.notes}”</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            value={r.table ?? ""}
                            onChange={(e) => upsert("reservations", { ...r, table: e.target.value || undefined })}
                            placeholder="Table"
                            className="!w-20 !py-1.5 text-center"
                            aria-label="Table"
                          />
                          <div className="w-36">
                            <Select
                              value={r.status}
                              onChange={(e) => {
                                upsert("reservations", { ...r, status: e.target.value as ReservationStatus });
                                toast(`${r.name} → ${e.target.value}`);
                              }}
                              options={STATUSES.map((s) => ({ value: s, label: s.replace("-", " ") }))}
                              className="!py-1.5 capitalize"
                            />
                          </div>
                          <span className="hidden xl:inline">
                            <StatusPill status={r.status} />
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={!!draft}
        onClose={() => setDraft(null)}
        title={walkIn ? "Seat a walk-in" : "New reservation"}
        footer={
          <>
            <Button onClick={() => setDraft(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!draft?.name.trim()) return toast("Guest name is required", "error");
                const email = draft.email.trim() || `${draft.name.trim().toLowerCase().replace(/\s+/g, ".")}@walkin.local`;
                const r = addReservation({ ...draft, email, occasion: draft.occasion || undefined, notes: draft.notes || undefined });
                useDB.getState().upsert("reservations", { ...r, status: walkIn ? "seated" : "confirmed" });
                toast(walkIn ? "Walk-in seated" : "Reservation added");
                setDraft(null);
              }}
            >
              Save
            </Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <Field label="Guest name">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} autoFocus />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone">
                <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
              </Field>
              <Field label="Email">
                <Input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
              </Field>
              <Field label="Date">
                <Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
              </Field>
              <Field label="Time">
                <Input type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} />
              </Field>
              <Field label="Guests">
                <Input type="number" min={1} value={draft.guests} onChange={(e) => setDraft({ ...draft, guests: Number(e.target.value) })} />
              </Field>
              <Field label="Area">
                <Select value={draft.area} onChange={(e) => setDraft({ ...draft, area: e.target.value as Reservation["area"] })} options={AREAS.map((a) => ({ value: a, label: a[0].toUpperCase() + a.slice(1) }))} />
              </Field>
            </div>
            <Field label="Occasion">
              <Input value={draft.occasion ?? ""} onChange={(e) => setDraft({ ...draft, occasion: e.target.value })} placeholder="Birthday, anniversary…" />
            </Field>
            <Field label="Notes">
              <Textarea value={draft.notes ?? ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
            </Field>
          </div>
        )}
      </Drawer>
    </div>
  );
}
