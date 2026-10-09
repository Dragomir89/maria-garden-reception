import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maria Garden · Рецепция",
  description: "Резервации и разпределение на 17-те стаи на Maria Garden.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body className="antialiased">{children}</body>
    </html>
  );
}
