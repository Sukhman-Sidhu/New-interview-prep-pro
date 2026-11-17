
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/ui/ThemeProvider";

type User = {
  id: string;
  name: string;
  email: string;
};

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);

  // Profile states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const { theme, setTheme } = useTheme();

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load profile.");
        }

        setUser(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
      } catch (err) {
        setProfileError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function handleSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setProfileMessage("");
    setProfileError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      setUser(data.user);
      setName(data.user.name);
      setEmail(data.user.email);
      setProfileMessage("Profile updated successfully!");
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError("New password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password.");
      }

      setPasswordMessage("Password changed successfully!");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <main className="mt-8 space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Settings ⚙️
        </h1>
        <p className="mt-2 text-gray-400">
          Manage your account and application preferences.
        </p>
      </div>

      {/* Edit Profile */}
      <section className="rounded-2xl border border-white/10 bg-[#15152b] p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">
            Edit Profile
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Update your personal information.
          </p>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading profile...</p>
        ) : (
          <form onSubmit={handleSaveProfile} className="max-w-xl space-y-5">
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                className="w-full rounded-xl border border-white/10 bg-[#0e0e20] px-4 py-3 text-white outline-none focus:border-purple-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-[#0e0e20] px-4 py-3 text-white outline-none focus:border-purple-500"
                placeholder="Enter your email"
              />
            </div>

            {profileMessage && (
              <p className="text-sm text-green-400">{profileMessage}</p>
            )}

            {profileError && (
              <p className="text-sm text-red-400">{profileError}</p>
            )}

            <button
              type="submit"
              disabled={saving || !user}
              className="rounded-xl bg-purple-600 px-6 py-3 font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        )}
      </section>

      {/* Change Password */}
      <section className="rounded-2xl border border-white/10 bg-[#15152b] p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">
            Change Password 🔐
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Keep your account secure by updating your password.
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="max-w-xl space-y-5">
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/10 bg-[#0e0e20] px-4 py-3 text-white outline-none focus:border-purple-500"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              className="w-full rounded-xl border border-white/10 bg-[#0e0e20] px-4 py-3 text-white outline-none focus:border-purple-500"
              placeholder="Enter new password (minimum 8 characters)"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              maxLength={128}
              autoComplete="new-password"
              className="w-full rounded-xl border border-white/10 bg-[#0e0e20] px-4 py-3 text-white outline-none focus:border-purple-500"
              placeholder="Confirm your new password"
            />
          </div>

          {passwordMessage && (
            <p className="text-sm text-green-400">{passwordMessage}</p>
          )}

          {passwordError && (
            <p className="text-sm text-red-400">{passwordError}</p>
          )}

          <button
            type="submit"
            disabled={changingPassword}
            className="rounded-xl bg-purple-600 px-6 py-3 font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
          >
            {changingPassword ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      </section>

      <div className="rounded-2xl border border-[#253047] bg-[#15152b] p-6">
  <h2 className="text-xl font-semibold text-white">
    Appearance
  </h2>

  <p className="mt-1 text-sm text-gray-400">
    Choose how InterviewPrep Pro looks on your device.
  </p>

  <div className="mt-5 flex items-center justify-between">
    <div>
      <p className="font-medium text-white">
        Theme
      </p>
      <p className="text-sm text-gray-400">
        Select dark or light mode.
      </p>
    </div>

    <select
      value={theme}
      onChange={(e) =>
        setTheme(e.target.value as "dark" | "light")
      }
      className="rounded-lg border border-[#253047] bg-[#0e1422] px-4 py-2 text-white outline-none"
    >
      <option value="dark">Dark Mode</option>
      <option value="light">Light Mode</option>
    </select>
  </div>
</div>

      {/* Account Security */}
      <section className="rounded-2xl border border-white/10 bg-[#15152b] p-6">
        <h2 className="text-xl font-semibold text-white">
          Account Security
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Your account is protected with bcrypt password hashing
          and secure session authentication.
        </p>
        <div className="mt-5 inline-flex rounded-full bg-green-500/10 px-4 py-2 text-sm text-green-400">
          ● Authentication Active
        </div>
      </section>
    </main>
  );
}
