import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/Providers/AppProviders";
import { ClerkProvider } from "@clerk/nextjs";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flow Byte",
  description: "Next Generation Low Code automation",
};
const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl={"/sign-in"} publishableKey={clerkPubKey}
    appearance={{
      elements:{
        formButtonPrimary:"bg-primary hover:bg-primary/90 text-sm !shadow-none"
      }
    }}>
    <html lang="en">
      <body className={inter.className}><AppProviders>{children}</AppProviders></body>
    </html>
    </ClerkProvider>
  );
}
