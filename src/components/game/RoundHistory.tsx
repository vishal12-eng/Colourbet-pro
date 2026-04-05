import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface RoundResult {
  id: string;
  round_number: number;
  result: number | null;
  status: string;
}

const getResultColor = (num: number) => {
  if (num === 0 || num === 5) return 'bg-game-violet/20 text-game-violet border-game-violet/30';
  if ([1, 3, 7, 9].includes(num)) return 'bg-game-green/20 text-game-green border-game-green/30';
  return 'bg-game-red/20 text-game-red border-game-red/30';
};

const RoundHistory = () => {
  const [rounds, setRounds] = useState<RoundResult[]>([]);

  useEffect(() => {
    supabase
      .from('rounds')
      .select('id, round_number, result, status')
      .eq('status', 'completed')
      .order('started_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setRounds(data as RoundResult[]);
      });
  }, []);

  if (rounds.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28, duration: 0.35 }}
      className="glass rounded-2xl p-4 shadow-card"
    >
      <h3 className="font-heading font-semibold text-foreground text-sm mb-3">Recent Results</h3>
      <div className="flex gap-2 flex-wrap">
        {rounds.map((r) => (
          <div
            key={r.id}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-sm border ${
              r.result !== null ? getResultColor(r.result) : 'bg-muted text-muted-foreground'
            }`}
          >
            {r.result ?? '—'}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default RoundHistory;
