interface NumberGridProps {
  selected: string | null;
  onSelect: (num: string) => void;
  disabled: boolean;
}

const getNumberStyle = (n: number) => {
  if (n === 0 || n === 5) return 'bg-game-violet text-white';
  if ([1, 3, 7, 9].includes(n)) return 'bg-game-green text-white';
  return 'bg-game-red text-white';
};

const NumberGrid = ({ selected, onSelect, disabled }: NumberGridProps) => {
  return (
    <div className="grid grid-cols-5 gap-2">
      {Array.from({ length: 10 }, (_, i) => (
        <button
          key={i}
          onClick={() => onSelect(String(i))}
          disabled={disabled}
          className={`w-full aspect-square rounded-full font-heading font-bold text-lg transition-all active:scale-90 ${getNumberStyle(i)} ${
            selected === String(i) ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-primary scale-110 shadow-lg' : ''
          } disabled:opacity-30`}
        >
          {i}
        </button>
      ))}
    </div>
  );
};

export default NumberGrid;
