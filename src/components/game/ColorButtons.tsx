interface ColorButtonsProps {
  selected: string | null;
  onSelect: (color: string) => void;
  disabled: boolean;
}

const colors = [
  { name: 'green', label: 'Green', bg: 'bg-game-green hover:bg-game-green/90' },
  { name: 'violet', label: 'Violet', bg: 'bg-game-violet hover:bg-game-violet/90' },
  { name: 'red', label: 'Red', bg: 'bg-game-red hover:bg-game-red/90' },
];

const ColorButtons = ({ selected, onSelect, disabled }: ColorButtonsProps) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {colors.map((c) => (
        <button
          key={c.name}
          onClick={() => onSelect(c.name)}
          disabled={disabled}
          className={`${c.bg} h-12 rounded-xl text-white font-heading font-bold text-sm transition-all active:scale-95 ${
            selected === c.name ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-primary shadow-lg scale-105' : ''
          } disabled:opacity-30`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
};

export default ColorButtons;
