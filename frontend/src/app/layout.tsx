import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SNTC Convocation Portal",
  description: "This is a convocation portal made by the students of SNTC which allows students to register for the convocation ceremony.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
      <footer className="bg-gray-100 border-t border-gray-300 py-4">
      <div className="container mx-auto text-center">
        <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
        <p className="text-gray-700"><strong>Name:</strong> Shivansh Bhatnagar</p>
        <p className="text-gray-700">
          <strong>Email:</strong> <a href={`mailto:shivansh.bhatnagar.mat22@itbhu.ac.in`} className="text-blue-500 hover:underline">shivansh.bhatnagar.mat22@itbhu.ac.in</a>
        </p>
        <p className="text-gray-700">
            <strong>Phone:</strong> <a href={`tel:+91-7905368968`} className="text-blue-500 hover:underline">+91-7905368968</a>
          </p>
      </div>
    </footer>
    </html>
  );
}
