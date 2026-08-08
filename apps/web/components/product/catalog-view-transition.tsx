"use client"

import * as React from "react"
import { flushSync } from "react-dom"
import { gsap } from "gsap"

import { cn } from "@/lib/utils"

type CatalogView = "grid" | "list"

type CatalogViewContextValue = {
  view: CatalogView
  setView: (view: CatalogView) => void
  registerBeforeViewChange: (callback: () => void) => () => void
}

const CatalogViewContext = React.createContext<CatalogViewContextValue | null>(null)

export function useCatalogView() {
  const context = React.useContext(CatalogViewContext)
  if (!context) {
    throw new Error("useCatalogView must be used within CatalogViewProvider")
  }
  return context
}

export function CatalogViewProvider({
  initialView,
  children,
}: {
  initialView: CatalogView
  children: React.ReactNode
}) {
  const [view, setViewState] = React.useState<CatalogView>(initialView)
  const beforeViewChangeRef = React.useRef<(() => void) | null>(null)

  const setView = React.useCallback(
    (nextView: CatalogView) => {
      if (nextView === view) return

      beforeViewChangeRef.current?.()
      flushSync(() => {
        setViewState(nextView)
        const url = new URL(window.location.href)
        if (nextView === "list") {
          url.searchParams.set("view", "list")
        } else {
          url.searchParams.delete("view")
        }
        window.history.replaceState(null, "", url)
      })
    },
    [view]
  )

  const registerBeforeViewChange = React.useCallback((callback: () => void) => {
    beforeViewChangeRef.current = callback
    return () => {
      if (beforeViewChangeRef.current === callback) {
        beforeViewChangeRef.current = null
      }
    }
  }, [])

  const contextValue = React.useMemo(
    () => ({ view, setView, registerBeforeViewChange }),
    [registerBeforeViewChange, setView, view]
  )

  return <CatalogViewContext value={contextValue}>{children}</CatalogViewContext>
}

export function CatalogProductResults({ children }: { children: React.ReactNode }) {
  const { view, registerBeforeViewChange } = useCatalogView()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const previousRectsRef = React.useRef(new Map<HTMLElement, DOMRect>())

  const captureCardPositions = React.useCallback(() => {
    const root = rootRef.current
    if (!root) return

    previousRectsRef.current = new Map(
      Array.from(root.querySelectorAll<HTMLElement>("[data-catalog-product]")).map((card) => [
        card,
        card.getBoundingClientRect(),
      ])
    )
  }, [])

  React.useEffect(
    () => registerBeforeViewChange(captureCardPositions),
    [captureCardPositions, registerBeforeViewChange]
  )

  React.useLayoutEffect(() => {
    const root = rootRef.current
    const previousRects = previousRectsRef.current
    if (!root || previousRects.size === 0) return

    previousRectsRef.current = new Map()
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-catalog-product]"))
    const context = gsap.context(() => {
      cards.forEach((card) => {
        const previousRect = previousRects.get(card)
        if (!previousRect) return

        const currentRect = card.getBoundingClientRect()
        gsap.set(card, {
          x: previousRect.left - currentRect.left,
          y: previousRect.top - currentRect.top,
          scaleX: previousRect.width / currentRect.width,
          scaleY: previousRect.height / currentRect.height,
          transformOrigin: "top left",
          willChange: "transform,opacity",
        })
      })

      gsap.to(cards, {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        duration: 0.62,
        ease: "power3.out",
        stagger: { each: 0.025, from: "start" },
        overwrite: "auto",
        clearProps: "transform,willChange",
      })
      gsap.fromTo(
        cards,
        { autoAlpha: 0.82 },
        {
          autoAlpha: 1,
          duration: 0.22,
          ease: "power1.out",
          stagger: { each: 0.02, from: "start" },
          overwrite: "auto",
          clearProps: "opacity,visibility",
        }
      )
    }, root)

    return () => context.revert()
  }, [view])

  return (
    <div ref={rootRef} className="catalog-view-results" data-view={view}>
      <div
        className={cn(
          "grid items-stretch transition-[gap,grid-template-columns] duration-500 ease-out motion-reduce:transition-none",
          view === "grid"
            ? "grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1 gap-4"
        )}
      >
        {children}
      </div>
    </div>
  )
}
