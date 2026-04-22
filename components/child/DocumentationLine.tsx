export default function DocumentationLine({ text }: { text: string }) {
  return (
    <div className="bg-cream/60 border-l-4 border-terracotta px-4 py-3 rounded-r-xl text-kid-sm">
      {text}
    </div>
  );
}
