import { AppSidebar } from "@/components/sidebar/app-sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden mesh-gradient dark:opacity-30">
      <div className="hidden lg:flex h-full">
        <AppSidebar />
      </div>
      <main className="flex-1 h-full overflow-hidden">{children}</main>
    </div>
  );
}
