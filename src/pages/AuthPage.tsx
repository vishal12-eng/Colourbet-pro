import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Logged in successfully!');
        navigate('/');
      } else {
        if (!name.trim() || !phone.trim()) {
          toast.error('Please fill all fields');
          return;
        }
        const { error } = await signUp(email, password, name, phone);
        if (error) throw error;
        toast.success('Account created! Please check your email to verify.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] gradient-game flex items-center justify-center p-4 safe-top safe-bottom">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-primary-foreground mb-1 sm:mb-2">
            Color<span className="text-warning">Bet</span> Pro
          </h1>
          <p className="text-primary-foreground/70 font-body text-sm sm:text-base">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <div className="bg-card rounded-2xl p-5 sm:p-6 shadow-elevated">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 block">Full Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="rounded-xl h-11 sm:h-10" />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 block">Phone Number</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" className="rounded-xl h-11 sm:h-10" />
                </div>
              </>
            )}
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 block">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="rounded-xl h-11 sm:h-10" />
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 block">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="rounded-xl h-11 sm:h-10" />
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl h-12 gradient-primary text-primary-foreground font-heading font-semibold text-base sm:text-lg"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-4">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
