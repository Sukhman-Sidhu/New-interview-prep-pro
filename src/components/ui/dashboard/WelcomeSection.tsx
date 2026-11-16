
"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Sparkles } from "lucide-react";

export default function WelcomeSection() {
  const [userName, setUserName] = useState("Student");

  useEffect(() => {
    async function getUser() {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (response.ok && data.user?.name) {
          setUserName(data.user.name);
        }
      } catch (error) {
        console.error("Failed to load user name:", error);
      }
    }

    getUser();
  }, []);

  return (
    <section className="welcome-section">
      <div>
        <div className="welcome-tag">
          <Sparkles size={14} />
          YOUR LEARNING WORKSPACE
        </div>

        <h1>
          Welcome back, {userName}! <span>👋</span>
        </h1>

        <p>
          Every small step takes you closer to your dream job.
          Let's make today count.
        </p>
      </div>

      <div className="date-info">
        <CalendarDays size={17} />
        Keep learning, keep growing
      </div>
    </section>
  );
}
