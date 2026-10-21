// Small shared pieces for the admin pages.
export function PageHeader({ title, children }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-display text-2xl font-bold text-navy-900">{title}</h1>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-md border border-navy-100 bg-white px-3 py-2 text-sm outline-none focus:border-navy-800";

export function Field({ label, hint, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-navy-900">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink/50">{hint}</span>}
    </label>
  );
}

export function PrimaryButton({ className = "", ...props }) {
  return (
    <button
      {...props}
      className={`rounded-md bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-60 ${className}`}
    />
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-navy-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-2xl leading-none text-ink/50 hover:text-ink">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatCard({ label, value, tone = "" }) {
  return (
    <div className="rounded-lg border border-navy-100 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold text-navy-900 ${tone}`}>{value}</p>
    </div>
  );
}
