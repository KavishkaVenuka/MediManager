import Header from "@/components/Header";
import DashboardCard from "@/components/DashboardCard";
import BottomNav from "@/components/BottomNav";
import { PieChart, ClipboardList, Gauge, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <Header />

      <div className="px-6 -mt-6 relative z-20">
        <div className="grid grid-cols-2 gap-4">
          <DashboardCard
            title="Analytics"
            icon={<PieChart size={42} strokeWidth={1.5} />}
          />
          <DashboardCard
            title="Inventory"
            icon={<ClipboardList size={42} strokeWidth={1.5} />}
          />
          <DashboardCard
            title="Low stocks"
            icon={<Gauge size={42} strokeWidth={1.5} />}
          />
          <DashboardCard
            title="Reports"
            icon={<TrendingUp size={42} strokeWidth={1.5} />}
          />
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
