import { OperacaoSidebar } from './OperacaoSidebar'

export default function OperacaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
      <OperacaoSidebar />
      <main className="flex flex-1 flex-col overflow-auto">{children}</main>
    </div>
  )
}
