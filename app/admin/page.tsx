"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  customer: { id: string; name: string; phone: string };
  barber: { id: string; name: string };
  service: { id: string; name: string; durationMin: number; price: string };
}

const statusConfig: Record<
  Appointment["status"],
  { label: string; color: string; bg: string }
> = {
  SCHEDULED: { label: "Pendiente", color: "text-[#3b82f6]", bg: "bg-[#3b82f6]/10" },
  COMPLETED: { label: "Completada", color: "text-[#22c55e]", bg: "bg-[#22c55e]/10" },
  CANCELLED: { label: "Cancelada", color: "text-[#ef4444]", bg: "bg-[#ef4444]/10" },
  NO_SHOW: { label: "No asistió", color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" },
};

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayDisplay = format(new Date(), "EEEE, d 'de' MMMM yyyy", {
    locale: es,
  });

  useEffect(() => {
    fetch(`/api/appointments?date=${today}`)
      .then((res) => res.json())
      .then((data) => setAppointments(Array.isArray(data) ? data : []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [today]);

  const stats = {
    total: appointments.length,
    completed: appointments.filter((a) => a.status === "COMPLETED").length,
    cancelled: appointments.filter((a) => a.status === "CANCELLED").length,
    pending: appointments.filter((a) => a.status === "SCHEDULED").length,
  };

  const statCards = [
    {
      label: "Total citas hoy",
      value: stats.total,
      icon: Calendar,
      accent: "#d4a853",
    },
    {
      label: "Completadas",
      value: stats.completed,
      icon: CheckCircle,
      accent: "#22c55e",
    },
    {
      label: "Canceladas",
      value: stats.cancelled,
      icon: XCircle,
      accent: "#ef4444",
    },
    {
      label: "Pendientes",
      value: stats.pending,
      icon: Clock,
      accent: "#3b82f6",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm capitalize text-muted">{todayDisplay}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">{card.label}</p>
              <card.icon
                className="h-5 w-5"
                style={{ color: card.accent }}
              />
            </div>
            <p className="mt-2 text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Citas de hoy</h2>
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-muted">
            <AlertTriangle className="mb-3 h-10 w-10 text-accent/50" />
            <p>No hay citas programadas para hoy</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-5 py-3 font-medium">Hora</th>
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Barbero</th>
                  <th className="px-5 py-3 font-medium">Servicio</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => {
                  const cfg = statusConfig[apt.status];
                  return (
                    <tr
                      key={apt.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="whitespace-nowrap px-5 py-3 font-medium">
                        {format(new Date(apt.startTime), "HH:mm")}
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium">{apt.customer.name}</div>
                        <a
                          href={`tel:${apt.customer.phone}`}
                          className="text-xs text-accent hover:underline"
                        >
                          {apt.customer.phone}
                        </a>
                      </td>
                      <td className="px-5 py-3">{apt.barber.name}</td>
                      <td className="px-5 py-3">{apt.service.name}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color} ${cfg.bg}`}
                        >
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
