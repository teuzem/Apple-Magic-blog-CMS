import { AlertTriangle, Info, Lightbulb, Lock, ThumbsUp } from 'lucide-react'

import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ReactNode> = {
  tip: <Lightbulb size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
  pro: <ThumbsUp size={18} />,
  privacy: <Lock size={18} />,
}

const toneMap: Record<string, string> = {
  tip: 'border-magic-blue/30 bg-magic-blue/5',
  warning: 'border-amber-400/40 bg-amber-50 dark:bg-amber-500/5',
  info: 'border-apple-blue/30 bg-apple-blue/5',
  pro: 'border-success/30 bg-success/5',
  privacy: 'border-gray-4/40 bg-gray-7 dark:bg-gray-2',
}

export default function CalloutBlock({ block }: { block: any }) {
  const icon = iconMap[block.icon] || <Info size={18} />
  return (
    <aside
      className={cn(
        'my-8 flex gap-4 rounded-xl border p-5',
        toneMap[block.icon] || toneMap.info,
      )}
    >
      <div className="mt-0.5 shrink-0 text-ink dark:text-white">{icon}</div>
      <div>
        {block.heading && (
          <h4 className="mb-1 text-[0.9375rem] font-semibold text-ink dark:text-white">
            {block.heading}
          </h4>
        )}
        <p className="text-[0.9375rem] leading-relaxed text-gray-2 dark:text-gray-8">
          {block.text}
        </p>
      </div>
    </aside>
  )
}
