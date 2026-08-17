import Link from "next/link"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <h1 className="text-4xl font-bold text-foreground">Page not found</h1>
      <p className="text-muted-foreground">The page you requested does not exist.</p>
      <Link className="text-primary underline underline-offset-4" href="/">
        Return to Video Loop Player
      </Link>
    </main>
  )
}
