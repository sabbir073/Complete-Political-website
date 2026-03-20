import DynamicHeader from "@/components/DynamicHeader";
import Footer from "@/components/Footer";
// import WelcomePopup from "@/components/WelcomePopup";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <WelcomePopup /> */}
      <DynamicHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}