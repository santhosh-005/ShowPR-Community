/**
 * HighlightedText — highlights all case-insensitive occurrences of `query`
 * within `text` by wrapping matches in a styled <mark> element.
 *
 * Special regex characters in the query are escaped so user input
 * cannot break the matching.
 */
export function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query || !query.trim()) return <span>{text}</span>;

  const escapedQuery = query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-primary/20 text-primary font-medium rounded-sm px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}
