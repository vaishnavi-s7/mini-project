const getPreviewText = (value, maxWords = 3) => {
  const text = String(value || "").trim();

  if (!text) {
    return "-";
  }

  const words = text.split(/\s+/);
  if (words.length <= maxWords) {
    return text;
  }

  return `${words.slice(0, maxWords).join(" ")}...`;
};

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
