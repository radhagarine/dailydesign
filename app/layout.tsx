import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    weight: ['300', '400', '500', '600', '700', '800', '900'],
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: "DailyDesign | Daily System Design Challenges",
    description: "Spend 30 minutes a day and permanently upgrade how you answer senior/principal engineering interviews. Premium interview calibration for experienced engineers.",
    keywords: "system design, daily design challenges, staff engineer, principal engineer, technical interviews",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider>
                    <Navbar />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
