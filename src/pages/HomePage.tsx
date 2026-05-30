import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-balance text-5xl font-bold text-foreground md:text-6xl">
          Welcome to <span className="text-primary">Predator E-Sports</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
          Join the ultimate Free Fire tournament platform. Compete, win prizes, and become a champion.
        </p>
        {!user ? (
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="text-base">
              <Link to="/login">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link to="/tournaments">View Tournaments</Link>
            </Button>
          </div>
        ) : (
          <Button asChild size="lg" className="text-base">
            <Link to="/tournaments">Browse Tournaments</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="h-full border-border bg-card">
          <CardHeader>
            <Trophy className="mb-2 h-12 w-12 text-primary" />
            <CardTitle className="text-balance">Competitive Tournaments</CardTitle>
            <CardDescription className="text-pretty">
              Participate in exciting Free Fire tournaments with amazing prize pools
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="h-full border-border bg-card">
          <CardHeader>
            <Users className="mb-2 h-12 w-12 text-primary" />
            <CardTitle className="text-balance">Join the Community</CardTitle>
            <CardDescription className="text-pretty">
              Connect with players, form squads, and compete together
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="h-full border-border bg-card">
          <CardHeader>
            <Zap className="mb-2 h-12 w-12 text-primary" />
            <CardTitle className="text-balance">Fast & Secure</CardTitle>
            <CardDescription className="text-pretty">
              Quick registration, secure payments, and instant tournament updates
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-16">
        <Card className="border-primary/20 bg-card">
          <CardHeader>
            <CardTitle className="text-balance text-2xl">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-primary">1</div>
                <h3 className="mb-1 text-balance font-semibold">Register</h3>
                <p className="text-pretty text-sm text-muted-foreground">Create your account and complete your profile</p>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-primary">2</div>
                <h3 className="mb-1 text-balance font-semibold">Choose Tournament</h3>
                <p className="text-pretty text-sm text-muted-foreground">Browse and select your preferred tournament</p>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-primary">3</div>
                <h3 className="mb-1 text-balance font-semibold">Pay Entry Fee</h3>
                <p className="text-pretty text-sm text-muted-foreground">Complete payment and upload screenshot</p>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-primary">4</div>
                <h3 className="mb-1 text-balance font-semibold">Compete & Win</h3>
                <p className="text-pretty text-sm text-muted-foreground">Play the tournament and win prizes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
