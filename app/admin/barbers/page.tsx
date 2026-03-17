"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { Plus, Loader2, UserCheck, UserX, X, Pencil, Check } from "lucide-react";

interface Barber {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
}

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/barbers")
      .then((res) => res.json())
      .then((data) => setBarbers(Array.isArray(data) ? data : []))
      .catch(() => setBarbers([]))
      .finally(() => setLoading(false));
  }, []);

  async function createBarber(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/barbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        const barber = await res.json();
        setBarbers((prev) => [...prev, barber]);
        setNewName("");
        setShowForm(false);
      }
    } catch {
      /* silently fail */
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(barber: Barber) {
    setTogglingId(barber.id);
    try {
      const res = await fetch(`/api/barbers/${barber.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !barber.active }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBarbers((prev) =>
          prev.map((b) => (b.id === barber.id ? updated : b)),
        );
      }
    } catch {
      /* silently fail */
    } finally {
      setTogglingId(null);
    }
  }

  function startEdit(barber: Barber) {
    setEditingId(barber.id);
    setEditingName(barber.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
  }

  async function saveEdit(barber: Barber) {
    const name = editingName.trim();
    if (!name) return;
    setSavingId(barber.id);
    try {
      const res = await fetch(`/api/barbers/${barber.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBarbers((prev) => prev.map((b) => (b.id === barber.id ? updated : b)));
        cancelEdit();
      }
    } catch {
      /* silently fail */
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Barberos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-accent-hover"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancelar" : "Agregar Barbero"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={createBarber}
          className="flex gap-3 rounded-xl border border-border bg-card p-4"
        >
          <input
            type="text"
            placeholder="Nombre del barbero"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-white placeholder-muted outline-none focus:border-accent"
            autoFocus
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Guardar"
            )}
          </button>
        </form>
      )}

      {barbers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-muted">
          <p>No hay barberos registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  {editingId === barber.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-white outline-none focus:border-accent"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(barber)}
                        disabled={savingId === barber.id || !editingName.trim()}
                        title="Guardar"
                        className="inline-flex items-center justify-center rounded-lg border border-[#22c55e]/30 p-2 text-[#22c55e] transition-colors hover:bg-[#22c55e]/10 disabled:opacity-50"
                      >
                        {savingId === barber.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={savingId === barber.id}
                        title="Cancelar"
                        className="inline-flex items-center justify-center rounded-lg border border-border p-2 text-muted transition-colors hover:bg-white/5 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{barber.name}</h3>
                      <button
                        onClick={() => startEdit(barber)}
                        title="Editar nombre"
                        className="inline-flex items-center justify-center rounded-lg border border-border p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="mt-1 text-xs text-muted">
                    Desde{" "}
                    {format(new Date(barber.createdAt), "d 'de' MMM yyyy", {
                      locale: es,
                    })}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    barber.active
                      ? "bg-[#22c55e]/10 text-[#22c55e]"
                      : "bg-[#ef4444]/10 text-[#ef4444]"
                  }`}
                >
                  {barber.active ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => toggleActive(barber)}
                  disabled={togglingId === barber.id || savingId === barber.id}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                    barber.active
                      ? "border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10"
                      : "border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/10"
                  }`}
                >
                  {togglingId === barber.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : barber.active ? (
                    <UserX className="h-3.5 w-3.5" />
                  ) : (
                    <UserCheck className="h-3.5 w-3.5" />
                  )}
                  {barber.active ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
