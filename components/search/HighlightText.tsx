export default function HighlightText({
  text,
  query,
}: {
  text: string
  query: string
}) {
  const words = query
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 1)
    .map(escapeRegExp)
  if (!words.length) return <>{text}</>

  const matcher = new RegExp(`(${words.join('|')})`, 'gi')
  return (
    <>
      {text.split(matcher).map((part, index) =>
        index % 2 === 1 ? (
          <mark
            key={`${part}-${index}`}
            className="rounded-sm bg-yellow-200 px-0.5 text-inherit dark:bg-yellow-500/35"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
