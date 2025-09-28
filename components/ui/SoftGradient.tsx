export function SoftGradient() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blush-50 to-blush-200" />
    </div>
  );
}