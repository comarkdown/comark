import type { ReactNode } from 'react'

interface FeatureCardProps {
  children?: ReactNode
  slotHeader?: ReactNode
  slotFooter?: ReactNode
}

export default function FeatureCard({ children, slotHeader, slotFooter }: FeatureCardProps) {
  return (
    <section className="my-6 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      {slotHeader && (
        <div className="border-b border-neutral-200 bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-100 [&_p]:mb-0">
          {slotHeader}
        </div>
      )}
      <div className="px-4 py-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 [&_p:last-child]:mb-0">
        {children}
      </div>
      {slotFooter && (
        <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-3 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-400 [&_p]:mb-0">
          {slotFooter}
        </div>
      )}
    </section>
  )
}
