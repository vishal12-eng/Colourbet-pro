interface GameTimerProps {
  timeLeft: number;
  total: number;
  status: string;
}

const GameTimer = ({ timeLeft }: GameTimerProps) => {
  const isLow = timeLeft <= 5;

  return (
    <div
      className={`px-4 py-1.5 rounded-xl font-heading font-bold text-base tabular-nums border ${
        isLow
          ? 'bg-white text-red-600 border-red-300'
          : 'bg-white text-gray-900 border-gray-200'
      }`}
      style={{ minWidth: '70px', textAlign: 'center' }}
    >
      {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
    </div>
  );
};

export default GameTimer;
