"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  markNotificationReadAction,
  type NotificationActionState,
} from "@/lib/notifications/actions";
import type { NotificationRecord } from "@/lib/sanity/types";

type NotificationBellProps = {
  unreadCount: number;
  recent: NotificationRecord[];
};

const initialMarkState: NotificationActionState = {};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function NotificationBell({ unreadCount, recent }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [, markAction, markPending] = useActionState(
    markNotificationReadAction,
    initialMarkState,
  );

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onPointerDown);
    }
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const badge =
    unreadCount > 0 ? (
      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-brand-dark">
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    ) : null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-brand/10 bg-background text-brand-dark hover:bg-brand/5"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          aria-hidden
        >
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
          <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
        </svg>
        {badge}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-brand/10 bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-brand/10 px-4 py-3">
            <p className="text-sm font-semibold text-brand-dark">Notifications</p>
            <Link
              href="/notifications"
              className="text-xs font-medium text-brand hover:underline"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted">No notifications yet.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {recent.map((item) => (
                <li
                  key={item._id}
                  className={`border-b border-brand/5 px-4 py-3 last:border-0 ${
                    item.readAt ? "opacity-80" : "bg-brand/[0.03]"
                  }`}
                >
                  {item.href ? (
                    <form action={markAction}>
                      <input type="hidden" name="notificationId" value={item._id} />
                      <input type="hidden" name="href" value={item.href} />
                      <button
                        type="submit"
                        disabled={markPending}
                        className="w-full text-left"
                      >
                        <NotificationRow item={item} />
                      </button>
                    </form>
                  ) : (
                    <NotificationRow item={item} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function NotificationRow({ item }: { item: NotificationRecord }) {
  return (
    <>
      <p className="text-sm font-medium text-brand-dark">{item.title}</p>
      {item.body ? (
        <p className="mt-0.5 line-clamp-2 text-xs text-muted">{item.body}</p>
      ) : null}
      <p className="mt-1 text-[11px] text-muted/80">{formatWhen(item.createdAt)}</p>
    </>
  );
}
