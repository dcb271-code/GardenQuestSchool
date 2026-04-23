import AuthGate from '@/components/shared/AuthGate';
import Link from 'next/link';

export default async function ParentDashboardPage() {
  return (
    <AuthGate>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="text-xl font-bold mb-2">This Week</h2>
        <p className="text-gray-600 text-sm">
          Full parent dashboard (AI content gen, approval queue, skills map, authoring, settings)
          comes in Plan 3. For now, you can manage the family:
        </p>
        <Link
          href="/parent/family"
          className="inline-block bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold"
        >Manage family</Link>
      </div>
    </AuthGate>
  );
}
