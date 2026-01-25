export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar and Header will be added later */}
      <main className="p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
