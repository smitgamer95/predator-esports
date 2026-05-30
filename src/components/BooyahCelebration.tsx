import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BooyahCelebrationProps {
  position: 1 | 2 | 3;
  playerName: string;
  onClose: () => void;
}

export default function BooyahCelebration({ position, playerName, onClose }: BooyahCelebrationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    
    // Trigger confetti
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const getPositionData = () => {
    switch (position) {
      case 1:
        return {
          emoji: '🥇',
          title: 'BOOYAH!',
          subtitle: '1st Place Winner',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500',
        };
      case 2:
        return {
          emoji: '🥈',
          title: 'AMAZING!',
          subtitle: '2nd Place Winner',
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/20',
          borderColor: 'border-gray-400',
        };
      case 3:
        return {
          emoji: '🥉',
          title: 'GREAT JOB!',
          subtitle: '3rd Place Winner',
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/20',
          borderColor: 'border-orange-500',
        };
    }
  };

  const data = getPositionData();

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <Card className={`w-full max-w-md border-4 ${data.borderColor} ${data.bgColor} ${show ? 'animate-in zoom-in-95' : ''}`}>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          {/* Trophy Icon */}
          <div className="relative mb-6">
            <Trophy className={`h-24 w-24 ${data.color} animate-bounce`} />
            <Sparkles className={`absolute -right-2 -top-2 h-8 w-8 ${data.color} animate-pulse`} />
            <Sparkles className={`absolute -left-2 -bottom-2 h-8 w-8 ${data.color} animate-pulse`} />
          </div>

          {/* Emoji */}
          <div className="mb-4 text-8xl animate-bounce">
            {data.emoji}
          </div>

          {/* Title */}
          <h1 className={`mb-2 text-balance text-5xl font-bold ${data.color} animate-pulse`}>
            {data.title}
          </h1>

          {/* Subtitle */}
          <p className="mb-4 text-2xl font-semibold text-foreground">
            {data.subtitle}
          </p>

          {/* Player Name */}
          <p className="mb-6 text-xl text-muted-foreground">
            Congratulations, <span className="font-bold text-foreground">{playerName}</span>!
          </p>

          {/* Close Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={onClose}
          >
            Awesome! 🎉
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
