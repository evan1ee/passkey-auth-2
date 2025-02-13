import { Button } from "@/components/ui/button";

export default function Navigation() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 gap-6 font-[family-name:var(--font-geist-sans)]">
      <nav className="flex flex-col gap-4">
        <NavLink href="/dashboard">Dashboard</NavLink>
        <NavLink href="/profile">Profile</NavLink>
        <NavLink href="/register">Register</NavLink>
        <NavLink href="/login">Login</NavLink>
        <NavLink href="/logout">Logout</NavLink>
      </nav>
    </div>
  );
}

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
};

function NavLink({ href, children }: NavLinkProps) {
  return (
    <Button asChild variant="outline" className="w-48 text-lg rounded-full">
      <a href={href}>{children}</a>
    </Button>
  );
}
