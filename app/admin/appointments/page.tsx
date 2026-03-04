"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import {
  Loader2,
  CalendarOff,
  CheckCircle,
  XCircle,
  EyeOff,
  RotateCcw,
  Filter,
  Phone,
  ChevronDown,
  ChevronUp,
  Save,
  Clock,
  Users,
} from "lucide-react";

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  notes: string | null;
  createdAt: string;
  customer: { id: string; name: string; phone: string };
  barber: { id: string; name: string };
  service: { id: string; name: string; durationMin: number; price: string };
}

interface Barber {
  id: string;
  name: string;
}

type Status = Appointment["status"];

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  SCHEDULED: { label: "Pendiente", color: "text-blue-400", bg: "bg-blue-400/10" },
  COMPLETED: { label: "Completada", color: "text-green-400", bg: "bg-green-400/10" },
  CANCELLED: { label: "Cancelada", color: "text-red-400", bg: "bg-red-400/10" },
  NO_SHOW: { label: "No asistió", color: "text-yellow-400", bg: "bg-yellow-400/10" },
};

const STATUS_ACTIONS: {
  status: Status;
  label: string;
  icon: typeof CheckCircle;
  activeColor: string;
  hoverBg: string;
}[] = [
  { status: "SCHEDULED", label: "Reactivar (Pendiente)", icon: RotateCcw, activeColor: "text-blue-400", hoverBg: "hover:bg-blue-400/10" },
  { status: "COMPLETED", label: "Marcar como Completada", icon: CheckCircle, activeColor: "text-green-400", hoverBg: "hover:bg-green-400/10" },
  { status: "CANCELLED", label: "Marcar como Cancelada", icon: XCircle, activeColor: "text-red-400", hoverBg: "hover:bg-red-400/10" },
  { status: "NO_SHOW", label: "Marcar como No asistió", icon: EyeOff, activeColor: "text-yellow-400", hoverBg: "hover:bg-yellow-400/10" },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(format(new Date(), "yyyy-MM-dd"));
  const [statusFilter, setStatusFilter] = useState("");
  const [barberFilter, setBarberFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/barbers")
      .then((r) => r.json())
      .then((data) => setBarbers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFilter) params.set("date", dateFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (barberFilter) params.set("barberId", barberFilter);
      const res = await fetch(`/api/appointments?${params}`);
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [dateFilter, statusFilter, barberFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  async function updateStatus(id: string, status: Status) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      }
    } catch {
      /* no-op */
    } finally {
      setUpdatingId(null);
    }
  }

  async function saveNotes(id: string) {
    setSavingNotes(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editingNotes[id] ?? "" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      }
    } catch {
      /* no-op */
    } finally {
      setSavingNotes(null);
    }
  }

  function toggleExpand(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      const apt = appointments.find((a) => a.id === id);
      if (apt && !(id in editingNotes)) {
        setEditingNotes((prev) => ({ ...prev, [id]: apt.notes ?? "" }));
      }
    }
  }

  const counts = appointments.reduce(
    (acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const formattedDate = dateFilter
    ? format(new Date(dateFilter + "T12:00:00"), "EEEE d 'de' MMMM, yyyy", { locale: es })
    : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Gestión de Citas</h1>
        {formattedDate && (
          <span className="text-sm capitalize text-muted">{formattedDate}</span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
        <Filter className="h-4 w-4 text-accent" />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none transition-colors focus:border-accent"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none transition-colors focus:border-accent"
        >
          <option value="">Todos los estados</option>
          <option value="SCHEDULED">Pendiente</option>
          <option value="COMPLETED">Completada</option>
          <option value="CANCELLED">Cancelada</option>
          <option value="NO_SHOW">No asistió</option>
        </select>
        <select
          value={barberFilter}
          onChange={(e) => setBarberFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none transition-colors focus:border-accent"
        >
          <option value="">Todos los barberos</option>
          {barbers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Summary bar */}
      {!loading && appointments.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card px-5 py-3 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <Users className="h-4 w-4 text-accent" />
            {appointments.length} cita{appointments.length !== 1 && "s"} encontrada{appointments.length !== 1 && "s"}
          </div>
          <div className="h-4 w-px bg-border" />
          {(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"] as Status[]).map((s) =>
            counts[s] ? (
              <span key={s} className={`${STATUS_CONFIG[s].color} flex items-center gap-1`}>
                <span className={`inline-block h-2 w-2 rounded-full ${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color}`} style={{ backgroundColor: "currentColor" }} />
                {counts[s]} {STATUS_CONFIG[s].label}
              </span>
            ) : null,
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="mt-3 text-sm text-muted">Cargando citas…</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-muted">
          <CalendarOff className="mb-3 h-10 w-10 text-accent/40" />
          <p className="text-lg font-medium">No se encontraron citas</p>
          <p className="mt-1 text-sm">Intenta cambiar los filtros o seleccionar otra fecha</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="w-8 px-3 py-3" />
                <th className="px-5 py-3 font-medium">Hora</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Barbero</th>
                <th className="px-5 py-3 font-medium">Servicio</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => {
                const cfg = STATUS_CONFIG[apt.status];
                const isExpanded = expandedId === apt.id;

                return (
                  <AppointmentRow
                    key={apt.id}
                    apt={apt}
                    cfg={cfg}
                    isExpanded={isExpanded}
                    updatingId={updatingId}
                    savingNotes={savingNotes}
                    editingNotes={editingNotes}
                    onToggleExpand={toggleExpand}
                    onUpdateStatus={updateStatus}
                    onNotesChange={(id, val) =>
                      setEditingNotes((prev) => ({ ...prev, [id]: val }))
                    }
                    onSaveNotes={saveNotes}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AppointmentRow({
  apt,
  cfg,
  isExpanded,
  updatingId,
  savingNotes,
  editingNotes,
  onToggleExpand,
  onUpdateStatus,
  onNotesChange,
  onSaveNotes,
}: {
  apt: Appointment;
  cfg: { label: string; color: string; bg: string };
  isExpanded: boolean;
  updatingId: string | null;
  savingNotes: string | null;
  editingNotes: Record<string, string>;
  onToggleExpand: (id: string) => void;
  onUpdateStatus: (id: string, status: Status) => void;
  onNotesChange: (id: string, val: string) => void;
  onSaveNotes: (id: string) => void;
}) {
  return (
    <>
      <tr
        className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-white/2"
        onClick={() => onToggleExpand(apt.id)}
      >
        <td className="px-3 py-3 text-muted">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </td>
        <td className="whitespace-nowrap px-5 py-3">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="h-3.5 w-3.5 text-muted" />
            {format(new Date(apt.startTime), "HH:mm")} – {format(new Date(apt.endTime), "HH:mm")}
          </div>
        </td>
        <td className="px-5 py-3">
          <div className="font-medium">{apt.customer.name}</div>
          <a
            href={`tel:${apt.customer.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-accent"
          >
            <Phone className="h-3 w-3" />
            {apt.customer.phone}
          </a>
        </td>
        <td className="px-5 py-3">{apt.barber.name}</td>
        <td className="px-5 py-3">
          <div>{apt.service.name}</div>
          <div className="text-xs text-muted">
            {apt.service.durationMin} min · ${Number(apt.service.price).toFixed(0)} MXN
          </div>
        </td>
        <td className="px-5 py-3">
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.color} ${cfg.bg}`}>
            {cfg.label}
          </span>
        </td>
        <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-1">
            {STATUS_ACTIONS.map((action) => {
              const isCurrent = apt.status === action.status;
              const isUpdating = updatingId === apt.id;
              return (
                <button
                  key={action.status}
                  onClick={() => onUpdateStatus(apt.id, action.status)}
                  disabled={isCurrent || isUpdating}
                  title={isCurrent ? `Ya es: ${STATUS_CONFIG[action.status].label}` : action.label}
                  className={`rounded-lg p-1.5 transition-colors ${
                    isCurrent
                      ? "cursor-not-allowed opacity-25"
                      : `${action.activeColor} ${action.hoverBg} opacity-70 hover:opacity-100`
                  } disabled:pointer-events-none`}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <action.icon className="h-4 w-4" />
                  )}
                </button>
              );
            })}
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="border-b border-border last:border-0">
          <td colSpan={7} className="bg-background/50 px-5 py-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Información del cliente
                </h4>
                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="font-medium">{apt.customer.name}</p>
                  <a
                    href={`tel:${apt.customer.phone}`}
                    className="mt-1 inline-flex items-center gap-1.5 text-sm text-accent transition-colors hover:text-accent-hover"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {apt.customer.phone}
                  </a>
                </div>
              </div>

              <div className="space-y-2 sm:col-span-1 lg:col-span-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Notas
                </h4>
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editingNotes[apt.id] ?? apt.notes ?? ""}
                    onChange={(e) => onNotesChange(apt.id, e.target.value)}
                    placeholder="Agregar notas sobre esta cita…"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-white placeholder:text-muted/50 outline-none transition-colors focus:border-accent"
                  />
                  <button
                    onClick={() => onSaveNotes(apt.id)}
                    disabled={savingNotes === apt.id}
                    className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
                  >
                    {savingNotes === apt.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Guardar notas
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Detalles
                </h4>
                <div className="rounded-lg border border-border bg-card p-3 text-sm">
                  <p className="text-muted">
                    Creada:{" "}
                    <span className="text-white">
                      {format(new Date(apt.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
                    </span>
                  </p>
                  <p className="mt-1 text-muted">
                    ID: <span className="font-mono text-xs text-white/60">{apt.id}</span>
                  </p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
