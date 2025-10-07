/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { SolanaProvider } from '@/providers/solana-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Solana Quiz',
  description: 'Solana Quiz',
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SolanaProvider>
              <AuthProvider>
                {children}
                <Toaster position="top-right" richColors />
              </AuthProvider>
            </SolanaProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
