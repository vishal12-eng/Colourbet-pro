import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import AppHeader from '@/components/layout/AppHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const WithdrawPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !amount || !upiId.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    const numAmount = Number(amount);
    if (numAmount > profile.wallet_balance) {
      toast.error('Insufficient balance');
      return;
    }
    if (numAmount < 100) {
      toast.error('Minimum withdrawal is ₹100');
      return;
    }
    setLoading(true);
    try {
      const { error: wError } = await supabase.from('withdrawals').insert({
        user_id: user.id,
        amount: numAmount,
        upi_id: upiId.trim(),
      });
      if (wError) throw wError;
      const { error: pError } = await supabase
        .from('profiles')
        .update({ wallet_balance: profile.wallet_balance - numAmount })
        .eq('id', user.id);
      if (pError) throw pError;
      await refreshProfile();
      toast.success('Withdrawal request submitted!');
      setAmount('');
      setUpiId('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <AppHeader />
      <div className="flex-1 w-full max-w-lg mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4 safe-bottom">
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground">Withdraw</h2>
        <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-card">
          <p className="text-xs sm:text-sm text-muted-foreground">Available: <span className="font-heading font-bold text-foreground">₹{profile?.wallet_balance.toFixed(2) ?? '0.00'}</span></p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-4 sm:p-5 shadow-card space-y-3 sm:space-y-4">
          <div>
            <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 block">Amount (₹)</label>
            <Input type="number" min={100} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Min ₹100" className="rounded-xl h-11 sm:h-10" />
          </div>
          <div>
            <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 block">Your UPI ID</label>
            <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" className="rounded-xl h-11 sm:h-10" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-heading font-semibold">
            {loading ? 'Submitting...' : 'Request Withdrawal'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default WithdrawPage;
