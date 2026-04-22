export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between">
        <strong>GardenQuestSchool — Parent</strong>
        <a href="/picker" className="text-sm text-blue-600">← back to app</a>
      </nav>
      <div className="p-6 max-w-5xl mx-auto">{children}</div>
    </div>
  );
}
