// app/layout.tsx
import "./globals.css";
import { Lexend_Deca } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";

// Lexend Deca font optimized by Next.js
const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lexend",
});

export const metadata = {
  title: "Ford School",
  description: "School management app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${lexendDeca.variable} font-sans antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
