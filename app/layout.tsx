import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/AppProviders";
import { OrbitShell } from "@/components/shell/OrbitShell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Orbit — Dashboard",
    template: "%s — Orbit",
  },
  description: "Orbit telecommunications operations portal",
  icons: { icon: "/assets/orbit-logo.svg" },
};

const themeBootstrap = `
  try {
    var theme = localStorage.getItem('orbit-theme') === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    if (theme === 'dark') document.body.classList.add('dark');
  } catch (_) {}
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <AppProviders>
          <OrbitShell>{children}</OrbitShell>
        </AppProviders>
      </body>
    </html>
  );
}
