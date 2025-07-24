"use client"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="pt-16">
      {children}
    </main>
  )
}