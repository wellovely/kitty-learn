const NAV_TIMEOUT_MS = 8_000

export type NavigationZone = "child" | "parent"

export const LOADING_PHRASES: Record<NavigationZone, string[]> = {
  child: [
    "Getting ready…",
    "Opening lesson…",
    "Almost there…",
    "One moment…",
  ],
  parent: [
    "Loading…",
    "Fetching data…",
    "Just a second…",
    "Almost there…",
  ],
}

export { NAV_TIMEOUT_MS }

export function isInternalNavigation(
  anchor: HTMLAnchorElement,
  currentUrl: URL
): boolean {
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false
  }

  const href = anchor.getAttribute("href")
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false
  }

  let next: URL
  try {
    next = new URL(anchor.href, currentUrl.href)
  } catch {
    return false
  }

  if (next.origin !== currentUrl.origin) return false

  if (
    next.pathname === currentUrl.pathname &&
    next.search === currentUrl.search &&
    next.hash === currentUrl.hash
  ) {
    return false
  }

  if (
    next.pathname === currentUrl.pathname &&
    next.search === currentUrl.search &&
    next.hash !== currentUrl.hash
  ) {
    return false
  }

  return true
}

export function hasModifiedClick(event: MouseEvent): boolean {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0
}
