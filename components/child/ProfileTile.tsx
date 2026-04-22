'use client';
import Link from 'next/link';

export default function ProfileTile({
  name, avatarEmoji, href,
}: { name: string; avatarEmoji: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center w-40 h-40 bg-white rounded-3xl border-4 border-ochre hover:scale-105 active:scale-95 transition-transform shadow-md"
      style={{ touchAction: 'manipulation' }}
    >
      <div className="text-7xl">{avatarEmoji}</div>
      <div className="mt-2 text-kid-md">{name}</div>
    </Link>
  );
}
