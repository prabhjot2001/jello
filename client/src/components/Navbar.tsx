import { Link, NavLink } from "react-router-dom";
import { ThemeBar } from "@/theme/ThemeBar";

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-1.5 font-display font-semibold transition ${
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
  }`;

export function Navbar() {
  return (
    <nav className="sticky top-0 z-20 border-b-2 border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="font-display text-xl font-bold">
          🐾 Games for Meows
        </Link>
        <div className="flex items-center gap-1">
          <NavLink to="/" end className={linkCls}>Home</NavLink>
          <NavLink to="/games" className={linkCls}>Games</NavLink>
        </div>
        <ThemeBar />
      </div>
    </nav>
  );
}