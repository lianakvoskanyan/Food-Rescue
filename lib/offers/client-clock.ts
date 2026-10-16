"use client";

import { useSyncExternalStore } from "react";

/** Updated only when the clock subscription fires (required by useSyncExternalStore). */
let nowSnapshot = 0;

function subscribeToClock(onStoreChange: () => void) {
  nowSnapshot = Date.now();
  onStoreChange();
  const timer = window.setInterval(() => {
    nowSnapshot = Date.now();
    onStoreChange();
  }, 1000);
  return () => window.clearInterval(timer);
}

function getClientNowMs() {
  return nowSnapshot;
}

function getServerNowMs() {
  return 0;
}

export function useOfferNowMs(): number {
  return useSyncExternalStore(subscribeToClock, getClientNowMs, getServerNowMs);
}
