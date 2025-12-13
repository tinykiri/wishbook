// src/components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full py-6 text-center z-50 relative pointer-events-auto">
      <p className="font-title text-slate-400 text-lg opacity-80">
        © 2025{' '}
        {/* INSTAGRAM LINK */}
        <Link
          href="https://www.instagram.com/tiny.kiri?igsh=MW9seXJqeG4yZzY1"
          target="_blank"
          className="hover:text-crayon-green hover:underline transition-colors"
        >
          @tiny.kiri
        </Link>
        {' '}—{' '}
        {/* TERMS LINK */}
        <Link
          href="/terms"
          className="hover:text-crayon-red hover:underline transition-colors"
        >
          terms
        </Link>
      </p>
    </footer>
  );
}