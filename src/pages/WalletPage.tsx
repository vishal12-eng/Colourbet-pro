import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AppHeader from '@/components/layout/AppHeader';

interface Transaction {
  id: string;
  type: 'payment' | 'withdrawal';
  amount: number;
  status: string;
  created_at: string;
  detail: string;
}

const WalletPage = () => {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const [{ data: payments }, { data: withdrawals }] = await Promise.all([
        supabase.from('payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('withdrawals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      const txns: Transaction[] = [
        ...(payments ?? []).map((p: any) => ({
          id: p.id, type: 'payment' as const, amount: p.amount, status: p.status,
          created_at: p.created_at, detail: `UTR: ${p.utr}`,
        })),
        ...(withdrawals ?? []).map((w: any) => ({
          id: w.id, type: 'withdrawal' as const, amount: w.amount, status: w.status,
          created_at: w.created_at, detail: `UPI: ${w.upi_id}`,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTransactions(txns);
    };
    fetchAll();
  }, [user]);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <AppHeader />
      <div className="flex-1 w-full max-w-lg mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4 safe-bottom">
        <div className="gradient-primary rounded-2xl p-4 sm:p-5 shadow-elevated">
          <p className="text-primary-foreground/70 text-xs sm:text-sm font-body">Total Balance</p>
          <p className="text-2xl sm:text-3xl font-heading font-bold text-primary-foreground">₹{profile?.wallet_balance.toFixed(2) ?? '0.00'}</p>
        </div>

        <div className="bg-card rounded-2xl p-3 sm:p-4 shadow-card">
          <h3 className="font-heading font-semibold text-foreground text-sm sm:text-base mb-2 sm:mb-3">Transaction History</h3>
          {transactions.length === 0 ? (
            <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">No transactions yet</p>
          ) : (
            <div className="space-y-1.5 sm:space-y-2 max-h-[60vh] overflow-y-auto">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-1.5 sm:py-2 border-b border-border last:border-0 gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-heading font-medium text-foreground capitalize">{t.type}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{t.detail}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs sm:text-sm font-heading font-bold ${t.type === 'payment' ? 'text-success' : 'text-destructive'}`}>
                      {t.type === 'payment' ? '+' : '-'}₹{t.amount}
                    </p>
                    <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                      t.status === 'approved' ? 'bg-success/10 text-success' :
                      t.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
