"use client";

import { useEffect } from "react";
import { useOfferNowMs } from "@/lib/offers/client-clock";
import {
  formatCountdownRemaining,
  getReservationDeadlineMs,
  type OfferTimingFields,
} from "@/lib/offers/lifecycle";

type OfferReservationCountdownProps = {
  offer: OfferTimingFields;
  compact?: boolean;
  onReservationClosed?: () => void;
};

export function OfferReservationCountdown({
  offer,
  compact = false,
  onReservationClosed,
}: OfferReservationCountdownProps) {
  const deadlineMs = getReservationDeadlineMs(offer);
  const nowMs = useOfferNowMs();

  useEffect(() => {
    if (deadlineMs === null || nowMs === 0) {
      return;
    }
    if (deadlineMs <= nowMs) {
      onReservationClosed?.();
    }
  }, [deadlineMs, nowMs, onReservationClosed]);

  if (deadlineMs === null) {
    return null;
  }

  const closed = nowMs !== 0 && deadlineMs <= nowMs;

  if (closed) {
    if (compact) {
      return (
        <p className="text-xs font-medium text-muted">Reservation closed</p>
      );
    }
    return (
      <p className="text-sm font-medium text-muted" role="status">
        Reservation closed
      </p>
    );
  }

  const label = compact ? "Book within" : "Time left to book";
  const timeText =
    nowMs === 0 ? "--:--:--" : formatCountdownRemaining(deadlineMs, nowMs);

  return (
    <p
      className={
        compact
          ? "text-xs font-medium text-brand-dark"
          : "text-sm font-medium text-brand-dark"
      }
      role="timer"
      aria-live="off"
    >
      <span className="text-muted">{label}: </span>
      <span className="font-mono tabular-nums tracking-tight" suppressHydrationWarning>
        {timeText}
      </span>
    </p>
  );
}
