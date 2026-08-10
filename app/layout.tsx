import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LEVELS",
  description: "A straight, private read on how you're holding.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="phone">{children}</div>
      </body>
    </html>
  );
}
