import "./globals.css";

export const metadata = {
  title: "Citation Blaster — One Business, 1000 Directories",
  description: "Worldwide business listing auto-poster with Google login.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white font-sans text-black antialiased">{children}</body>
    </html>
  );
}
