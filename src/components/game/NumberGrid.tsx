import { motion } from 'framer-motion';

interface NumberGridProps {
  selected: string | null;
  onSelect: (num: string) => void;
  disabled: boolean;
}

const getNumberStyle = (n: number) => {
  if (n === 0 || n === 5) return 'bg-gradient-to-br from-game-violet to-accent text-white shadow-[0_0_12px_hsla(263,70%,50%,0.3)]';
  if ([1, 3, 7, 9].includes(n)) return 'bg-gradient-to-br from-game-green to-success text-white shadow-[0_0_12px_hsla(142,71%,45%,0.2)]';
  return 'bg-gradient-to-br from-game-red to-destructive text-white shadow-[0_0_12px_hsla(0,84%,60%,0.2)]';
};

const NumberGrid = ({ selected, onSelect, disabled }: NumberGridProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35 }}
      className="glass rounded-2xl p-4 shadow-card"
    >
      <p className="text-[10px] font-body text-muted-foreground mb-3 uppercase tracking-widest">Number Bet · 9x payout</p>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 10 }, (_, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => onSelect(String(i))}
            disabled={disabled}
            className={`w-full aspect-square rounded-full font-heading font-bold text-lg transition-all ${getNumberStyle(i)} ${
              selected === String(i) ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-card scale-110' : ''
            } disabled:opacity-30`}
          >
            {i}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default NumberGrid;
