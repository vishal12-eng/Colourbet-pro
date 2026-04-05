import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ROUND_DURATION = 30;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { action, result: overrideResult } = await req.json().catch(() => ({ action: 'tick' }));

    if (action === 'create-round') {
      // Get next round number
      const { data: seqData } = await supabase.rpc('nextval_round', {});
      const roundNumber = seqData ?? Date.now();

      const { data: round, error } = await supabase.from('rounds').insert({
        round_number: roundNumber,
        status: 'open',
        duration: ROUND_DURATION,
      }).select().single();

      if (error) throw error;

      return new Response(JSON.stringify({ round }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'close-round') {
      // Find open round that should be closed (time elapsed)
      const { data: openRounds } = await supabase
        .from('rounds')
        .select('*')
        .eq('status', 'open')
        .order('started_at', { ascending: false })
        .limit(1);

      if (!openRounds || openRounds.length === 0) {
        return new Response(JSON.stringify({ message: 'No open round' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const round = openRounds[0];
      const elapsed = (Date.now() - new Date(round.started_at).getTime()) / 1000;

      if (elapsed < round.duration - 2) {
        return new Response(JSON.stringify({ message: 'Round still active' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate result (0-9) or use override
      const result = overrideResult !== undefined && overrideResult !== null
        ? Number(overrideResult)
        : Math.floor(Math.random() * 10);

      // Close the round
      await supabase.from('rounds').update({
        status: 'completed',
        result,
        ended_at: new Date().toISOString(),
      }).eq('id', round.id);

      // Process bets
      const { data: bets } = await supabase
        .from('bets')
        .select('*')
        .eq('round_id', round.id)
        .eq('status', 'pending');

      if (bets && bets.length > 0) {
        const getColor = (n: number) => {
          if (n === 0 || n === 5) return 'violet';
          if ([1, 3, 7, 9].includes(n)) return 'green';
          return 'red';
        };
        const getSize = (n: number) => n <= 4 ? 'small' : 'big';
        const resultColor = getColor(result);
        const resultSize = getSize(result);

        for (const bet of bets) {
          let won = false;
          let multiplier = 0;

          if (bet.bet_type === 'color' && bet.bet_value === resultColor) {
            won = true;
            multiplier = 2;
          } else if (bet.bet_type === 'number' && bet.bet_value === String(result)) {
            won = true;
            multiplier = 9;
          } else if (bet.bet_type === 'size' && bet.bet_value === resultSize) {
            won = true;
            multiplier = 2;
          }

          const payout = won ? Number(bet.amount) * multiplier : 0;

          await supabase.from('bets').update({
            status: won ? 'won' : 'lost',
            payout,
          }).eq('id', bet.id);

          if (won) {
            // Add winnings to wallet
            const { data: profile } = await supabase
              .from('profiles')
              .select('wallet_balance')
              .eq('id', bet.user_id)
              .single();

            if (profile) {
              await supabase.from('profiles').update({
                wallet_balance: Number(profile.wallet_balance) + payout,
              }).eq('id', bet.user_id);
            }
          }
        }
      }

      return new Response(JSON.stringify({ result, processed: bets?.length ?? 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
