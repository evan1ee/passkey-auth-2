import { Button } from "@/components/ui/button";

export default function Navigation() {
  return (
    <div className="flex items-center justify-center h-screen">
      <nav className="flex flex-col gap-4 w-full max-w-md ">
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
    <Button asChild variant="outline" className="flex-1 py-3 px-6 bg-white border border-blue-500 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors duration-200">
      <a href={href}>{children}</a>
    </Button>
  );
}
