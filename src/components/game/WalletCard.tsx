import { Wallet, Plus, ArrowUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface WalletCardProps {
  balance: number;
}

const WalletCard = ({ balance }: WalletCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass rounded-2xl p-5 shadow-elevated animate-float"
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <span className="text-muted-foreground font-body text-sm">Wallet Balance</span>
      </div>
      <p className="text-3xl font-heading font-bold text-foreground mb-4 tracking-tight">
        ₹{balance.toFixed(2)}
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/recharge')}
          className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 text-foreground font-heading font-semibold text-sm hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Recharge
        </button>
        <button
          onClick={() => navigate('/withdraw')}
          className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 text-foreground font-heading font-semibold text-sm hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-1.5"
        >
          <ArrowUp className="w-4 h-4" /> Withdraw
        </button>
      </div>
    </motion.div>
  );
};

export default WalletCard;
