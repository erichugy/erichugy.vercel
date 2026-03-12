import type { Metadata } from "next";

import { FoodCollectorProvider } from "@/components/FoodCollector";

import "./globals.css";

export const metadata: Metadata = {
  title: "Eric Huang",
  description: "Eric Huang's personal website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            try {
              var theme = null;
              try { theme = localStorage.getItem('theme'); } catch(e) {}
              var prefersDark = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (theme === 'dark' || (!theme && prefersDark)) {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          })();
        `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
          <FoodCollectorProvider>{children}</FoodCollectorProvider>
        </body>
    </html>
  );
}
