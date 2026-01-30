import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import { AdminLayout } from "@/components/layout/AdminLayout";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import TanStackQueryProvider from "@/providers/TanstackQueryProvider";


const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  preload: true,
  variable: "--font-ubuntu",
});


export const metadata: Metadata = {
  title: "Acadify-Admin",
  description: "Acadify-Admin is a platform for managing students, courses, and faculty members.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${ubuntu.variable} antialiased`} lang="en">
      <body
        className={`${ubuntu.className}  `}
      >
        <NextTopLoader color="#B6F500" easing="ease" showSpinner={false} />
        <TanStackQueryProvider>
          <AdminLayout>
            {children}
          </AdminLayout>
        </TanStackQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
