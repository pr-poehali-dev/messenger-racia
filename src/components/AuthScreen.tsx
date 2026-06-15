import { useState } from 'react';
import Icon from '@/components/ui/icon';

type Step = 'phone' | 'code' | 'name';

interface AuthScreenProps {
  onAuth: (name: string) => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length === 0) return '';
    let result = '+';
    if (digits[0] === '7' || digits[0] === '8') {
      result += '7';
      if (digits.length > 1) result += ' (' + digits.slice(1, 4);
      if (digits.length > 4) result += ') ' + digits.slice(4, 7);
      if (digits.length > 7) result += '-' + digits.slice(7, 9);
      if (digits.length > 9) result += '-' + digits.slice(9, 11);
    } else {
      result += digits;
    }
    return result;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSendCode = () => {
    if (phone.replace(/\D/g, '').length < 11) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('code'); }, 1200);
  };

  const handleVerifyCode = () => {
    if (code.length < 4) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('name'); }, 1000);
  };

  const handleFinish = () => {
    if (!name.trim()) return;
    onAuth(name.trim());
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden px-6">
      <div className="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-[120px] animate-float" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-80 w-80 rounded-full bg-accent/20 blur-[120px] animate-float" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10 animate-scale-in">
          <div className="h-20 w-20 rounded-3xl gradient-brand-animated animate-gradient-move flex items-center justify-center glow mb-4">
            <Icon name="Radio" size={36} className="text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-wide">РАЦИЯ</h1>
          <p className="text-muted-foreground text-sm mt-1">Всегда на связи</p>
        </div>

        <div className="glass border border-border rounded-3xl p-6 animate-fade-in">
          {step === 'phone' && (
            <>
              <h2 className="font-display text-xl font-semibold mb-1">Войти в РАЦИЮ</h2>
              <p className="text-sm text-muted-foreground mb-6">Введите номер телефона — отправим код</p>
              <div className="relative mb-4">
                <Icon name="Phone" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+7 (___) ___-__-__"
                  className="w-full h-13 pl-12 pr-4 py-3.5 rounded-2xl bg-secondary border border-border text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
              <button
                onClick={handleSendCode}
                disabled={loading || phone.replace(/\D/g, '').length < 11}
                className="w-full h-13 py-3.5 rounded-2xl gradient-brand text-white font-semibold font-display tracking-wide disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
              >
                {loading ? <Icon name="Loader" size={20} className="animate-spin" /> : <>Получить код <Icon name="ArrowRight" size={18} /></>}
              </button>
            </>
          )}

          {step === 'code' && (
            <>
              <button onClick={() => setStep('phone')} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors">
                <Icon name="ChevronLeft" size={16} /> Назад
              </button>
              <h2 className="font-display text-xl font-semibold mb-1">Код подтверждения</h2>
              <p className="text-sm text-muted-foreground mb-1">Отправили SMS на номер</p>
              <p className="text-accent font-medium text-sm mb-6">{phone}</p>
              <div className="relative mb-2">
                <Icon name="ShieldCheck" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.slice(0, 6))}
                  placeholder="Код из SMS"
                  className="w-full h-13 pl-12 pr-4 py-3.5 rounded-2xl bg-secondary border border-border text-2xl tracking-[0.4em] text-center placeholder:text-muted-foreground placeholder:text-base placeholder:tracking-normal focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
              <p className="text-xs text-muted-foreground mb-4 text-center">Введите любые цифры для демо</p>
              <button
                onClick={handleVerifyCode}
                disabled={loading || code.length < 4}
                className="w-full h-13 py-3.5 rounded-2xl gradient-brand text-white font-semibold font-display tracking-wide disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
              >
                {loading ? <Icon name="Loader" size={20} className="animate-spin" /> : <>Подтвердить <Icon name="ArrowRight" size={18} /></>}
              </button>
            </>
          )}

          {step === 'name' && (
            <>
              <h2 className="font-display text-xl font-semibold mb-1">Ваше имя</h2>
              <p className="text-sm text-muted-foreground mb-6">Как вас будут называть в РАЦИИ?</p>
              <div className="flex gap-3 mb-4">
                <div className="h-14 w-14 rounded-2xl gradient-brand flex items-center justify-center font-display text-2xl font-bold text-white shrink-0">
                  {name.charAt(0) || '?'}
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя"
                  className="flex-1 h-14 px-4 rounded-2xl bg-secondary border border-border text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
              <button
                onClick={handleFinish}
                disabled={!name.trim()}
                className="w-full h-13 py-3.5 rounded-2xl gradient-brand text-white font-semibold font-display tracking-wide disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
              >
                Войти в РАЦИЮ 🚀
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 px-4">
          Продолжая, вы соглашаетесь с условиями использования РАЦИИ
        </p>
      </div>
    </div>
  );
}
