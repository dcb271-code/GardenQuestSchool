export default function ChildLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream text-bark font-body">
      {children}
    </div>
  );
}
