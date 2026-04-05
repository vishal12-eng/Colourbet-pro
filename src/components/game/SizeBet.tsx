import { motion } from 'framer-motion';

interface SizeBetProps {
  selected: string | null;
  onSelect: (size: string) => void;
  disabled: boolean;
}

const SizeBet = ({ selected, onSelect, disabled }: SizeBetProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.35 }}
      className="glass rounded-2xl p-4 shadow-card"
    >
      <p className="text-[10px] font-body text-muted-foreground mb-3 uppercase tracking-widest">Big / Small · 2x payout</p>
      <div className="grid grid-cols-2 gap-3">
        {(['small', 'big'] as const).map((size) => (
          <motion.button
            key={size}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => onSelect(size)}
            disabled={disabled}
            className={`h-12 rounded-xl font-heading font-semibold text-sm transition-all ${
              selected === size
                ? 'gradient-primary text-white shadow-glow'
                : 'bg-white/5 border border-white/10 text-foreground hover:bg-white/10'
            } disabled:opacity-30`}
          >
            {size === 'small' ? 'Small (0–4)' : 'Big (5–9)'}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default SizeBet;
