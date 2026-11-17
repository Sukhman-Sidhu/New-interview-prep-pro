
import { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: ReactNode;
  color: string;
}

export default function StatsCard({
  title,
  value,
  change,
  icon,
  color,
}: StatsCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className={`stat-icon ${color}`}>
          {icon}
        </div>

        <ArrowUpRight size={18} className="muted-icon" />
      </div>

      <p>{title}</p>

      <h2>{value}</h2>

      <span className="stat-change">{change}</span>
    </div>
  );
}
