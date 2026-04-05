import { motion } from 'framer-motion';

interface GameTimerProps {
  timeLeft: number;
  total: number;
  status: string;
}

const GameTimer = ({ timeLeft, total, status }: GameTimerProps) => {
  const progress = total > 0 ? (timeLeft / total) * 100 : 0;
  const isLow = timeLeft <= 5;
  const circumference = 2 * Math.PI * 44;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="hsla(215, 20%, 95%, 0.06)" strokeWidth="6" />
          <motion.circle
            cx="50" cy="50" r="44" fill="none"
            stroke={isLow ? 'hsl(0, 84%, 60%)' : 'hsl(217, 91%, 60%)'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        </svg>
        <div className={`text-3xl font-heading font-bold tabular-nums ${isLow ? 'text-destructive animate-count-pulse' : 'text-foreground'}`}>
          {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
      </div>
      <span className={`text-xs font-body uppercase tracking-widest px-3 py-1 rounded-full ${
        status === 'open' ? (isLow ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary') :
        status === 'closed' ? 'bg-warning/10 text-warning' :
        status === 'completed' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
      }`}>
        {status === 'open' ? (isLow ? 'Closing soon' : 'Betting open') :
         status === 'closed' ? 'Calculating...' :
         status === 'completed' ? 'Round complete' : 'Waiting'}
      </span>
    </div>
  );
};

export default GameTimer;
