import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AppHeader from '@/components/layout/AppHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminPage = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bets, setBets] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [upiId, setUpiId] = useState('');
  const [overrideResult, setOverrideResult] = useState('');
  const [stats, setStats] = useState({ totalUsers: 0, totalBets: 0, totalRevenue: 0 });

  useEffect(() => {
    if (!loading && !isAdmin) { navigate('/'); return; }
    if (isAdmin) fetchAll();
  }, [isAdmin, loading]);

  const fetchAll = async () => {
    const [pRes, wRes, uRes, bRes, rRes, sRes] = await Promise.all([
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
      supabase.from('withdrawals').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('bets').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('rounds').select('*').order('round_number', { ascending: false }).limit(20),
      supabase.from('app_settings').select('*').eq('key', 'upi_id').single(),
    ]);
    setPayments(pRes.data ?? []);
    setWithdrawals(wRes.data ?? []);
    setUsers(uRes.data ?? []);
    setBets(bRes.data ?? []);
    setRounds(rRes.data ?? []);
    if (sRes.data) setUpiId(sRes.data.value);
    const totalUsers = (uRes.data ?? []).length;
    const totalBets = (bRes.data ?? []).length;
    const totalRevenue = (bRes.data ?? []).reduce((sum: number, b: any) => sum + Number(b.amount) - Number(b.payout), 0);
    setStats({ totalUsers, totalBets, totalRevenue });
  };

  const handlePayment = async (id: string, action: 'approved' | 'rejected') => {
    const payment = payments.find(p => p.id === id);
    if (!payment) return;
    const { error } = await supabase.from('payments').update({ status: action }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    if (action === 'approved') {
      const user = users.find(u => u.id === payment.user_id);
      if (user) {
        await supabase.from('profiles').update({
          wallet_balance: Number(user.wallet_balance) + Number(payment.amount)
        }).eq('id', payment.user_id);
      }
    }
    toast.success(`Payment ${action}`);
    fetchAll();
  };

  const handleWithdrawal = async (id: string, action: 'approved' | 'rejected') => {
    const withdrawal = withdrawals.find(w => w.id === id);
    if (!withdrawal) return;
    const { error } = await supabase.from('withdrawals').update({ status: action }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    if (action === 'rejected') {
      const user = users.find(u => u.id === withdrawal.user_id);
      if (user) {
        await supabase.from('profiles').update({
          wallet_balance: Number(user.wallet_balance) + Number(withdrawal.amount)
        }).eq('id', withdrawal.user_id);
      }
    }
    toast.success(`Withdrawal ${action}`);
    fetchAll();
  };

  const updateUpi = async () => {
    const { error } = await supabase.from('app_settings').update({ value: upiId }).eq('key', 'upi_id');
    if (error) toast.error(error.message);
    else toast.success('UPI ID updated');
  };

  const setOverride = async () => {
    const openRound = rounds.find(r => r.status === 'open');
    if (!openRound) { toast.error('No open round'); return; }
    const result = Number(overrideResult);
    if (isNaN(result) || result < 0 || result > 9) { toast.error('Invalid result (0-9)'); return; }
    const { error } = await supabase.from('rounds').update({
      result, status: 'completed', ended_at: new Date().toISOString()
    }).eq('id', openRound.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Round result set to ${result}`);
      setOverrideResult('');
      fetchAll();
    }
  };

  if (loading) return <div className="min-h-[100dvh] bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <AppHeader />
      <div className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4 safe-bottom">
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground">Admin Panel</h2>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: 'Users', value: stats.totalUsers },
            { label: 'Total Bets', value: stats.totalBets },
            { label: 'Revenue', value: `₹${stats.totalRevenue.toFixed(0)}` },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-2xl p-3 sm:p-4 shadow-card text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg sm:text-2xl font-heading font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="payments">
          <TabsList className="w-full overflow-x-auto flex">
            <TabsTrigger value="payments" className="flex-1 text-xs sm:text-sm">Payments</TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex-1 text-xs sm:text-sm">Withdraw</TabsTrigger>
            <TabsTrigger value="users" className="flex-1 text-xs sm:text-sm">Users</TabsTrigger>
            <TabsTrigger value="bets" className="flex-1 text-xs sm:text-sm">Bets</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 text-xs sm:text-sm">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="bg-card rounded-2xl p-3 sm:p-4 shadow-card mt-3">
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-border gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-heading font-medium text-foreground">₹{p.amount}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">UTR: {p.utr}</p>
                  </div>
                  {p.status === 'pending' ? (
                    <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                      <Button size="sm" variant="default" onClick={() => handlePayment(p.id, 'approved')} className="rounded-lg text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3">Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => handlePayment(p.id, 'rejected')} className="rounded-lg text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3">Reject</Button>
                    </div>
                  ) : (
                    <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-lg flex-shrink-0 ${p.status === 'approved' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {p.status}
                    </span>
                  )}
                </div>
              ))}
              {payments.length === 0 && <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">No payments</p>}
            </div>
          </TabsContent>

          <TabsContent value="withdrawals" className="bg-card rounded-2xl p-3 sm:p-4 shadow-card mt-3">
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {withdrawals.map((w) => (
                <div key={w.id} className="flex items-center justify-between py-2 border-b border-border gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-heading font-medium text-foreground">₹{w.amount}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">UPI: {w.upi_id}</p>
                  </div>
                  {w.status === 'pending' ? (
                    <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                      <Button size="sm" variant="default" onClick={() => handleWithdrawal(w.id, 'approved')} className="rounded-lg text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3">Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleWithdrawal(w.id, 'rejected')} className="rounded-lg text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3">Reject</Button>
                    </div>
                  ) : (
                    <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-lg flex-shrink-0 ${w.status === 'approved' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {w.status}
                    </span>
                  )}
                </div>
              ))}
              {withdrawals.length === 0 && <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">No withdrawals</p>}
            </div>
          </TabsContent>

          <TabsContent value="users" className="bg-card rounded-2xl p-3 sm:p-4 shadow-card mt-3">
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-border">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-heading font-medium text-foreground truncate">{u.name || 'No name'}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{u.phone}</p>
                  </div>
                  <span className="text-xs sm:text-sm font-heading font-bold text-foreground flex-shrink-0 ml-2">₹{Number(u.wallet_balance).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bets" className="bg-card rounded-2xl p-3 sm:p-4 shadow-card mt-3">
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {bets.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-2 border-b border-border">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-heading font-medium text-foreground capitalize truncate">{b.bet_type}: {b.bet_value}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">₹{b.amount}</p>
                  </div>
                  <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-lg flex-shrink-0 ml-2 ${
                    b.status === 'won' ? 'bg-success/10 text-success' :
                    b.status === 'lost' ? 'bg-destructive/10 text-destructive' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
              {bets.length === 0 && <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">No bets</p>}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="bg-card rounded-2xl p-3 sm:p-4 shadow-card mt-3 space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 block">UPI ID for Payments</label>
              <div className="flex gap-2">
                <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} className="rounded-xl h-11 sm:h-10" />
                <Button onClick={updateUpi} className="rounded-xl h-11 sm:h-10 flex-shrink-0">Save</Button>
              </div>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 block">Override Round Result (0-9)</label>
              <div className="flex gap-2">
                <Input type="number" min={0} max={9} value={overrideResult} onChange={(e) => setOverrideResult(e.target.value)} className="rounded-xl h-11 sm:h-10" placeholder="0-9" />
                <Button onClick={setOverride} variant="destructive" className="rounded-xl h-11 sm:h-10 flex-shrink-0">Set</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
