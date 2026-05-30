import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsOpen(false);
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Tournaments', path: '/tournaments' },
    { label: 'Support', path: '/support' },
  ];

  if (user) {
    navLinks.push({ label: 'Profile', path: '/profile' });
    navLinks.push({ label: 'My Tickets', path: '/my-tickets' });
  }

  if (isAdmin) {
    navLinks.push({ label: 'Admin', path: '/admin' });
    navLinks.push({ label: 'Live Control', path: '/admin/live-tournament' });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="https://predator-esports.vercel.app/" className="flex items-center space-x-2">
          <div className="text-2xl font-bold">
            <span className="text-primary">Predator</span>{' '}
            <span className="text-foreground">E-Sports</span>
          </div>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <Button variant="ghost" onClick={handleSignOut} className="text-foreground hover:text-primary">
              Logout
            </Button>
          ) : (
            <Button asChild variant="default">
              <Link to="/login">Login</Link>
            </Button>
          )}
        </nav>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 bg-card">
            <nav className="flex flex-col gap-4 pt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-medium text-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <Button variant="ghost" onClick={handleSignOut} className="justify-start text-foreground hover:text-primary">
                  Logout
                </Button>
              ) : (
                <Button asChild variant="default" onClick={() => setIsOpen(false)}>
                  <Link to="/login">Login</Link>
                </Button>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
