import { GeistSans } from "geist/font/sans";
import "./globals.css";
import "@mantine/core/styles.css";
import "mantine-datatable/styles.layer.css";
import NavBar from "@/components/navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/client";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { ModalsProvider } from "@mantine/modals";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Totai | DK Gas Appliances - Proudly South African",
  description: "Totai | DK Gas Appliances - Proudly South African",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create the Supabase client
  const supabase = createClient();
  // Determine if Supabase is connected
  const isSupabaseConnected = !!supabase; // Replace with actual logic to check connection

  return (
    <html lang="en" className={GeistSans.className}>
      <head>
        <ColorSchemeScript />
      </head>
      <body className="bg-background text-foreground">
        <MantineProvider defaultColorScheme="auto">
          <ModalsProvider>
            <Notifications position="bottom-right" zIndex={10000} />
            <NavBar isSupabaseConnected={isSupabaseConnected} />
            <main className="min-h-screen flex flex-col items-center mt-16">
              {children}
            </main>
            <Footer />
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
