interface SizeBetProps {
  selected: string | null;
  onSelect: (size: string) => void;
  disabled: boolean;
}

const SizeBet = ({ selected, onSelect, disabled }: SizeBetProps) => {
  return (
    <div className="flex rounded-2xl overflow-hidden border border-white/15 h-12">
      <button
        onClick={() => onSelect('big')}
        disabled={disabled}
        className={`flex-1 font-heading font-bold text-sm transition-all active:scale-97 ${
          selected === 'big'
            ? 'gradient-play text-white shadow-glow'
            : 'bg-gradient-to-r from-amber-500/20 to-amber-400/10 text-amber-300 hover:from-amber-500/30'
        } disabled:opacity-30`}
      >
        Big
      </button>
      <button
        onClick={() => onSelect('small')}
        disabled={disabled}
        className={`flex-1 font-heading font-bold text-sm transition-all active:scale-97 ${
          selected === 'small'
            ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-white shadow-glow'
            : 'bg-gradient-to-r from-sky-500/20 to-sky-400/10 text-sky-300 hover:from-sky-500/30'
        } disabled:opacity-30`}
      >
        Small
      </button>
    </div>
  );
};

export default SizeBet;
