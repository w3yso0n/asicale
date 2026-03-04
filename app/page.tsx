import { Scissors } from "lucide-react";
import BookingWizard from "./components/booking-wizard";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <header className="relative overflow-hidden border-b border-[#2a2a2a] bg-[#0f0f0f]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,168,83,0.08)_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-3xl px-6 py-16 text-center sm:py-24">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#d4a853]/30 bg-[#d4a853]/10">
            <Scissors className="h-8 w-8 text-[#d4a853]" />
          </div>
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Asicale <span className="text-[#d4a853]">Barber</span>
          </h1>
          <p className="text-lg text-[#a0a0a0]">
            Agenda tu cita en minutos
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <BookingWizard />
      </main>

      <footer className="border-t border-[#2a2a2a] py-8 text-center text-sm text-[#555]">
        &copy; {new Date().getFullYear()} Asicale Barber. Todos los derechos reservados.
      </footer>
    </div>
  );
}
