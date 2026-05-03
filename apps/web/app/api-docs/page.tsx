import { ApiDocsBody } from "./api-docs-body"

export const metadata = {
  title: "API docs · Kitty Learn",
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b px-4 py-4">
        <h1 className="text-xl font-bold tracking-tight">HTTP API</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          OpenAPI 3 document rendered with Scalar. Sign in to the app in this browser first;
          requests use cookies on the same origin so parent-scoped routes work.
        </p>
      </header>
      <ApiDocsBody />
    </div>
  )
}
