import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: "SERVZ'IT | Operations",
  description: "Owner operations and marketplace administration",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
