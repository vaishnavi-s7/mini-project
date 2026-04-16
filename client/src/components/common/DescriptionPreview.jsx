/**
 * Shorten long text values to a preview-friendly snippet.
 */
const getPreviewText = (value, maxWords = 3) => {
  const text = String(value || "").trim();

  // Preserve a placeholder when there is no text to preview.
  if (!text) {
    return "-";
  }

  const words = text.split(/\s+/);
  // Keep the full value when it already fits within the preview limit.
  if (words.length <= maxWords) {
    return text;
  }

  return `${words.slice(0, maxWords).join(" ")}...`;
};

/**
 * Display a text preview while preserving the full value in the tooltip.
 */
export default function DescriptionPreview({
  text,
  className = "",
  as: Component = "span",
  maxWords = 3,
}) {
  const previewText = getPreviewText(text, maxWords);
  const fullText = String(text || "").trim();

  return (
    <Component
      className={className}
      title={fullText || previewText}
      aria-label={fullText || previewText}
    >
      {previewText}
    </Component>
  );
}
