
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  Search,
  Bell,
  ChevronRight,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Code2,
  Brain,
  BookOpen,
  Trophy,
  Command,
} from "lucide-react";

type TopbarProps = {
  user: {
    name: string;
    email: string;
  };
  onLogout: () => void;
  loggingOut: boolean;
  onMenuClick: () => void;
};

const pages = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "DSA Practice", href: "/practice", icon: Code2 },
  { name: "Mock Interviews", href: "/interview", icon: Brain },
  { name: "Learning Resources", href: "/resources", icon: BookOpen },
  { name: "Achievements", href: "/achievements", icon: Trophy },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Topbar({
  user,
  onLogout,
  loggingOut,
  onMenuClick,
}: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const currentPage =
    pages.find(
      (page) =>
        page.href === "/"
          ? pathname === "/"
          : pathname.startsWith(page.href)
    )?.name || "Workspace";

  const filteredPages = pages.filter((page) =>
    page.name.toLowerCase().includes(search.toLowerCase())
  );

  function navigateTo(href: string) {
    router.push(href);
    setSearch("");
    setSearchOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
  }

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (!searchRef.current?.contains(target)) {
        setSearchOpen(false);
      }

      if (!notificationRef.current?.contains(target)) {
        setNotificationsOpen(false);
      }

      if (!profileRef.current?.contains(target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        searchRef.current?.querySelector("input")?.focus();
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    }

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  return (
    <header className="topbar">
      <div className="mobile-brand">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="topbar-icon-button"
        >
          <Menu size={22} />
        </button>

        <strong>InterviewPrep</strong>
      </div>

      <div className="breadcrumb">
        Workspace
        <ChevronRight size={15} />
        <span>{currentPage}</span>
      </div>

      <div className="topbar-actions">
        {/* Search */}
        <div className="topbar-dropdown-wrapper" ref={searchRef}>
          <div className="search-box">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search pages..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              aria-label="Search pages"
            />

            <span className="search-shortcut">
              <Command size={12} /> K
            </span>
          </div>

          {searchOpen && (
            <div className="topbar-dropdown search-dropdown">
              <p className="dropdown-heading">NAVIGATION</p>

              {filteredPages.length > 0 ? (
                filteredPages.map((page) => {
                  const Icon = page.icon;

                  return (
                    <button
                      key={page.href}
                      type="button"
                      onClick={() => navigateTo(page.href)}
                      className="dropdown-item"
                    >
                      <Icon size={17} />
                      <span>{page.name}</span>
                      <ChevronRight size={15} />
                    </button>
                  );
                })
              ) : (
                <p className="dropdown-empty">No matching pages found.</p>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="topbar-dropdown-wrapper" ref={notificationRef}>
          <button
            type="button"
            className="notification topbar-icon-button"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
              setSearchOpen(false);
            }}
            aria-label="Notifications"
          >
            <Bell size={19} />
          </button>

          {notificationsOpen && (
            <div className="topbar-dropdown notification-dropdown">
              <div className="dropdown-title-row">
                <strong>Notifications</strong>
                <span className="notification-label">Updates</span>
              </div>

              <div className="notification-empty">
                <div className="notification-empty-icon">
                  <Bell size={23} />
                </div>

                <strong>You're all caught up!</strong>
                <p>
                  New updates and notifications will appear here.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="topbar-dropdown-wrapper" ref={profileRef}>
          <button
            type="button"
            className="profile-trigger"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
              setSearchOpen(false);
            }}
            aria-label="Open profile menu"
          >
            <div className="avatar top-avatar">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <ChevronRight size={15} className="profile-chevron" />
          </button>

          {profileOpen && (
            <div className="topbar-dropdown profile-dropdown">
              <div className="profile-dropdown-user">
                <div className="avatar">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>

                <div>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
              </div>

              <div className="dropdown-divider" />

              <button
                type="button"
                className="dropdown-item"
                onClick={() => navigateTo("/settings")}
              >
                <User size={17} />
                <span>My Settings</span>
                <ChevronRight size={15} />
              </button>

              <button
                type="button"
                className="dropdown-item logout-item"
                onClick={onLogout}
                disabled={loggingOut}
              >
                <LogOut size={17} />
                <span>{loggingOut ? "Logging out..." : "Logout"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
