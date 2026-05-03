"use client"

import { ApiReferenceReact } from "@scalar/api-reference-react"
import "@scalar/api-reference-react/style.css"

export default function ApiReferenceClient() {
  return (
    <ApiReferenceReact
      configuration={{
        url: "/api/openapi",
        fetch: (input, init) =>
          globalThis.fetch(input, {
            ...init,
            credentials: "include",
          }),
      }}
    />
  )
}
