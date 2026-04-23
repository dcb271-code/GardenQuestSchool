'use client';

export default function NarratorMoment({ text }: { text: string }) {
  return (
    <div className="bg-sage/10 border-4 border-sage rounded-2xl p-4 italic text-kid-sm text-center">
      ✨ {text}
    </div>
  );
}
