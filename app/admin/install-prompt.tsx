"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Download, X } from "lucide-react";

const DISMISS_KEY = "asicale-pwa-install-dismissed";

export function InstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<unknown>(null);
  const [dismissed, setDismissed] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  const isAdmin = pathname != null && pathname.startsWith("/admin");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;

    setIsStandalone(standalone);

    const stored = localStorage.getItem(DISMISS_KEY);
    if (stored) {
      const when = parseInt(stored, 10);
      if (Date.now() - when < 7 * 24 * 60 * 60 * 1000) setDismissed(true);
      else setDismissed(false);
    } else {
      setDismissed(false);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    const p = deferredPrompt as { prompt: () => Promise<void> };
    await p.prompt();
    setDeferredPrompt(null);
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  // Solo mostrar en rutas de admin; nunca en la página pública
  if (!isAdmin || isStandalone || dismissed) return null;

  const isIOS =
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-xl border border-border bg-card p-4 shadow-lg sm:left-auto sm:right-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
          <Download className="h-5 w-5 text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">
            {isAdmin ? "Añadir admin al inicio" : "Acceso rápido al admin"}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {isAdmin
              ? isIOS
                ? "Menú Compartir (↑) → Añadir a pantalla de inicio. El icono abrirá el admin."
                : "Menú del navegador (⋮) → Añadir a pantalla de inicio. Así el icono abrirá directamente el admin (no uses «Instalar aplicación»)."
              : isIOS
                ? "Menú Compartir (↑) → Añadir a pantalla de inicio"
                : "Instala la app para abrirla como aplicación"}
          </p>
          {!isAdmin && !isIOS && deferredPrompt != null ? (
            <button
              onClick={handleInstall}
              className="mt-3 w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-accent/90"
            >
              Instalar aplicación
            </button>
          ) : null}
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded p-1 text-muted transition-colors hover:bg-border hover:text-foreground"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
