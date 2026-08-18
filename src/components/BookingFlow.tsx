"use client";

import { cloneElement, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { BookingData, EventType, GuestCount, ServiceType } from "@/types/booking";
import { emptyBooking } from "@/types/booking";
import { buildBookingWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

const EVENT_TYPES: EventType[] = ["חתונה", "אירוע עסקי", "אירוע פרטי", "פסטיבל / מועדון", "אחר"];
const GUEST_COUNTS: GuestCount[] = ["עד 100", "100-200", "200-400", "400+", "לא סגור עדיין"];
const SERVICE_TYPES: ServiceType[] = ["DJ", "DJ + סקסופון לייב", "סקסופון בלבד", "לא בטוחים / בואו נדבר"];

const TOTAL_STEPS = 7;

interface BookingFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingFlow({ isOpen, onClose }: BookingFlowProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<BookingData>(emptyBooking);
  const [submitted, setSubmitted] = useState(false);
  const [busyDates, setBusyDates] = useState<Record<string, "hold" | "booked">>({});
  const dialogRef = useRef<HTMLDivElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/availability")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { dates: Array<{ date: string; status: "hold" | "booked" }> } | null) => {
        if (!data) return;
        setBusyDates(Object.fromEntries(data.dates.map((d) => [d.date, d.status])));
      })
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setStep(1);
        setData(emptyBooking);
        setSubmitted(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  function goNext() {
    trackEvent("booking_step_completed", { step });
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
    else handleSubmit();
  }

  function goBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  function handleSubmit() {
    setSubmitted(true);
    trackEvent("booking_completed", { eventType: data.eventType, serviceType: data.serviceType });

    // Open WhatsApp synchronously within the click handler so popup blockers don't kill it.
    const url = buildBookingWhatsAppUrl(data);
    window.open(url, "_blank", "noopener,noreferrer");

    // Persist the lead in the background — doesn't block the WhatsApp handoff above.
    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, website: honeypotRef.current?.value ?? "" }),
    }).catch(() => {});
  }

  const canAdvance = (() => {
    switch (step) {
      case 1:
        return !!data.eventType;
      case 2:
        return true; // date optional — "לא סגור עדיין" is valid
      case 3:
        return data.city.trim().length > 0;
      case 4:
        return !!data.guestCount;
      case 5:
        return !!data.serviceType;
      case 6:
        return data.fullName.trim().length > 0 && data.phone.trim().length >= 9;
      case 7:
        return true;
      default:
        return false;
    }
  })();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            aria-label="סגירת חלון בדיקת זמינות"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-charcoal-line bg-ink-soft sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-charcoal-line px-6 py-4">
              <h2 id={titleId} className="font-display text-lg font-semibold text-paper">
                {submitted ? "קיבלנו" : "בדיקת זמינות לאירוע"}
              </h2>
              <button
                onClick={onClose}
                aria-label="סגור"
                className="flex h-9 w-9 items-center justify-center rounded-full text-paper-dim transition hover:bg-charcoal hover:text-paper"
              >
                ✕
              </button>
            </div>

            {!submitted && (
              <div className="flex gap-1.5 px-6 pt-4" aria-hidden="true">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i < step ? "bg-champagne" : "bg-charcoal-line"
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {submitted ? (
                <BookingSuccess onClose={onClose} />
              ) : (
                <StepContent step={step} data={data} setData={setData} busyDates={busyDates} />
              )}
              {/* Honeypot — hidden from real visitors, bots often fill every field */}
              <input
                ref={honeypotRef}
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
            </div>

            {!submitted && (
              <div className="flex items-center justify-between gap-3 border-t border-charcoal-line px-6 py-4">
                <button
                  onClick={goBack}
                  disabled={step === 1}
                  className="rounded-full px-4 py-2.5 text-sm text-paper-dim transition hover:text-paper disabled:opacity-0"
                >
                  חזרה
                </button>
                <span className="text-xs text-paper-dim">
                  שלב {step} מתוך {TOTAL_STEPS}
                </span>
                <button
                  onClick={goNext}
                  disabled={!canAdvance}
                  className="rounded-full bg-champagne px-6 py-2.5 text-sm font-semibold text-ink transition hover:bg-champagne-soft disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {step === TOTAL_STEPS ? "בדיקת זמינות" : "המשך"}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BookingSuccess({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <div className="text-5xl">🎷</div>
      <h3 className="font-display text-2xl font-bold text-paper">קיבלנו!</h3>
      <p className="max-w-xs text-paper-dim">
        הפרטים של האירוע בדרך לטל בוואטסאפ. אם החלון לא נפתח אוטומטית — פשוט תשלחו לו הודעה, ונחזור אליכם בהקדם.
      </p>
      <button
        onClick={onClose}
        className="mt-2 rounded-full border border-charcoal-line px-6 py-2.5 text-sm text-paper transition hover:border-champagne hover:text-champagne"
      >
        סגירה
      </button>
    </div>
  );
}

function ChoiceGrid<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: readonly T[];
  selected: T | null;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(opt)}
          aria-pressed={selected === opt}
          className={`rounded-2xl border px-4 py-3.5 text-right text-sm font-medium transition ${
            selected === opt
              ? "border-champagne bg-champagne/10 text-champagne"
              : "border-charcoal-line text-paper hover:border-paper-dim"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactElement<{ id?: string }>;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-paper-dim">
        {label}
      </label>
      {cloneElement(children, { id })}
    </div>
  );
}

function StepContent({
  step,
  data,
  setData,
  busyDates,
}: {
  step: number;
  data: BookingData;
  setData: React.Dispatch<React.SetStateAction<BookingData>>;
  busyDates: Record<string, "hold" | "booked">;
}) {
  const inputClass =
    "w-full rounded-xl border border-charcoal-line bg-ink px-4 py-3 text-paper placeholder:text-paper-dim/60 outline-none transition focus:border-champagne";

  switch (step) {
    case 1:
      return (
        <StepShell title="איזה סוג אירוע?">
          <ChoiceGrid
            options={EVENT_TYPES}
            selected={data.eventType}
            onSelect={(eventType) => setData((d) => ({ ...d, eventType }))}
          />
        </StepShell>
      );
    case 2: {
      const busyStatus = data.eventDate ? busyDates[data.eventDate] : undefined;
      return (
        <StepShell title="מתי האירוע?" subtitle="אם עוד לא סגור — אפשר להשאיר ריק ולהמשיך.">
          <input
            type="date"
            value={data.eventDate}
            onChange={(e) => setData((d) => ({ ...d, eventDate: e.target.value }))}
            className={inputClass}
            aria-label="תאריך האירוע"
          />
          {busyStatus && (
            <p className="rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-ember">
              {busyStatus === "booked"
                ? "התאריך הזה כבר סגור אצל טל — עדיין שווה לשלוח פנייה, לפעמים משהו משתחרר."
                : "יש כבר עניין בתאריך הזה — שלחו פנייה ונבדוק ביחד מה אפשרי."}
            </p>
          )}
        </StepShell>
      );
    }
    case 3:
      return (
        <StepShell title="איפה זה קורה?">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="שם המקום / האולם (לא חובה)"
              value={data.venue}
              onChange={(e) => setData((d) => ({ ...d, venue: e.target.value }))}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="עיר"
              value={data.city}
              onChange={(e) => setData((d) => ({ ...d, city: e.target.value }))}
              className={inputClass}
              aria-label="עיר"
              required
            />
          </div>
        </StepShell>
      );
    case 4:
      return (
        <StepShell title="כמות אורחים משוערת">
          <ChoiceGrid
            options={GUEST_COUNTS}
            selected={data.guestCount}
            onSelect={(guestCount) => setData((d) => ({ ...d, guestCount }))}
          />
        </StepShell>
      );
    case 5:
      return (
        <StepShell title="מה מחפשים?">
          <ChoiceGrid
            options={SERVICE_TYPES}
            selected={data.serviceType}
            onSelect={(serviceType) => setData((d) => ({ ...d, serviceType }))}
          />
        </StepShell>
      );
    case 6:
      return (
        <StepShell title="איך יוצרים איתכם קשר">
          <div className="flex flex-col gap-3">
            <Field label="שם מלא">
              <input
                type="text"
                value={data.fullName}
                onChange={(e) => setData((d) => ({ ...d, fullName: e.target.value }))}
                className={inputClass}
                required
              />
            </Field>
            <Field label="טלפון / וואטסאפ">
              <input
                type="tel"
                inputMode="tel"
                value={data.phone}
                onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
                className={inputClass}
                required
              />
            </Field>
            <Field label="אימייל (לא חובה)">
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
                className={inputClass}
              />
            </Field>
          </div>
        </StepShell>
      );
    case 7:
      return (
        <StepShell title="ספרו לנו קצת על האירוע" subtitle="לא חובה — אבל כל פרט עוזר.">
          <textarea
            value={data.message}
            onChange={(e) => setData((d) => ({ ...d, message: e.target.value }))}
            rows={5}
            className={inputClass}
            placeholder="וייב, שעות, במה מיוחד תרצו שנדע..."
          />
        </StepShell>
      );
    default:
      return null;
  }
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-display text-xl font-bold text-paper">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-paper-dim">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
