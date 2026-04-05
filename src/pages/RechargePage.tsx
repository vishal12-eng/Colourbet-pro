import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import AppHeader from '@/components/layout/AppHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

const RechargePage = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('app_settings').select('value').eq('key', 'upi_id').single().then(({ data }) => {
      if (data) setUpiId(data.value);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !utr.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('payments').insert({
        user_id: user.id,
        amount: Number(amount),
        utr: utr.trim(),
      });
      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          toast.error('This UTR has already been used');
        } else throw error;
        return;
      }
      toast.success('Payment submitted! Waiting for admin approval.');
      setAmount('');
      setUtr('');
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
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground">Recharge Wallet</h2>

        <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-card">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">Send money to this UPI ID:</p>
          <div className="flex items-center gap-2 bg-muted rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
            <span className="font-heading font-semibold text-sm sm:text-base text-foreground flex-1 truncate">{upiId || 'Loading...'}</span>
            <button onClick={() => { navigator.clipboard.writeText(upiId); toast.success('Copied!'); }} className="flex-shrink-0 active:scale-90 transition-transform">
              <Copy className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-4 sm:p-5 shadow-card space-y-3 sm:space-y-4">
          <div>
            <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 block">Amount (₹)</label>
            <Input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500" className="rounded-xl h-11 sm:h-10" />
          </div>
          <div>
            <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 block">UTR / Transaction ID</label>
            <Input value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="Enter UTR number" className="rounded-xl h-11 sm:h-10" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-heading font-semibold">
            {loading ? 'Submitting...' : 'Submit Payment'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RechargePage;
