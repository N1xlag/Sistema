import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoLlajta Smart-Twin | Simulador de Producción",
  description: "Sistema de optimización de producción de macetas biodegradables a base de cáscara de huevo. Herramienta de toma de decisiones para EcoLlajta. Investigación Operativa II - UMSS.",
  keywords: ["EcoLlajta", "macetas biodegradables", "simulador", "producción", "cáscara de huevo", "optimización", "UMSS"],
  authors: [{ name: "Grupo IO2 - UMSS" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
