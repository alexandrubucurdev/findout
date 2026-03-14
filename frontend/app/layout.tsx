import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";

export const metadata: Metadata = {
     title: "Find Out",
     description: "Tactical misinformation analysis dashboard",
};

export default function RootLayout({
     children,
}: Readonly<{
     children: React.ReactNode;
}>) {
     return (
          <html lang="ro">
               <head>
                    <link
                         href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&display=swap"
                         rel="stylesheet"
                    />
               </head>
               {/* Folosim flexbox pentru a asigura ca footer-ul ramane intotdeauna jos */}
               <body className="antialiased min-h-screen flex flex-col bg-slate-950 text-slate-200">
                    <Navbar />

                    <main className="flex-1 flex flex-col relative">
                         {children}
                    </main>

                    <Footer />
               </body>
          </html>
     );
}
