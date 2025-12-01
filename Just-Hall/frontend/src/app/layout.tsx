// src/app/layout.tsx
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SignupModal from "@/components/SignupModal";
import LoginModal from "@/components/LoginModal"; // Import LoginModal
import ClearCacheButton from "@/components/ClearCacheButton";
import { UIProvider } from "@/context/ui-store";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gradient-to-b from-white to-slate-50 text-slate-900 antialiased">
        {/* Wrap everything inside AuthProvider and UIProvider */}
        <AuthProvider>
          <UIProvider>
            {/* Header: University logo + Hall name */}
            <Header />

            {/* Navbar: sticky under the header */}
            <div className="sticky top-0 z-50">
              <Navbar />
            </div>

            {/* Main content grows to fill space between header/navbar and footer */}
            <main className="flex-grow">{children}</main>

            {/* Footer: dark gradient with links and newsletter */}
            <Footer />

            {/* Include Login & Signup Modal */}
            <LoginModal />
            <SignupModal />
            
            {/* Development helper to clear authentication cache */}
            {process.env.NODE_ENV === 'development' && <ClearCacheButton />}
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
