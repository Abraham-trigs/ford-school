import "./globals.css";
import { Lexend_Deca } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";

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
        {/* SessionProvider is client-only */}
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
