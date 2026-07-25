"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/voters", label: "Voters" },
  { href: "/candidates", label: "Candidates" },
  { href: "/news", label: "News" },
  { href: "/results", label: "Results" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <Link href="/" className="nav-brand">
          <span className="nav-brand-mark">AD</span>
          <span>
            Allianvalor <em>Decides '26</em>
          </span>
        </Link>
        <div className="nav-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={pathname === l.href ? "active" : ""}>
              {l.label}
            </Link>
          ))}
        </div>
        <Link href="/vote" className="nav-cta">
          Vote Now
        </Link>
      </div>
    </nav>
  );
}
