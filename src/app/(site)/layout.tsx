import BookingProvider from "@/components/BookingProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <BookingProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <StickyMobileCTA />
    </BookingProvider>
  );
}
