import React from 'react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => {
        let icon = 'ℹ️';
        if (toast.type === 'success') icon = '✅';
        if (toast.type === 'error') icon = '❌';

        return (
          <div
            key={toast.id}
            className={`toast toast-${toast.type || 'info'}`}
            onClick={() => onDismiss && onDismiss(toast.id)}
          >
            <span>{icon}</span>
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
