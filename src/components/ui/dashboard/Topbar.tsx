
import {
  Search,
  Bell,
  ChevronRight,
  Menu,
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="topbar">

      <div className="mobile-brand">
        <Menu size={23} />
        <strong>InterviewPrep</strong>
      </div>

      <div className="breadcrumb">
        Workspace <ChevronRight size={15} /> Dashboard
      </div>

      <div className="topbar-actions">

        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search anything..."
          />

          <span>Ctrl K</span>
        </div>

        <div className="notification">
          <Bell size={19} />
          <div />
        </div>

        <div className="avatar top-avatar">S</div>

      </div>
    </header>
  );
}