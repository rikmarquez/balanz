import { requireAuth } from '@/lib/auth';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { MobileMenuProvider } from '@/components/dashboard/MobileMenuProvider';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <MobileMenuProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header user={user} />
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </MobileMenuProvider>
  );
}