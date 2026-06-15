import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const SMS_AUTH_URL = 'https://functions.poehali.dev/52d95e3f-be88-4c7c-a33e-db818cc84b0b';
const OAUTH_URL = 'https://functions.poehali.dev/2d93b4fb-05f8-4542-9611-89fe5e88bb73';

const VK_CLIENT_ID = import.meta.env.VITE_VK_CLIENT_ID || '';
const YANDEX_CLIENT_ID = import.meta.env.VITE_YANDEX_CLIENT_ID || '';

const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/oauth` : '';

type Step = 'phone' | 'code' | 'name';

interface AuthScreenProps {
  onAuth: (name: string) => void;
}

// SVG иконки провайдеров
const VKIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C5.095 10.984 4.48 8.672 4.48 8.19c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.864 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.946c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.743c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.762-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.745-.576.745z"/>
  </svg>
);

const YandexIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.04 12c0-5.523 4.476-10 9.999-10C17.523 2 22 6.477 22 12s-4.477 10-10.001 10C6.516 22 2.04 17.523 2.04 12zm9.138 3.508V8.394h.964c1.476 0 2.302.78 2.302 2.13 0 1.31-.729 2.196-2.322 2.196h-.254l2.508 2.788H15.8l-2.67-2.965c1.492-.44 2.3-1.548 2.3-3.04 0-2.045-1.33-3.178-3.527-3.178H9.98v7.183h1.198z"/>
  </svg>
);

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'vk' | 'yandex' | null>(null);
  const [error, setError] = useState('');

  // Обработка OAuth-редиректа
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthCode = params.get('code');
    const state = params.get('state');

    if (oauthCode && state) {
      const provider = state.startsWith('vk') ? 'vk' : state.startsWith('yandex') ? 'yandex' : null;
      if (provider) {
        window.history.replaceState({}, '', window.location.pathname);
        handleOAuthCallback(provider, oauthCode);
      }
    }
  }, []);

  const handleOAuthCallback = async (provider: 'vk' | 'yandex', oauthCode: string) => {
    setOauthLoading(provider);
    setError('');
    try {
      const res = await fetch(OAUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, code: oauthCode, redirect_uri: REDIRECT_URI }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Ошибка входа'); return; }
      if (data.name) { onAuth(data.name); return; }
      setStep('name');
    } catch {
      setError('Нет соединения с сервером');
    } finally {
      setOauthLoading(null);
    }
  };

  const loginWithVK = () => {
    if (!VK_CLIENT_ID) { setError('VK_CLIENT_ID не настроен (добавьте VITE_VK_CLIENT_ID)'); return; }
    const params = new URLSearchParams({
      client_id: VK_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'email',
      state: 'vk_' + Math.random().toString(36).slice(2),
    });
    window.location.href = `https://id.vk.com/oauth2/auth?${params}`;
  };

  const loginWithYandex = () => {
    if (!YANDEX_CLIENT_ID) { setError('YANDEX_CLIENT_ID не настроен (добавьте VITE_YANDEX_CLIENT_ID)'); return; }
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: YANDEX_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      state: 'yandex_' + Math.random().toString(36).slice(2),
    });
    window.location.href = `https://oauth.yandex.ru/authorize?${params}`;
  };

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
    setError('');
  };

  const handleSendCode = async () => {
    if (phone.replace(/\D/g, '').length < 11) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(SMS_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', phone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Ошибка отправки'); return; }
      setStep('code');
    } catch {
      setError('Нет соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length < 4) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(SMS_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', phone, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Неверный код'); return; }
      setStep('name');
    } catch {
      setError('Нет соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (!name.trim()) return;
    onAuth(name.trim());
  };

  if (oauthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-3xl gradient-brand-animated animate-gradient-move flex items-center justify-center glow">
            <Icon name="Radio" size={28} className="text-white" />
          </div>
          <p className="text-muted-foreground text-sm">Входим через {oauthLoading === 'vk' ? 'VK' : 'Яндекс'}...</p>
          <Icon name="Loader" size={24} className="text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden px-6">
      <div className="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-[120px] animate-float" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-80 w-80 rounded-full bg-accent/20 blur-[120px] animate-float" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-sm relative z-10">
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
              <p className="text-sm text-muted-foreground mb-5">Введите номер или войдите через соцсеть</p>

              {/* OAuth кнопки */}
              <div className="flex gap-3 mb-5">
                <button
                  onClick={loginWithVK}
                  className="flex-1 h-12 rounded-2xl bg-[#0077FF] hover:bg-[#0066ee] text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <VKIcon />
                  <span className="text-sm font-bold">MAX</span>
                </button>
                <button
                  onClick={loginWithYandex}
                  className="flex-1 h-12 rounded-2xl bg-[#FC3F1D] hover:bg-[#e8361a] text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <YandexIcon />
                  <span className="text-sm font-bold">Яндекс</span>
                </button>
              </div>

              {/* Разделитель */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">или по номеру</span>
                <div className="flex-1 h-px bg-border" />
              </div>

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
              {error && <p className="text-rose-400 text-sm mb-3 text-center">{error}</p>}
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
                  onChange={(e) => { setCode(e.target.value.slice(0, 6)); setError(''); }}
                  placeholder="Код из SMS"
                  className="w-full h-13 pl-12 pr-4 py-3.5 rounded-2xl bg-secondary border border-border text-2xl tracking-[0.4em] text-center placeholder:text-muted-foreground placeholder:text-base placeholder:tracking-normal focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>
              {error && <p className="text-rose-400 text-sm mb-3 text-center">{error}</p>}
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
