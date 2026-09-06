interface ComparisonTableBlockProps {
  block: {
    caption?: string
    columns?: string[]
    rows?: { label?: string; values?: string[] }[]
  }
}

export default function ComparisonTableBlock({
  block,
}: ComparisonTableBlockProps) {
  const columns = block.columns || []
  const rows = block.rows || []
  if (rows.length === 0) return null

  return (
    <div className="my-8 min-w-0 max-w-full overflow-hidden rounded-lg border border-gray-7 dark:border-gray-2">
      {block.caption && (
        <div className="border-b border-gray-7 bg-gray-8 px-5 py-3 text-[0.9375rem] font-semibold text-ink dark:border-gray-2 dark:bg-gray-1 dark:text-white">
          {block.caption}
        </div>
      )}
      <div className="max-w-full overflow-x-auto overscroll-x-contain">
        <table className="w-full min-w-[560px] text-left text-[0.875rem]">
          <thead>
            <tr className="bg-gray-7 text-gray-2 dark:bg-gray-2 dark:text-gray-8">
              <th className="px-5 py-3 font-semibold">
                {columns[0] || 'Specification'}
              </th>
              {columns.slice(1).map((col, i) => (
                <th key={i} className="px-5 py-3 font-semibold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-gray-7 dark:border-gray-2">
                <td className="px-5 py-3 font-medium text-ink dark:text-white">
                  {row.label}
                </td>
                {(row.values || []).map((val, j) => (
                  <td
                    key={j}
                    className="px-5 py-3 text-gray-3 dark:text-gray-4"
                  >
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
