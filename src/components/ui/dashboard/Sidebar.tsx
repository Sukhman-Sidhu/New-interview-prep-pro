
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Code2,
  Brain,
  BookOpen,
  Trophy,
  Settings,
  Sparkles,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "DSA Practice", icon: Code2, href: "/practice" },
  { name: "Mock Interviews", icon: Brain, href: "/interview" },
  { name: "Learning Resources", icon: BookOpen, href: "/resources" },
  { name: "Achievements", icon: Trophy, href: "/achievements" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Code2 size={25} />
        </div>

        <div>
          <h2>InterviewPrep</h2>
          <span>PRO</span>
        </div>
      </div>

      <div className="sidebar-label">MAIN MENU</div>

      <nav className="navigation">
        {navigation.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <Icon size={19} />
              <span>{item.name}</span>

              {isActive && <div className="active-dot" />}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-label settings-label">
        PREFERENCES
      </div>

      <Link
        href="/settings"
        className={`nav-item ${
          pathname.startsWith("/settings") ? "active" : ""
        }`}
      >
        <Settings size={19} />
        <span>Settings</span>
      </Link>

      <div className="sidebar-bottom">
        {/* <div className="upgrade-card">
          <Sparkles size={22} />

          <h3>Level up your skills</h3>

          <p>
            Stay consistent and get ready for your dream job.
          </p>

          <div className="upgrade-progress">
            <div />
          </div>

          <span>48 of 100 problems completed</span>
        </div> */}

        <div className="user-profile">
          <div className="avatar">S</div>

          <div className="user-info">
            <strong>Student</strong>
            <span>Free Plan</span>
          </div>

          <Settings size={17} />
        </div>
      </div>
    </aside>
  );
}
