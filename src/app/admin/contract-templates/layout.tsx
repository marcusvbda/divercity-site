import { PartiesSidebar } from '../parties/PartiesSidebar'

export default function ContractTemplatesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
      <PartiesSidebar />
      <main className="flex flex-1 flex-col overflow-auto">{children}</main>
    </div>
  )
}
