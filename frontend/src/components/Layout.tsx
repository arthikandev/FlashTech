import { Link, Outlet } from "react-router-dom";

const nav = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/demos/seylan", label: "Seylan" },
  { to: "/demos/cloudmetrics", label: "CloudMetrics" },
  { to: "/demos/coral", label: "Coral" },
];

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <header className="border-b border-[#212121] bg-[#101010]/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="font-semibold text-primary tracking-tight">
            PresenceIQ
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm text-gray-400">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="hover:text-[#E1E0CC] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
