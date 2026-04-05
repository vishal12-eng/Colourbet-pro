import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

interface BetAmountSelectorProps {
  amount: number;
  onChange: (amount: number) => void;
}

const presets = [10, 50, 100, 500];

const BetAmountSelector = ({ amount, onChange }: BetAmountSelectorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.35 }}
      className="glass rounded-2xl p-4 shadow-card"
    >
      <p className="text-[10px] font-body text-muted-foreground mb-3 uppercase tracking-widest">Bet Amount</p>
      <div className="flex items-center gap-3 mb-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(Math.max(10, amount - 10))}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-foreground hover:bg-white/10 transition-all"
        >
          <Minus className="w-4 h-4" />
        </motion.button>
        <div className="flex-1 text-center">
          <span className="text-2xl font-heading font-bold text-foreground">₹{amount}</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(amount + 10)}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-foreground hover:bg-white/10 transition-all"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {presets.map((p) => (
          <motion.button
            key={p}
            whileTap={{ scale: 0.92 }}
            onClick={() => onChange(p)}
            className={`h-9 rounded-xl font-heading font-semibold text-xs transition-all ${
              amount === p
                ? 'gradient-primary text-white shadow-glow'
                : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-foreground'
            }`}
          >
            ₹{p}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default BetAmountSelector;
