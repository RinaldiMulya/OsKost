/**
 * TypeScript Declaration: Midtrans Snap SDK
 *
 * Midtrans Snap SDK di-load via <script> tag dan menambahkan
 * object `snap` ke window global. Deklarasi ini memberikan
 * type safety untuk pemanggilan `window.snap.pay()`.
 */

interface MidtransSnapCallbacks {
  onSuccess?: (result: Record<string, unknown>) => void;
  onPending?: (result: Record<string, unknown>) => void;
  onError?: (result: Record<string, unknown>) => void;
  onClose?: () => void;
}

interface MidtransSnap {
  pay: (snapToken: string, callbacks?: MidtransSnapCallbacks) => void;
  hide: () => void;
}

declare global {
  interface Window {
    snap?: MidtransSnap;
  }
}

export {};
