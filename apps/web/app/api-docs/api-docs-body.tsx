"use client"

import dynamic from "next/dynamic"

const ApiReferenceClient = dynamic(() => import("./api-reference-client"), {
  ssr: false,
  loading: () => (
    <p className="p-6 text-sm text-muted-foreground">Loading API documentation…</p>
  ),
})

export function ApiDocsBody() {
  return (
    <div className="swagger-docs-root">
      <ApiReferenceClient />
    </div>
  )
}
