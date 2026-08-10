import { TabBar } from "@/components/TabBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-[18px] pb-28 pt-2">
      {children}
      <TabBar />
    </div>
  );
}
