"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

const resources = [
  {
    title: "JavaScript Fundamentals",
    category: "Programming",
    description: "Learn variables, functions, arrays, objects and ES6 concepts.",
    level: "Beginner",
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  },
  {
    title: "Data Structures and Algorithms",
    category: "DSA",
    description: "Understand arrays, linked lists, stacks, queues and algorithms.",
    level: "Intermediate",
    link: "https://www.geeksforgeeks.org/data-structures/",
  },
  {
    title: "React.js",
    category: "Web Development",
    description: "Learn components, props, state and React hooks.",
    level: "Intermediate",
    link: "https://react.dev/learn",
  },
  {
    title: "Node.js",
    category: "Backend Development",
    description: "Learn server-side JavaScript and API development.",
    level: "Intermediate",
    link: "https://nodejs.org/en/learn",
  },
  {
    title: "Python Programming",
    category: "Programming",
    description: "Build your Python programming fundamentals.",
    level: "Beginner",
    link: "https://docs.python.org/3/tutorial/",
  },
  {
    title: "SQL and Databases",
    category: "Database",
    description: "Learn SQL queries, tables and database concepts.",
    level: "Beginner",
    link: "https://www.w3schools.com/sql/",
  },

  {
    title: "TypeScript Handbook",
    category: "Programming",
    description: "Learn TypeScript, types, interfaces and generics.",
    level: "Intermediate",
    link: "https://www.typescriptlang.org/docs/handbook/intro.html",
  },
  {
    title: "The Odin Project",
    category: "Web Development",
    description: "Learn full-stack development through practical projects.",
    level: "Beginner",
    link: "https://www.theodinproject.com/",
  },
  {
    title: "Next.js",
    category: "Web Development",
    description: "Learn routing, layouts and full-stack development.",
    level: "Intermediate",
    link: "https://nextjs.org/learn",
  },
  {
    title: "Tailwind CSS",
    category: "Web Development",
    description: "Learn modern CSS styling using utility classes.",
    level: "Beginner",
    link: "https://tailwindcss.com/docs",
  },
  {
    title: "LeetCode",
    category: "DSA",
    description: "Practice coding problems for technical interviews.",
    level: "Intermediate",
    link: "https://leetcode.com/problemset/",
  },
  {
    title: "HackerRank",
    category: "DSA",
    description: "Practice Python, Java, SQL and problem-solving.",
    level: "Beginner",
    link: "https://www.hackerrank.com/domains",
  },
  {
    title: "VisuAlgo",
    category: "DSA",
    description: "Understand algorithms and data structures visually.",
    level: "Beginner",
    link: "https://visualgo.net/en",
  },
  {
    title: "Interview Preparation",
    category: "Interview Prep",
    description: "Prepare for technical interviews and computer science questions.",
    level: "Intermediate",
    link: "https://www.geeksforgeeks.org/interview-preparation/",
  },
  {
    title: "System Design Primer",
    category: "Interview Prep",
    description: "Learn system architecture, scalability and design concepts.",
    level: "Advanced",
    link: "https://github.com/donnemartin/system-design-primer",
  },
  {
    title: "Pro Git Book",
    category: "Developer Tools",
    description: "Learn Git, commits, branches and version control.",
    level: "Beginner",
    link: "https://git-scm.com/book/en/v2",
  },
  {
    title: "SQLBolt",
    category: "Database",
    description: "Practice SQL queries through interactive lessons.",
    level: "Beginner",
    link: "https://sqlbolt.com/",
  },
  {
    title: "PostgreSQL",
    category: "Database",
    description: "Learn PostgreSQL database concepts and queries.",
    level: "Intermediate",
    link: "https://www.postgresql.org/docs/",
  },
  {
    title: "Postman Learning Center",
    category: "Developer Tools",
    description: "Learn API testing and development workflows.",
    level: "Beginner",
    link: "https://learning.postman.com/",
  },
  {
    title: "OWASP Top 10",
    category: "Cybersecurity",
    description: "Understand common web application security risks.",
    level: "Intermediate",
    link: "https://owasp.org/www-project-top-ten/",
  },
  {
    title: "Playwright",
    category: "Developer Tools",
    description: "Learn automated browser testing for web applications.",
    level: "Intermediate",
    link: "https://playwright.dev/docs/intro",
  },

];

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
const [selectedCategory, setSelectedCategory] = useState("All");

const categories = [
  "All",
  ...Array.from(new Set(resources.map((item) => item.category))),
];

const filteredResources = resources.filter((resource) => {
  const matchesSearch =
    resource.title.toLowerCase().includes(search.toLowerCase()) ||
    resource.description.toLowerCase().includes(search.toLowerCase());

  const matchesCategory =
    selectedCategory === "All" ||
    resource.category === selectedCategory;

  return matchesSearch && matchesCategory;
});
  return (
    <div className="resources-page min-h-screen bg-[#080b18] p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">
          Learning Resources
        </h1>

        <p className="mt-2 text-gray-400">
          Explore useful resources to improve your technical skills.
        </p>

        {/* Search Bar */}
<div className="mt-8">
  <div className="relative max-w-xl">
    <Search
      size={19}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
    />

    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search resources..."
      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-12 text-sm text-white outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
    />

    {search && (
      <button
        onClick={() => setSearch("")}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
        aria-label="Clear search"
      >
        <X size={18} />
      </button>
    )}
  </div>
</div>

{/* Category Filters */}
<div className="mt-6 flex flex-wrap gap-2">
  {categories.map((category) => (
    <button
      key={category}
      onClick={() => setSelectedCategory(category)}
      className={`rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200 ${
        selectedCategory === category
          ? "border-purple-500 bg-purple-600 text-white shadow-lg shadow-purple-500/20"
          : "border-white/10 bg-white/5 text-gray-400 hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-300"
      }`}
    >
      {category}
    </button>
  ))}
</div>

{/* Resource Count */}
<div className="mt-6 flex items-center justify-between">
  <p className="text-sm text-gray-400">
    Showing <span className="font-semibold text-white">
      {filteredResources.length}
    </span> of {resources.length} resources
  </p>
</div>

{/* Resource Cards */}
<div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
  {filteredResources.length > 0 ? (
    filteredResources.map((resource) => (
      <div
        key={resource.title}
        className="resource-card rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-purple-500"
      >
        <p className="text-sm text-purple-400">
          {resource.category}
        </p>

        <h2 className="mt-3 text-xl font-semibold">
          {resource.title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-gray-400">
          {resource.description}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
            {resource.level}
          </span>

          <a
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            Start Learning →
          </a>
        </div>
      </div>
    ))
  ) : (
    <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
      <Search size={30} className="mx-auto mb-3 text-gray-500" />

      <h3 className="text-lg font-semibold text-white">
        No resources found
      </h3>

      <p className="mt-2 text-sm text-gray-400">
        Try another search term or select a different category.
      </p>

      <button
        onClick={() => {
          setSearch("");
          setSelectedCategory("All");
        }}
        className="mt-4 text-sm text-purple-400 hover:text-purple-300"
      >
        Clear filters
      </button>
    </div>
  )}
</div>
      </div>
    </div>
  );
}
