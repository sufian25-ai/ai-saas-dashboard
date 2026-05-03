import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/sidebar'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {children}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg-primary);
        }
        .dashboard-main {
          flex: 1;
          margin-left: 240px;
          min-height: 100vh;
          overflow-x: hidden;
        }
      `}} />
    </div>
  )
}
