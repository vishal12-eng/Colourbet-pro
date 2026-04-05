import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Shield, Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AppHeader = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const iconBtn = "p-2 rounded-xl text-foreground/60 hover:text-foreground hover:bg-white/5 transition-all duration-200 active:scale-90";

  return (
    <header className="glass sticky top-0 z-50 safe-top border-b border-white/5">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="font-heading font-bold text-lg text-foreground">
          Color<span className="text-warning">Bet</span> <span className="text-muted-foreground text-sm font-medium">Pro</span>
        </Link>
        <div className="flex items-center gap-0.5">
          <button onClick={() => navigate('/recharge')} className={iconBtn}><ArrowDownCircle className="w-5 h-5" /></button>
          <button onClick={() => navigate('/withdraw')} className={iconBtn}><ArrowUpCircle className="w-5 h-5" /></button>
          <button onClick={() => navigate('/wallet')} className={iconBtn}><Wallet className="w-5 h-5" /></button>
          {isAdmin && <button onClick={() => navigate('/admin')} className={iconBtn}><Shield className="w-5 h-5" /></button>}
          <button onClick={signOut} className={iconBtn}><LogOut className="w-5 h-5" /></button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
