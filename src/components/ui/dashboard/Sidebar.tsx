
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
  X,
} from "lucide-react";

type SidebarProps = {
  user: {
    name: string;
    email: string;
  };
  isOpen: boolean;
  onClose: () => void;
};

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "DSA Practice", icon: Code2, href: "/practice" },
  { name: "Mock Interviews", icon: Brain, href: "/interview" },
  { name: "Learning Resources", icon: BookOpen, href: "/resources" },
  { name: "Achievements", icon: Trophy, href: "/achievements" },
];

export default function Sidebar({
  user,
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <button
          className="sidebar-overlay"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
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
                onClick={onClose}
className={`nav-item group ${isActive ? "active" : ""}`}              >
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
          onClick={onClose}
         className={`nav-item group ${
  pathname.startsWith("/settings") ? "active" : ""
}`}
        >
          <Settings size={19} />
          <span>Settings</span>
          {pathname.startsWith("/settings") && (
            <div className="active-dot" />
          )}
        </Link>

        <div className="sidebar-bottom">
          <div className="user-profile">
            <div className="avatar">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="user-info">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
