import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Two Hand — ตลาดมือสอง',
  description: 'ตลาดของมือสอง สไตล์วินเทจ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="relative min-h-screen antialiased">{children}</body>
    </html>
  );
}
