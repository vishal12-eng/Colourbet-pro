import { motion } from 'framer-motion';

interface ColorButtonsProps {
  selected: string | null;
  onSelect: (color: string) => void;
  disabled: boolean;
}

const colors = [
  { name: 'green', label: 'Green', cls: 'game-btn-green' },
  { name: 'violet', label: 'Violet', cls: 'game-btn-violet' },
  { name: 'red', label: 'Red', cls: 'game-btn-red' },
];

const ColorButtons = ({ selected, onSelect, disabled }: ColorButtonsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.35 }}
      className="glass rounded-2xl p-4 shadow-card"
    >
      <p className="text-[10px] font-body text-muted-foreground mb-3 uppercase tracking-widest">Color Bet · 2x payout</p>
      <div className="grid grid-cols-3 gap-3">
        {colors.map((c) => (
          <motion.button
            key={c.name}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.04 }}
            onClick={() => onSelect(c.name)}
            disabled={disabled}
            className={`${c.cls} h-12 text-sm ${selected === c.name ? 'ring-2 ring-white/30 ring-offset-2 ring-offset-card scale-105' : ''} disabled:opacity-30`}
          >
            {c.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default ColorButtons;
