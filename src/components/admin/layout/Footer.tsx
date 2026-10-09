export function Footer() {
  return (
    <footer>
      <div className="text-muted-foreground mx-auto flex size-full items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="text-sm">{`©${new Date().getFullYear()} Divercity Park`}</p>
      </div>
    </footer>
  )
}
