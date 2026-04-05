import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import WalletCard from '@/components/game/WalletCard';
import GameTimer from '@/components/game/GameTimer';
import ColorButtons from '@/components/game/ColorButtons';
import NumberGrid from '@/components/game/NumberGrid';
import SizeBet from '@/components/game/SizeBet';
import BetAmountSelector from '@/components/game/BetAmountSelector';
import BetHistory from '@/components/game/BetHistory';
import RoundHistory from '@/components/game/RoundHistory';
import AppHeader from '@/components/layout/AppHeader';

interface Round {
  id: string;
  round_number: number;
  result: number | null;
  status: string;
  duration: number;
  started_at: string;
}

const GamePage = () => {
  const { profile, refreshProfile } = useAuth();
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [selectedBet, setSelectedBet] = useState<{ type: string; value: string } | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [placing, setPlacing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCurrentRound = useCallback(async () => {
    const { data } = await supabase
      .from('rounds')
      .select('*')
      .in('status', ['open', 'closed', 'completed'])
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setCurrentRound(data as Round);
      if (data.status === 'completed') {
        await supabase.functions.invoke('game-engine', { body: { action: 'create-round' } });
      }
    } else {
      await supabase.functions.invoke('game-engine', { body: { action: 'create-round' } });
    }
  }, []);

  const closeRoundRef = useRef(false);
  useEffect(() => {
    if (timeLeft === 0 && currentRound?.status === 'open' && !closeRoundRef.current) {
      closeRoundRef.current = true;
      supabase.functions.invoke('game-engine', { body: { action: 'close-round' } }).then(() => {
        closeRoundRef.current = false;
        setTimeout(() => fetchCurrentRound(), 2000);
      });
    }
  }, [timeLeft, currentRound, fetchCurrentRound]);

  useEffect(() => {
    fetchCurrentRound();
    const channel = supabase
      .channel('rounds-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rounds' }, () => {
        fetchCurrentRound();
        refreshProfile();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchCurrentRound, refreshProfile]);

  useEffect(() => {
    if (!currentRound) return;
    const calcTimeLeft = () => {
      const started = new Date(currentRound.started_at).getTime();
      const endsAt = started + currentRound.duration * 1000;
      const remaining = Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0 && timerRef.current) clearInterval(timerRef.current);
    };
    calcTimeLeft();
    timerRef.current = setInterval(calcTimeLeft, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentRound]);

  const placeBet = async () => {
    if (!selectedBet || !currentRound || !profile) return;
    if (currentRound.status !== 'open' || timeLeft <= 5) {
      toast.error('Betting is closed for this round');
      return;
    }
    if (betAmount > profile.wallet_balance) {
      toast.error('Insufficient balance');
      return;
    }
    setPlacing(true);
    try {
      const { error: betError } = await supabase.from('bets').insert({
        user_id: profile.id,
        round_id: currentRound.id,
        amount: betAmount,
        bet_type: selectedBet.type,
        bet_value: selectedBet.value,
      });
      if (betError) throw betError;
      const { error: walletError } = await supabase
        .from('profiles')
        .update({ wallet_balance: profile.wallet_balance - betAmount })
        .eq('id', profile.id);
      if (walletError) throw walletError;
      await refreshProfile();
      toast.success(`Bet placed: ₹${betAmount} on ${selectedBet.value}`);
      setSelectedBet(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to place bet');
    } finally {
      setPlacing(false);
    }
  };

  const getResultColor = (num: number) => {
    if (num === 0 || num === 5) return 'violet';
    if ([1, 3, 7, 9].includes(num)) return 'green';
    return 'red';
  };

  const bettingDisabled = !currentRound || currentRound.status !== 'open' || timeLeft <= 5;

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <AppHeader />
      <div className="flex-1 w-full max-w-lg mx-auto px-4 pb-8 pt-4 space-y-4 safe-bottom">
        <WalletCard balance={profile?.wallet_balance ?? 0} />

        {/* Round & Timer */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
          className="glass rounded-2xl p-5 shadow-card"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-body text-muted-foreground">
              Round #{currentRound?.round_number ?? '—'}
            </span>
            {currentRound?.status === 'completed' && currentRound.result !== null && (
              <span className={`text-xs font-heading font-bold px-3 py-1 rounded-full ${
                getResultColor(currentRound.result) === 'green' ? 'bg-game-green/15 text-game-green' :
                getResultColor(currentRound.result) === 'red' ? 'bg-game-red/15 text-game-red' :
                'bg-game-violet/15 text-game-violet'
              }`}>
                Result: {currentRound.result}
              </span>
            )}
          </div>
          <GameTimer
            timeLeft={timeLeft}
            total={currentRound?.duration ?? 30}
            status={currentRound?.status ?? 'waiting'}
          />
        </motion.div>

        <ColorButtons
          selected={selectedBet?.type === 'color' ? selectedBet.value : null}
          onSelect={(color) => setSelectedBet({ type: 'color', value: color })}
          disabled={bettingDisabled}
        />

        <NumberGrid
          selected={selectedBet?.type === 'number' ? selectedBet.value : null}
          onSelect={(num) => setSelectedBet({ type: 'number', value: num })}
          disabled={bettingDisabled}
        />

        <SizeBet
          selected={selectedBet?.type === 'size' ? selectedBet.value : null}
          onSelect={(size) => setSelectedBet({ type: 'size', value: size })}
          disabled={bettingDisabled}
        />

        <BetAmountSelector amount={betAmount} onChange={setBetAmount} />

        {selectedBet && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.96 }}
            onClick={placeBet}
            disabled={placing || bettingDisabled}
            className="w-full h-14 gradient-play text-white font-heading font-bold text-lg rounded-2xl shadow-[0_0_24px_hsla(38,92%,50%,0.3)] transition-all disabled:opacity-40 disabled:scale-100"
          >
            {placing ? 'Placing...' : `Place Bet — ₹${betAmount}`}
          </motion.button>
        )}

        <RoundHistory />
        <BetHistory />
      </div>
    </div>
  );
};

export default GamePage;
