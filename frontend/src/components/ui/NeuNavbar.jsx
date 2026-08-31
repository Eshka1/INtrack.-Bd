import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/finance/budget", label: "Budget" },
  { to: "/finance/expenses/create", label: "Add Expense" },
  { to: "/finance/settings", label: "Currency" },
];

export default function NeuNavbar() {
  return (
    <nav className="neu-raised px-4 py-3 mb-8 flex flex-wrap items-center gap-3">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === "/"}
          style={{ textDecoration: "none" }}
          className={({ isActive }) =>
            [
              "inline-block px-5 py-2.5 rounded-full text-sm font-semibold no-underline transition-all duration-150",
              isActive
                ? "neu-inset text-neuPrimary"
                : "text-neuTextMuted hover:text-neuPrimary hover:bg-neuMint/10",
            ].join(" ")
          }
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}