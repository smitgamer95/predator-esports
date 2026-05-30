// Date and time formatting utilities

export function formatDate(dateString: string | null): string {
  if (!dateString) return 'TBA';
  
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  
  return date.toLocaleDateString('en-IN', options);
}

export function formatTime(dateString: string | null): string {
  if (!dateString) return 'TBA';
  
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  };
  
  return date.toLocaleTimeString('en-IN', options);
}

export function formatDateTime(dateString: string | null): string {
  if (!dateString) return 'TBA';
  
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
}

export function getCountdown(targetDateTime: string | null): {
  isExpired: boolean;
  isRevealTime: boolean;
  isMatchStarted: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  text: string;
} {
  if (!targetDateTime) {
    return {
      isExpired: false,
      isRevealTime: false,
      isMatchStarted: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      text: 'TBA'
    };
  }

  const now = new Date().getTime();
  const matchStart = new Date(targetDateTime).getTime();
  const revealTime = matchStart - (15 * 60 * 1000); // 15 minutes before match
  
  // Match has started
  if (now >= matchStart) {
    return {
      isExpired: true,
      isRevealTime: true,
      isMatchStarted: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      text: 'Match Started'
    };
  }

  // Reveal time reached (15 min before match)
  if (now >= revealTime) {
    return {
      isExpired: false,
      isRevealTime: true,
      isMatchStarted: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      text: 'Match Starting Soon'
    };
  }

  // Countdown to reveal time
  const difference = revealTime - now;

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  let text = '';
  if (days > 0) {
    text = `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    text = `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    text = `${minutes}m ${seconds}s`;
  } else {
    text = `${seconds}s`;
  }

  return {
    isExpired: false,
    isRevealTime: false,
    isMatchStarted: false,
    days,
    hours,
    minutes,
    seconds,
    text
  };
}

export function isRegistrationClosed(startDateTime: string | null): boolean {
  if (!startDateTime) return false;
  
  const now = new Date().getTime();
  const start = new Date(startDateTime).getTime();
  
  return now >= start;
}
