"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Loader2,
  X,
  Clock,
  DollarSign,
  Pencil,
  Trash2,
  Check,
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  durationMin: number;
  price: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", durationMin: "", price: "" });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", durationMin: "", price: "" });
  const [saving, setSaving] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  async function createService(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.durationMin || !form.price) return;
    setCreating(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          durationMin: Number(form.durationMin),
          price: Number(form.price),
        }),
      });
      if (res.ok) {
        const service = await res.json();
        setServices((prev) => [...prev, service]);
        setForm({ name: "", durationMin: "", price: "" });
        setShowForm(false);
      }
    } catch {
      /* ignore */
    } finally {
      setCreating(false);
    }
  }

  function startEdit(service: Service) {
    setEditingId(service.id);
    setEditForm({
      name: service.name,
      durationMin: String(service.durationMin),
      price: String(Number(service.price)),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ name: "", durationMin: "", price: "" });
  }

  async function saveEdit(id: string) {
    if (!editForm.name.trim() || !editForm.durationMin || !editForm.price) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          durationMin: Number(editForm.durationMin),
          price: Number(editForm.price),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
        cancelEdit();
      }
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  async function deleteService(id: string) {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== id));
        setConfirmDeleteId(null);
      } else if (res.status === 409) {
        const data = await res.json();
        setDeleteError(data.error ?? "Este servicio tiene citas programadas.");
      } else {
        setDeleteError("Error al eliminar el servicio.");
      }
    } catch {
      setDeleteError("Error de conexión.");
    } finally {
      setDeleting(false);
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent transition-colors";

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Servicios</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) setForm({ name: "", durationMin: "", price: "" });
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-accent/80"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancelar" : "Agregar Servicio"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={createService}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <input
              type="text"
              placeholder="Nombre del servicio"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClasses}
              autoFocus
            />
            <input
              type="number"
              placeholder="Duración (min)"
              min="1"
              value={form.durationMin}
              onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
              className={inputClasses}
            />
            <input
              type="number"
              placeholder="Precio (MXN)"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={inputClasses}
            />
            <button
              type="submit"
              disabled={creating || !form.name.trim() || !form.durationMin || !form.price}
              className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-accent/80 disabled:opacity-50"
            >
              {creating ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : (
                "Guardar"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Service grid / empty state */}
      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-muted">
          <p className="text-lg">No hay servicios registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const isEditing = editingId === service.id;
            const isConfirmingDelete = confirmDeleteId === service.id;

            return (
              <div
                key={service.id}
                className="rounded-xl border border-border bg-card p-5 transition-colors"
              >
                {isEditing ? (
                  /* ---- Edit mode ---- */
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className={inputClasses}
                      autoFocus
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        min="1"
                        value={editForm.durationMin}
                        onChange={(e) =>
                          setEditForm({ ...editForm, durationMin: e.target.value })
                        }
                        placeholder="Duración (min)"
                        className={inputClasses}
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm({ ...editForm, price: e.target.value })
                        }
                        placeholder="Precio (MXN)"
                        className={inputClasses}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => saveEdit(service.id)}
                        disabled={
                          saving ||
                          !editForm.name.trim() ||
                          !editForm.durationMin ||
                          !editForm.price
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-accent/80 disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Guardar
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ---- Display mode ---- */
                  <>
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-foreground">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(service)}
                          title="Editar"
                          className="rounded-md p-1.5 text-muted transition-colors hover:bg-background hover:text-accent"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setConfirmDeleteId(service.id);
                            setDeleteError(null);
                          }}
                          title="Eliminar"
                          className="rounded-md p-1.5 text-muted transition-colors hover:bg-background hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-sm text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-accent" />
                        {service.durationMin} min
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-accent" />
                        ${Number(service.price).toFixed(0)} MXN
                      </span>
                    </div>

                    {/* Delete confirmation */}
                    {isConfirmingDelete && (
                      <div className="mt-4 space-y-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                        <p className="text-sm text-red-300">
                          ¿Estás seguro de que deseas eliminar este servicio?
                        </p>
                        {deleteError && (
                          <p className="text-sm font-medium text-red-400">
                            {deleteError}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => deleteService(service.id)}
                            disabled={deleting}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                          >
                            {deleting ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Eliminar
                          </button>
                          <button
                            onClick={() => {
                              setConfirmDeleteId(null);
                              setDeleteError(null);
                            }}
                            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
