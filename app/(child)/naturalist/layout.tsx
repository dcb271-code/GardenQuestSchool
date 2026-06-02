export default function NaturalistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-cream text-bark">
      {children}
    </div>
  );
}
