import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gestión de Productos",
  description: "Sistema de gestión de productos con Next.js y Laravel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
