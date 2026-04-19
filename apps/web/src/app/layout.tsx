import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Family Nudge — Smart Family Management',
  description:
    'Reminders, encrypted document vault, insurance tracking — everything your family needs in one place.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
