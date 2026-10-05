export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-content items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-lg border border-navy-100 p-8">
        <h1 className="font-display text-xl font-bold text-navy-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink/60">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
