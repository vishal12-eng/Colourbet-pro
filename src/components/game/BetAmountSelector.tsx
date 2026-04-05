import { Dice5 } from 'lucide-react';

interface BetAmountSelectorProps {
  amount: number;
  onChange: (amount: number) => void;
}

const multipliers = [
  { label: 'X1', value: 1 },
  { label: 'X5', value: 5 },
  { label: 'X10', value: 10 },
  { label: 'X50', value: 50 },
  { label: 'X500', value: 500 },
  { label: 'X1K', value: 1000 },
];

const BetAmountSelector = ({ amount, onChange }: BetAmountSelectorProps) => {
  const handleRandom = () => {
    const values = [1, 5, 10, 50, 100, 500, 1000, 2000];
    onChange(values[Math.floor(Math.random() * values.length)]);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-6 gap-2">
        {multipliers.map((m) => (
          <button
            key={m.label}
            onClick={() => onChange(m.value)}
            className={`h-10 rounded-xl font-heading font-semibold text-xs transition-all active:scale-95 ${
              amount === m.value
                ? 'bg-white text-primary shadow-lg'
                : 'bg-white/10 border border-white/15 text-foreground hover:bg-white/20'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onChange(2000)}
          className={`h-11 rounded-xl font-heading font-semibold text-sm transition-all active:scale-95 ${
            amount === 2000
              ? 'bg-white text-primary shadow-lg'
              : 'bg-white/10 border border-white/15 text-foreground hover:bg-white/20'
          }`}
        >
          X2K
        </button>
        <button
          onClick={handleRandom}
          className="h-11 rounded-xl font-heading font-semibold text-sm transition-all active:scale-95 gradient-play text-white shadow-[0_0_16px_hsla(38,92%,50%,0.25)]"
        >
          <span className="flex items-center justify-center gap-2">
            <Dice5 className="w-4 h-4" />
            Random
          </span>
        </button>
      </div>
    </div>
  );
};

export default BetAmountSelector;
