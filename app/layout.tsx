import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    weight: ['300', '400', '500', '600', '700', '800', '900'],
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: "Principal Engineer Interview Prep | Daily Interview Simulations",
    description: "Spend 30 minutes a day and permanently upgrade how you answer senior/principal engineering interviews. Premium interview calibration for experienced engineers.",
    keywords: "principal engineer, staff engineer, senior engineer, interview prep, system design, technical interviews",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}
