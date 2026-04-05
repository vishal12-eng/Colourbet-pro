import { Plus, ArrowUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';

interface WalletCardProps {
  balance: number;
}

const WalletCard = ({ balance }: WalletCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="glass rounded-2xl p-5 shadow-elevated">
      {/* Top row: icon + label */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Wallet className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-muted-foreground font-body text-sm">Wallet Balance</span>
      </div>

      {/* Balance */}
      <p className="text-3xl font-heading font-bold text-foreground mb-4 tracking-tight">
        ₹{balance.toFixed(2)}
      </p>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/recharge')}
          className="flex-1 h-12 rounded-xl border border-border bg-secondary/60 text-foreground font-heading font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Recharge
        </button>
        <button
          onClick={() => navigate('/withdraw')}
          className="flex-1 h-12 rounded-xl border border-border bg-secondary/60 text-foreground font-heading font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
        >
          <ArrowUp className="w-4 h-4" />
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default WalletCard;
