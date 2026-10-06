import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ toasts = [] }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          {toast.type === 'error' ? (
            <AlertCircle size={18} color="#ff4d4d" />
          ) : (
            <CheckCircle2 size={18} color="var(--accent-primary)" />
          )}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
