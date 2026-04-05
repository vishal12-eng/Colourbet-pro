import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface Bet {
  id: string;
  amount: number;
  bet_type: string;
  bet_value: string;
  payout: number;
  status: string;
  created_at: string;
}

const BetHistory = () => {
  const { user } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('bets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setBets(data as Bet[]);
      });
  }, [user]);

  if (bets.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.35 }}
      className="glass rounded-2xl p-4 shadow-card"
    >
      <h3 className="font-heading font-semibold text-foreground text-sm mb-3">My Bets</h3>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {bets.map((bet) => (
          <div key={bet.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                bet.status === 'won' ? 'bg-success/15' : bet.status === 'lost' ? 'bg-destructive/15' : 'bg-muted'
              }`}>
                {bet.status === 'won' ? <TrendingUp className="w-3.5 h-3.5 text-success" /> :
                 bet.status === 'lost' ? <TrendingDown className="w-3.5 h-3.5 text-destructive" /> :
                 <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-heading font-medium text-foreground capitalize block truncate">
                  {bet.bet_type}: {bet.bet_value}
                </span>
                <p className="text-[10px] text-muted-foreground">₹{bet.amount}</p>
              </div>
            </div>
            <span className={`text-xs font-heading font-bold px-2.5 py-1 rounded-lg flex-shrink-0 ml-2 ${
              bet.status === 'won' ? 'bg-success/10 text-success' :
              bet.status === 'lost' ? 'bg-destructive/10 text-destructive' :
              'bg-white/5 text-muted-foreground'
            }`}>
              {bet.status === 'won' ? `+₹${bet.payout}` : bet.status === 'lost' ? 'Lost' : 'Pending'}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default BetHistory;
