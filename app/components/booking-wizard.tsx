"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Scissors,
  User,
  CalendarDays,
  UserCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Phone,
  Loader2,
  PartyPopper,
  AlertCircle,
} from "lucide-react";
import { format, addDays, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale/es";

interface Service {
  id: string;
  name: string;
  durationMin: number;
  price: string | number;
}

interface Barber {
  id: string;
  name: string;
  active: boolean;
}

interface Slot {
  time: string;
  available: boolean;
}

interface DaySummary {
  total: number;
  available: number;
}

const STEPS = [
  { label: "Servicio", icon: Scissors },
  { label: "Barbero", icon: User },
  { label: "Fecha y Hora", icon: CalendarDays },
  { label: "Tus Datos", icon: UserCircle },
  { label: "Confirmar", icon: CheckCircle2 },
];

function formatPrice(price: string | number): string {
  return `$${Number(price).toFixed(0)} MXN`;
}

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === currentStep;
          const isCompleted = i < currentStep;

          return (
            <div key={step.label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isActive
                      ? "border-[#d4a853] bg-[#d4a853]/15 text-[#d4a853] scale-110"
                      : isCompleted
                        ? "border-[#d4a853] bg-[#d4a853] text-[#0f0f0f]"
                        : "border-[#2a2a2a] bg-[#1a1a1a] text-[#a0a0a0]"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`hidden text-xs font-medium sm:block transition-colors duration-300 ${
                    isActive
                      ? "text-[#d4a853]"
                      : isCompleted
                        ? "text-white"
                        : "text-[#a0a0a0]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-[2px] flex-1 transition-colors duration-500 ${
                    i < currentStep ? "bg-[#d4a853]" : "bg-[#2a2a2a]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepServices({
  selected,
  onSelect,
}: {
  selected: Service | null;
  onSelect: (s: Service) => void;
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => setServices(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Cargando servicios..." />;

  if (services.length === 0) {
    return (
      <p className="text-center text-[#a0a0a0] py-12">
        No hay servicios disponibles en este momento.
      </p>
    );
  }

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-white">
        Selecciona un servicio
      </h2>
      <p className="mb-6 text-[#a0a0a0]">
        Elige el servicio que deseas reservar
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => {
          const isSelected = selected?.id === service.id;
          return (
            <button
              key={service.id}
              onClick={() => onSelect(service)}
              className={`group relative rounded-xl border p-5 text-left transition-all duration-200 hover:scale-[1.02] ${
                isSelected
                  ? "border-[#d4a853] bg-[#d4a853]/10 shadow-lg shadow-[#d4a853]/5"
                  : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#d4a853]/40"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="h-5 w-5 text-[#d4a853]" />
                </div>
              )}
              <h3 className="text-lg font-semibold text-white">
                {service.name}
              </h3>
              <div className="mt-3 flex items-center gap-4 text-sm text-[#a0a0a0]">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {service.durationMin} min
                </span>
                <span className="flex items-center gap-1 font-semibold text-[#d4a853]">
                  {formatPrice(service.price)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepBarbers({
  selected,
  onSelect,
}: {
  selected: Barber | null;
  onSelect: (b: Barber) => void;
}) {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/barbers?active=true")
      .then((r) => r.json())
      .then((data) => setBarbers(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Cargando barberos..." />;

  if (barbers.length === 0) {
    return (
      <p className="text-center text-[#a0a0a0] py-12">
        No hay barberos disponibles en este momento.
      </p>
    );
  }

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-white">
        Selecciona tu barbero
      </h2>
      <p className="mb-6 text-[#a0a0a0]">
        Elige al profesional de tu preferencia
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {barbers.map((barber) => {
          const isSelected = selected?.id === barber.id;
          return (
            <button
              key={barber.id}
              onClick={() => onSelect(barber)}
              className={`group relative flex flex-col items-center rounded-xl border p-6 transition-all duration-200 hover:scale-[1.02] ${
                isSelected
                  ? "border-[#d4a853] bg-[#d4a853]/10 shadow-lg shadow-[#d4a853]/5"
                  : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#d4a853]/40"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="h-5 w-5 text-[#d4a853]" />
                </div>
              )}
              <div
                className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 transition-colors ${
                  isSelected
                    ? "border-[#d4a853] bg-[#d4a853]/20"
                    : "border-[#2a2a2a] bg-[#0f0f0f] group-hover:border-[#d4a853]/40"
                }`}
              >
                <Scissors
                  className={`h-7 w-7 transition-colors ${
                    isSelected ? "text-[#d4a853]" : "text-[#a0a0a0] group-hover:text-white"
                  }`}
                />
              </div>
              <span className="text-lg font-semibold text-white">
                {barber.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getAvailabilityInfo(summary: DaySummary | undefined) {
  if (!summary) return { label: "", color: "", dot: "", disabled: false };

  if (summary.total === 0) {
    return {
      label: "Cerrado",
      color: "text-[#666]",
      dot: "bg-[#666]",
      ring: "border-[#333]",
      disabled: true,
    };
  }

  const ratio = summary.available / summary.total;

  if (summary.available === 0) {
    return {
      label: "Lleno",
      color: "text-[#ef4444]",
      dot: "bg-[#ef4444]",
      ring: "border-[#ef4444]/30",
      disabled: true,
    };
  }
  if (ratio <= 0.25) {
    return {
      label: "Últimos lugares",
      color: "text-[#f59e0b]",
      dot: "bg-[#f59e0b]",
      ring: "border-[#f59e0b]/40",
      disabled: false,
    };
  }
  if (ratio <= 0.5) {
    return {
      label: "Poca disponibilidad",
      color: "text-[#fb923c]",
      dot: "bg-[#fb923c]",
      ring: "border-[#fb923c]/30",
      disabled: false,
    };
  }
  return {
    label: "Disponible",
    color: "text-[#22c55e]",
    dot: "bg-[#22c55e]",
    ring: "border-[#22c55e]/30",
    disabled: false,
  };
}

function StepDateTime({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  barberId,
  serviceId,
}: {
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectDate: (d: Date) => void;
  onSelectTime: (t: string) => void;
  barberId: string;
  serviceId: string;
}) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [daySummaries, setDaySummaries] = useState<Record<string, DaySummary>>({});
  const [loadingSummary, setLoadingSummary] = useState(true);

  const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  useEffect(() => {
    setLoadingSummary(true);
    const fromDate = format(new Date(), "yyyy-MM-dd");
    fetch(
      `/api/appointments/summary?from=${fromDate}&days=14&barberId=${barberId}&serviceId=${serviceId}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (typeof data === "object" && !Array.isArray(data) && !data.error) {
          setDaySummaries(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSummary(false));
  }, [barberId, serviceId]);

  const fetchSlots = useCallback(
    (date: Date) => {
      setLoadingSlots(true);
      const dateStr = format(date, "yyyy-MM-dd");
      fetch(
        `/api/appointments/available?date=${dateStr}&barberId=${barberId}&serviceId=${serviceId}`
      )
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setSlots(data);
          else setSlots([]);
        })
        .catch(() => setSlots([]))
        .finally(() => setLoadingSlots(false));
    },
    [barberId, serviceId]
  );

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots]);

  function getDayLabel(d: Date): string {
    if (isToday(d)) return "Hoy";
    if (isTomorrow(d)) return "Mañana";
    return format(d, "EEE", { locale: es });
  }

  const availableSlots = slots.filter((s) => s.available);
  const occupiedSlots = slots.filter((s) => !s.available);

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-white">
        Selecciona fecha y hora
      </h2>
      <p className="mb-6 text-[#a0a0a0]">
        Elige el día y horario que prefieras
      </p>

      <div className="mb-6">
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-[#a0a0a0]">
          Fecha
        </h3>
        {loadingSummary ? (
          <LoadingSpinner text="Revisando disponibilidad..." />
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const summary = daySummaries[dateStr];
              const info = getAvailabilityInfo(summary);
              const isActive =
                selectedDate &&
                format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
              const isFull = info.disabled;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => {
                    if (!isFull) {
                      onSelectDate(day);
                      onSelectTime("");
                    }
                  }}
                  disabled={isFull}
                  className={`flex min-w-[80px] flex-col items-center rounded-xl border px-3 py-3 transition-all duration-200 ${
                    isFull
                      ? "cursor-not-allowed border-[#2a2a2a] bg-[#1a1a1a]/50 opacity-50"
                      : isActive
                        ? "border-[#d4a853] bg-[#d4a853]/15 text-[#d4a853] scale-105"
                        : "border-[#2a2a2a] bg-[#1a1a1a] text-[#a0a0a0] hover:border-[#d4a853]/40 hover:text-white hover:scale-105"
                  }`}
                >
                  <span className="text-[11px] font-medium uppercase">
                    {getDayLabel(day)}
                  </span>
                  <span className="text-xl font-bold">{format(day, "d")}</span>
                  <span className="text-[11px]">
                    {format(day, "MMM", { locale: es })}
                  </span>
                  {summary && (
                    <div className="mt-1.5 flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${info.dot}`} />
                      <span className={`text-[9px] font-medium leading-none ${info.color}`}>
                        {summary.total === 0
                          ? "Cerrado"
                          : summary.available === 0
                            ? "Lleno"
                            : summary.available <= 3
                              ? `${summary.available} disp.`
                              : ""}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedDate && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wider text-[#a0a0a0]">
              Horarios
            </h3>
            {!loadingSlots && slots.length > 0 && (
              <div className="flex items-center gap-4 text-[11px] text-[#a0a0a0]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                  Disponible ({availableSlots.length})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#ef4444]/60" />
                  Ocupado ({occupiedSlots.length})
                </span>
              </div>
            )}
          </div>
          {loadingSlots ? (
            <LoadingSpinner text="Buscando horarios..." />
          ) : slots.length === 0 ? (
            <p className="py-8 text-center text-[#a0a0a0]">
              No hay horarios para esta fecha.
            </p>
          ) : availableSlots.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <AlertCircle className="h-8 w-8 text-[#ef4444]/60" />
              <p className="text-center text-[#a0a0a0]">
                Todos los horarios están ocupados para esta fecha
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {slots.map((slot) => {
                const isActive = selectedTime === slot.time;
                const isOccupied = !slot.available;
                return (
                  <button
                    key={slot.time}
                    onClick={() => !isOccupied && onSelectTime(slot.time)}
                    disabled={isOccupied}
                    className={`relative rounded-lg border py-2.5 text-sm font-medium transition-all duration-200 ${
                      isOccupied
                        ? "cursor-not-allowed border-[#2a2a2a] bg-[#1a1a1a]/40 text-[#555] line-through decoration-[#ef4444]/40"
                        : isActive
                          ? "border-[#d4a853] bg-[#d4a853]/15 text-[#d4a853] scale-105"
                          : "border-[#2a2a2a] bg-[#1a1a1a] text-white hover:border-[#d4a853]/40 hover:scale-105"
                    }`}
                  >
                    {slot.time}
                    {isOccupied && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef4444]/20 text-[8px] text-[#ef4444]">
                        ✕
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepCustomerData({
  name,
  phone,
  onChangeName,
  onChangePhone,
}: {
  name: string;
  phone: string;
  onChangeName: (v: string) => void;
  onChangePhone: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-white">Tus datos</h2>
      <p className="mb-6 text-[#a0a0a0]">
        Ingresa tu información para la reserva
      </p>
      <div className="mx-auto max-w-md space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#a0a0a0]">
            Nombre completo
          </label>
          <div className="relative">
            <UserCircle className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a0a0a0]" />
            <input
              type="text"
              value={name}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] py-3 pl-11 pr-4 text-white placeholder-[#555] outline-none transition-colors focus:border-[#d4a853]"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[#a0a0a0]">
            Teléfono
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a0a0a0]" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => onChangePhone(e.target.value)}
              placeholder="Tu número de teléfono"
              className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] py-3 pl-11 pr-4 text-white placeholder-[#555] outline-none transition-colors focus:border-[#d4a853]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepConfirmation({
  service,
  barber,
  date,
  time,
  customerName,
}: {
  service: Service;
  barber: Barber;
  date: Date;
  time: string;
  customerName: string;
}) {
  const formattedDate = format(date, "EEEE d 'de' MMMM, yyyy", {
    locale: es,
  });

  const rows = [
    { label: "Servicio", value: service.name },
    { label: "Precio", value: formatPrice(service.price) },
    { label: "Duración", value: `${service.durationMin} min` },
    { label: "Barbero", value: barber.name },
    { label: "Fecha", value: formattedDate },
    { label: "Hora", value: time },
    { label: "Cliente", value: customerName },
  ];

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-white">
        Confirma tu reserva
      </h2>
      <p className="mb-6 text-[#a0a0a0]">
        Revisa los detalles antes de confirmar
      </p>
      <div className="mx-auto max-w-md rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] overflow-hidden">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-center justify-between px-5 py-3.5 ${
              i < rows.length - 1 ? "border-b border-[#2a2a2a]" : ""
            }`}
          >
            <span className="text-sm text-[#a0a0a0]">{row.label}</span>
            <span className="text-sm font-semibold text-white">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuccessScreen() {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#d4a853]/15">
        <PartyPopper className="h-10 w-10 text-[#d4a853]" />
      </div>
      <h2 className="mb-3 text-3xl font-bold text-white">
        ¡Reserva confirmada!
      </h2>
      <p className="mb-8 max-w-sm text-[#a0a0a0]">
        Tu cita ha sido agendada exitosamente. Te esperamos en la barbería.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-xl bg-[#d4a853] px-8 py-3 font-semibold text-[#0f0f0f] transition-all hover:bg-[#c49a48] hover:scale-105"
      >
        Agendar otra cita
      </button>
    </div>
  );
}

function LoadingSpinner({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#d4a853]" />
      <span className="text-sm text-[#a0a0a0]">{text}</span>
    </div>
  );
}

export default function BookingWizard() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const canNext = (() => {
    switch (step) {
      case 0:
        return !!selectedService;
      case 1:
        return !!selectedBarber;
      case 2:
        return !!selectedDate && !!selectedTime;
      case 3:
        return customerName.trim().length >= 2 && customerPhone.trim().length >= 7;
      case 4:
        return true;
      default:
        return false;
    }
  })();

  async function handleConfirm() {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime)
      return;

    setSubmitting(true);
    setError(null);

    try {
      const custRes = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerName.trim(),
          phone: customerPhone.trim(),
        }),
      });

      if (!custRes.ok) {
        const data = await custRes.json();
        throw new Error(data.error || "Error al registrar cliente");
      }

      const customer = await custRes.json();

      const [hours, minutes] = selectedTime.split(":").map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);

      const apptRes = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          barberId: selectedBarber.id,
          serviceId: selectedService.id,
          startTime: startTime.toISOString(),
        }),
      });

      if (!apptRes.ok) {
        const data = await apptRes.json();
        throw new Error(data.error || "Error al crear la cita");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 shadow-2xl sm:p-10">
        <SuccessScreen />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 shadow-2xl sm:p-10">
      <ProgressBar currentStep={step} />

      <div className="min-h-[340px]">
        {step === 0 && (
          <StepServices
            selected={selectedService}
            onSelect={setSelectedService}
          />
        )}
        {step === 1 && (
          <StepBarbers
            selected={selectedBarber}
            onSelect={setSelectedBarber}
          />
        )}
        {step === 2 && selectedService && selectedBarber && (
          <StepDateTime
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSelectDate={setSelectedDate}
            onSelectTime={(t) => setSelectedTime(t || null)}
            barberId={selectedBarber.id}
            serviceId={selectedService.id}
          />
        )}
        {step === 3 && (
          <StepCustomerData
            name={customerName}
            phone={customerPhone}
            onChangeName={setCustomerName}
            onChangePhone={setCustomerPhone}
          />
        )}
        {step === 4 &&
          selectedService &&
          selectedBarber &&
          selectedDate &&
          selectedTime && (
            <StepConfirmation
              service={selectedService}
              barber={selectedBarber}
              date={selectedDate}
              time={selectedTime}
              customerName={customerName}
            />
          )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
            step === 0
              ? "cursor-not-allowed text-[#555]"
              : "text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-white"
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          Atrás
        </button>

        {step < 4 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext}
            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
              canNext
                ? "bg-[#d4a853] text-[#0f0f0f] hover:bg-[#c49a48] hover:scale-105"
                : "cursor-not-allowed bg-[#2a2a2a] text-[#555]"
            }`}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-[#d4a853] px-6 py-2.5 text-sm font-semibold text-[#0f0f0f] transition-all hover:bg-[#c49a48] hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirmando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Confirmar Reserva
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
