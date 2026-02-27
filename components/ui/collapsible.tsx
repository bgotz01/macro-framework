"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CollapsibleContextType {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextType | null>(null)

interface CollapsibleProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children: React.ReactNode
    className?: string
}

const Collapsible = ({ open = false, onOpenChange, children, className }: CollapsibleProps) => {
    return (
        <CollapsibleContext.Provider value={{ open, onOpenChange: onOpenChange || (() => { }) }}>
            <div className={className}>{children}</div>
        </CollapsibleContext.Provider>
    )
}

const CollapsibleTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, children, asChild, ...props }, ref) => {
    const context = React.useContext(CollapsibleContext)

    if (asChild) {
        return React.cloneElement(children as React.ReactElement, {
            onClick: (e: React.MouseEvent) => {
                context?.onOpenChange(!context.open)
                    ; ((children as React.ReactElement).props as any).onClick?.(e)
            }
        } as any)
    }

    return (
        <button
            ref={ref}
            className={className}
            onClick={() => context?.onOpenChange(!context.open)}
            {...props}
        >
            {children}
        </button>
    )
})
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const context = React.useContext(CollapsibleContext)

    if (!context?.open) return null

    return (
        <div
            ref={ref}
            className={cn("overflow-hidden", className)}
            {...props}
        >
            {children}
        </div>
    )
})
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }