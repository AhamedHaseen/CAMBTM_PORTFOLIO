export function EmphasizedText({ emphasis, text }: { emphasis: string; text: string }) {
  const index = text.toLowerCase().indexOf(emphasis.toLowerCase());
  if (!emphasis || index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <em data-heading-accent>{text.slice(index, index + emphasis.length)}</em>
      {text.slice(index + emphasis.length)}
    </>
  );
}
