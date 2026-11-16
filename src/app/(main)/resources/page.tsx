
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
];

export default function ResourcesPage() {
  return (
    <div className="resources-page min-h-screen bg-[#080b18] p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">
          Learning Resources
        </h1>

        <p className="mt-2 text-gray-400">
          Explore useful resources to improve your technical skills.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {resources.map((resource) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
