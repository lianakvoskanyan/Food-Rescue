"use client";

import { useActionState } from "react";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type NotificationActionState,
} from "@/lib/notifications/actions";
import type { NotificationRecord } from "@/lib/sanity/types";

type NotificationsPageListProps = {
  items: NotificationRecord[];
};

const initialMarkState: NotificationActionState = {};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function NotificationsPageList({ items }: NotificationsPageListProps) {
  const [, markAction, markPending] = useActionState(
    markNotificationReadAction,
    initialMarkState,
  );

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-brand/10 bg-surface px-4 py-8 text-center text-sm text-muted">
        You have no notifications yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <form action={markAllNotificationsReadAction}>
        <button
          type="submit"
          className="text-sm font-medium text-brand underline-offset-2 hover:underline"
        >
          Mark all as read
        </button>
      </form>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item._id}
            className={`rounded-2xl border border-brand/10 bg-surface p-4 ${
              item.readAt ? "" : "border-brand/25 bg-brand/[0.04]"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-brand-dark">{item.title}</p>
                {item.body ? (
                  <p className="mt-1 text-sm text-muted">{item.body}</p>
                ) : null}
                <p className="mt-2 text-xs text-muted">{formatWhen(item.createdAt)}</p>
              </div>
              {!item.readAt && item.href ? (
                <form action={markAction} className="shrink-0">
                  <input type="hidden" name="notificationId" value={item._id} />
                  <input type="hidden" name="href" value={item.href} />
                  <button
                    type="submit"
                    disabled={markPending}
                    className="rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
                  >
                    Open
                  </button>
                </form>
              ) : null}
              {!item.readAt && !item.href ? (
                <form action={markAction} className="shrink-0">
                  <input type="hidden" name="notificationId" value={item._id} />
                  <button
                    type="submit"
                    disabled={markPending}
                    className="text-xs font-medium text-brand underline-offset-2 hover:underline disabled:opacity-60"
                  >
                    Mark read
                  </button>
                </form>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
