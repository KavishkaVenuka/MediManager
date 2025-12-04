import Header from "@/components/Header";
import DashboardCard from "@/components/DashboardCard";
import BottomNav from "@/components/BottomNav";
import { PieChart, ClipboardList, Gauge, TrendingUp } from "lucide-react";
import BackgroundNeurons from "@/components/BackgroundLines";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 pb-24 relative overflow-hidden">
      <BackgroundNeurons />
      <Header />

      <div className="px-6 -mt-6 relative z-20">
        <div className="grid grid-cols-2 gap-4">

          {/*Dashboard cards
                        shows from here */}

          <DashboardCard
            title="Analytics"
            icon={<PieChart size={42} strokeWidth={1.5} />}
            href="/analytics"
          />
          <DashboardCard
            title="Low stocks"
            icon={<Gauge size={42} strokeWidth={1.5} />}
            href="/low-stocks"
          />
          <DashboardCard
            title="Buy Stock"
            icon={<ClipboardList size={42} strokeWidth={1.5} />}
            href="/buy-stock"
          />
          <DashboardCard
            title="Reports"
            icon={<TrendingUp size={42} strokeWidth={1.5} />}
            href="/reports"
          />
        </div>
      </div>

    </main>
  );
}
