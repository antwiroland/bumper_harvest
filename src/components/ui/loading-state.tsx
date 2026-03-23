type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Loading..." }: LoadingStateProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}
