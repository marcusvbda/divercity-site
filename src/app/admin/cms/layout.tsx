import { CMSSidebar } from './CMSSidebar'

export default function CMSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
      <CMSSidebar />
      <main className="flex flex-1 flex-col overflow-auto">{children}</main>
    </div>
  )
}
