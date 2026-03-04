"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface DaySchedule {
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

function buildDefaultSchedule(): DaySchedule[] {
  return DAY_NAMES.map((name, i) => ({
    dayOfWeek: i,
    dayName: name,
    isOpen: i !== 0,
    openTime: "09:00",
    closeTime: "19:00",
  }));
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    buildDefaultSchedule,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = useCallback(
    (type: "success" | "error", message: string) => {
      setToast({ type, message });
      setTimeout(() => setToast(null), 3000);
    },
    [],
  );

  useEffect(() => {
    fetch("/api/schedule")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: DaySchedule[]) => {
        if (Array.isArray(data) && data.length === 7) {
          setSchedule(
            data.map((d) => ({
              ...d,
              dayName: DAY_NAMES[d.dayOfWeek] ?? d.dayName,
            })),
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function updateDay(dayOfWeek: number, patch: Partial<DaySchedule>) {
    setSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d)),
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedule),
      });
      if (!res.ok) throw new Error();
      showToast("success", "Horarios guardados correctamente");
    } catch {
      showToast("error", "Error al guardar los horarios");
    } finally {
      setSaving(false);
    }
  }

  // Reorder so Monday (1) comes first
  const ordered = [...schedule].sort(
    (a, b) => ((a.dayOfWeek + 6) % 7) - ((b.dayOfWeek + 6) % 7),
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      <div
        className={`fixed right-6 top-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all duration-300 ${
          toast
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        } ${
          toast?.type === "success"
            ? "border border-green-500/30 bg-green-500/10 text-green-400"
            : "border border-red-500/30 bg-red-500/10 text-red-400"
        }`}
      >
        {toast?.type === "success" ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        {toast?.message}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Clock className="h-5 w-5 text-accent" />
          </div>
          <h1 className="text-2xl font-bold">Horarios de Atención</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar Horarios
        </button>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ordered.map((day) => (
          <div
            key={day.dayOfWeek}
            className={`rounded-xl border bg-card p-5 transition-colors ${
              day.isOpen ? "border-border" : "border-border/50"
            }`}
          >
            {/* Day name + toggle */}
            <div className="mb-4 flex items-center justify-between">
              <h3
                className={`text-lg font-semibold transition-colors ${
                  day.isOpen ? "text-foreground" : "text-muted"
                }`}
              >
                {day.dayName}
              </h3>
              <button
                type="button"
                role="switch"
                aria-checked={day.isOpen}
                onClick={() =>
                  updateDay(day.dayOfWeek, { isOpen: !day.isOpen })
                }
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  day.isOpen ? "bg-accent" : "bg-border"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    day.isOpen ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Status badge */}
            <div className="mb-4">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  day.isOpen
                    ? "bg-accent/10 text-accent"
                    : "bg-border text-muted"
                }`}
              >
                {day.isOpen ? "Abierto" : "Cerrado"}
              </span>
            </div>

            {/* Time inputs */}
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  Apertura
                </label>
                <input
                  type="time"
                  value={day.openTime}
                  disabled={!day.isOpen}
                  onChange={(e) =>
                    updateDay(day.dayOfWeek, { openTime: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-40"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">
                  Cierre
                </label>
                <input
                  type="time"
                  value={day.closeTime}
                  disabled={!day.isOpen}
                  onChange={(e) =>
                    updateDay(day.dayOfWeek, { closeTime: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-40"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
