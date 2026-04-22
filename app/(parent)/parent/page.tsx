import AuthGate from '@/components/shared/AuthGate';

export default async function ParentDashboardPage() {
  return (
    <AuthGate>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-2">This Week</h2>
        <p className="text-gray-600 text-sm">
          Parent dashboard UI is coming in Plan 2 — AI content gen, approval queue,
          skills map, authoring, and settings. For now, you&apos;re signed in. 👋
        </p>
      </div>
    </AuthGate>
  );
}
