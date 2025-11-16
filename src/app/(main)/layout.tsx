import DynamicHeader from "@/components/DynamicHeader";
import Footer from "@/components/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DynamicHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}