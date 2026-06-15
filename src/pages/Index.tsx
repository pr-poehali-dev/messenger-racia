import { useState } from 'react';
import Icon from '@/components/ui/icon';
import AuthScreen from '@/components/AuthScreen';
import CreateChatModal from '@/components/CreateChatModal';

type TabId = 'chats' | 'status' | 'contacts' | 'profile';
type ChatType = 'private' | 'group' | 'channel';

interface Chat {
  id: number;
  name: string;
  msg: string;
  time: string;
  unread: number;
  color: string;
  voice?: boolean;
  online?: boolean;
  missed?: boolean;
  typing?: boolean;
  type: ChatType;
  members?: number;
}

const defaultChats: Chat[] = [
  { id: 1, name: 'Анна Северная', msg: 'Голосовое сообщение', time: '14:32', unread: 2, color: 'from-pink-500 to-rose-500', voice: true, online: true, type: 'private' },
  { id: 2, name: 'Команда РАЦИЯ', msg: 'Макс: на связи, приём!', time: '13:05', unread: 0, color: 'from-indigo-500 to-cyan-500', online: true, type: 'group', members: 6 },
  { id: 3, name: 'Дмитрий Орлов', msg: 'Пропущенный голосовой вызов', time: '12:48', unread: 0, color: 'from-amber-500 to-orange-500', missed: true, type: 'private' },
  { id: 4, name: '📡 Космос Daily', msg: 'Новый пост: МКС вышла на орбиту', time: '11:20', unread: 12, color: 'from-violet-500 to-fuchsia-500', type: 'channel', members: 4800 },
  { id: 5, name: 'Мария Воронова', msg: 'Печатает...', time: '10:14', unread: 5, color: 'from-emerald-500 to-teal-500', online: true, typing: true, type: 'private' },
];

const statuses = [
  { id: 1, name: 'Анна Северная', time: '5 мин назад', color: 'from-pink-500 to-rose-500' },
  { id: 2, name: 'Дмитрий Орлов', time: '32 мин назад', color: 'from-amber-500 to-orange-500' },
  { id: 3, name: 'Мария Воронова', time: '1 ч назад', color: 'from-emerald-500 to-teal-500' },
  { id: 4, name: 'Илья Космос', time: '2 ч назад', color: 'from-violet-500 to-fuchsia-500' },
];

const contacts = [
  { id: 1, name: 'Анна Северная', status: 'в сети', color: 'from-pink-500 to-rose-500', online: true },
  { id: 2, name: 'Дмитрий Орлов', status: 'был(а) 12:48', color: 'from-amber-500 to-orange-500' },
  { id: 3, name: 'Мария Воронова', status: 'в сети', color: 'from-emerald-500 to-teal-500', online: true },
  { id: 4, name: 'Илья Космос', status: 'был(а) вчера', color: 'from-violet-500 to-fuchsia-500' },
  { id: 5, name: 'Команда РАЦИЯ', status: '6 участников', color: 'from-indigo-500 to-cyan-500', online: true },
];

const tabs: { id: TabId; icon: string; label: string }[] = [
  { id: 'chats', icon: 'MessageCircle', label: 'Чаты' },
  { id: 'status', icon: 'Radio', label: 'Статусы' },
  { id: 'contacts', icon: 'Users', label: 'Контакты' },
  { id: 'profile', icon: 'User', label: 'Профиль' },
];

const ChatTypeBadge = ({ type, members }: { type: ChatType; members?: number }) => {
  if (type === 'private') return null;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${type === 'group' ? 'bg-cyan-500/15 text-cyan-400' : 'bg-fuchsia-500/15 text-fuchsia-400'}`}>
      <Icon name={type === 'group' ? 'Users' : 'Megaphone'} size={10} />
      {type === 'group' ? `${members} уч.` : members && members > 999 ? `${(members / 1000).toFixed(1)}К` : members}
    </span>
  );
};

const Avatar = ({ name, color, size = 'h-14 w-14', online, type }: { name: string; color: string; size?: string; online?: boolean; type?: ChatType }) => (
  <div className="relative shrink-0">
    <div className={`${size} rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center font-display font-semibold text-white text-lg`}>
      {type === 'channel' ? <Icon name="Megaphone" size={22} className="text-white" /> : type === 'group' ? <Icon name="Users" size={22} className="text-white" /> : name.charAt(0)}
    </div>
    {online && <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent border-2 border-card" />}
  </div>
);

const VoiceWave = () => (
  <div className="flex items-center gap-0.5 h-4">
    {[0, 1, 2, 3, 4].map((i) => (
      <span key={i} className="w-0.5 rounded-full bg-accent animate-wave" style={{ height: '100%', animationDelay: `${i * 0.12}s` }} />
    ))}
  </div>
);

export default function Index() {
  const [authed, setAuthed] = useState(false);
  const [userName, setUserName] = useState('');
  const [tab, setTab] = useState<TabId>('chats');
  const [search, setSearch] = useState('');
  const [recording, setRecording] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [chats, setChats] = useState<Chat[]>(defaultChats);

  const handleAuth = (name: string) => { setUserName(name); setAuthed(true); };

  const handleCreate = ({ name, type, members }: { name: string; type: 'group' | 'channel'; members: number }) => {
    const colors = ['from-indigo-500 to-cyan-500', 'from-violet-500 to-fuchsia-500', 'from-sky-500 to-blue-500', 'from-rose-500 to-pink-500'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    setChats((prev) => [{
      id: Date.now(), name, type, members, color,
      msg: type === 'group' ? 'Группа создана' : 'Канал создан',
      time: 'сейчас', unread: 0,
    }, ...prev]);
  };

  if (!authed) return <AuthScreen onAuth={handleAuth} />;

  const filtered = chats.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-[120px] animate-float" />
      <div className="pointer-events-none fixed top-1/3 -right-40 h-96 w-96 rounded-full bg-accent/20 blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
      <div className="pointer-events-none fixed bottom-0 left-1/4 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-[120px] animate-float" style={{ animationDelay: '4s' }} />

      <div className="relative z-10 mx-auto max-w-md min-h-screen flex flex-col">
        <header className="px-5 pt-8 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-scale-in">
              <div className="h-11 w-11 rounded-2xl gradient-brand-animated animate-gradient-move flex items-center justify-center glow">
                <Icon name="Radio" size={22} className="text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold tracking-wide leading-none">РАЦИЯ</h1>
                <span className="text-xs text-accent font-medium tracking-widest uppercase">на связи</span>
              </div>
            </div>
            <div className="flex gap-2">
              {tab === 'chats' && (
                <button onClick={() => setShowCreate(true)} className="h-11 w-11 rounded-2xl gradient-brand flex items-center justify-center glow hover:scale-105 transition-transform">
                  <Icon name="Plus" size={20} className="text-white" />
                </button>
              )}
              <button className="h-11 w-11 rounded-2xl glass flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Icon name="Bell" size={20} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="mt-6 relative animate-fade-in">
            <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по чатам и контактам"
              className="w-full h-12 pl-12 pr-4 rounded-2xl glass border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>
        </header>

        <main className="flex-1 px-4 pb-32 overflow-y-auto">
          {tab === 'chats' && (
            <div className="space-y-2">
              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">Ничего не найдено</div>
              )}
              {filtered.map((c, i) => (
                <button
                  key={c.id}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl glass border border-border/50 hover:border-primary/50 transition-all text-left animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}
                >
                  <Avatar name={c.name} color={c.color} online={c.online} type={c.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium truncate">{c.name}</span>
                        <ChatTypeBadge type={c.type} members={c.members} />
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{c.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {c.voice && <Icon name="Mic" size={14} className="text-accent shrink-0" />}
                      {c.missed && <Icon name="PhoneMissed" size={14} className="text-rose-400 shrink-0" />}
                      <span className={`text-sm truncate ${c.typing ? 'text-accent' : c.missed ? 'text-rose-400' : 'text-muted-foreground'}`}>{c.msg}</span>
                    </div>
                  </div>
                  {c.unread > 0 && (
                    <span className="shrink-0 h-6 min-w-6 px-1.5 rounded-full gradient-brand flex items-center justify-center text-xs font-semibold text-white">
                      {c.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {tab === 'status' && (
            <div>
              <button className="w-full flex items-center gap-4 p-3 rounded-2xl glass border border-border/50 mb-4 animate-fade-in text-left">
                <div className="h-14 w-14 rounded-2xl gradient-brand flex items-center justify-center">
                  <Icon name="Plus" size={24} className="text-white" />
                </div>
                <div>
                  <div className="font-medium">Мой статус</div>
                  <div className="text-sm text-muted-foreground">Поделитесь моментом</div>
                </div>
              </button>
              <p className="text-xs uppercase tracking-widest text-muted-foreground px-2 mb-3">Недавние</p>
              <div className="space-y-2">
                {statuses.map((s, i) => (
                  <button key={s.id} className="w-full flex items-center gap-4 p-3 rounded-2xl glass border border-border/50 hover:border-primary/50 transition-all text-left animate-fade-in" style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}>
                    <div className={`h-14 w-14 rounded-2xl p-0.5 bg-gradient-to-br ${s.color}`}>
                      <div className="h-full w-full rounded-[14px] bg-card flex items-center justify-center font-display text-lg font-semibold">{s.name.charAt(0)}</div>
                    </div>
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-sm text-muted-foreground">{s.time}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'contacts' && (
            <div className="space-y-2">
              {contacts.map((c, i) => (
                <button key={c.id} className="w-full flex items-center gap-4 p-3 rounded-2xl glass border border-border/50 hover:border-primary/50 transition-all text-left animate-fade-in" style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}>
                  <Avatar name={c.name} color={c.color} online={c.online} type="private" />
                  <div className="flex-1">
                    <div className="font-medium">{c.name}</div>
                    <div className={`text-sm ${c.online ? 'text-accent' : 'text-muted-foreground'}`}>{c.status}</div>
                  </div>
                  <div className="flex gap-2">
                    <span className="h-10 w-10 rounded-xl glass flex items-center justify-center hover:bg-accent/20 transition-colors">
                      <Icon name="Phone" size={18} className="text-accent" />
                    </span>
                    <span className="h-10 w-10 rounded-xl glass flex items-center justify-center hover:bg-primary/20 transition-colors">
                      <Icon name="MessageCircle" size={18} className="text-primary" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {tab === 'profile' && (
            <div className="animate-fade-in">
              <div className="rounded-3xl glass border border-border p-6 flex flex-col items-center text-center glow">
                <div className="h-24 w-24 rounded-3xl gradient-brand-animated animate-gradient-move flex items-center justify-center font-display text-4xl font-bold text-white">
                  {initial}
                </div>
                <h2 className="font-display text-2xl font-bold mt-4">{userName}</h2>
                <p className="text-accent text-sm font-medium">в сети</p>
                <p className="text-muted-foreground text-sm mt-2">Космонавт связи. Всегда на приёме 🛰️</p>
                <div className="flex gap-3 mt-5 w-full">
                  <button className="flex-1 h-11 rounded-2xl gradient-brand text-white font-medium flex items-center justify-center gap-2">
                    <Icon name="Pencil" size={16} /> Изменить
                  </button>
                  <button className="h-11 w-11 rounded-2xl glass border border-border flex items-center justify-center">
                    <Icon name="QrCode" size={18} />
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { icon: 'Mic', label: 'Голосовые сообщения', val: 'Вкл' },
                  { icon: 'Phone', label: 'Голосовые вызовы', val: 'HD-качество' },
                  { icon: 'Bell', label: 'Уведомления', val: 'Все' },
                  { icon: 'Lock', label: 'Приватность', val: '' },
                  { icon: 'LogOut', label: 'Выйти', val: '' },
                ].map((r) => (
                  <button
                    key={r.label}
                    onClick={r.icon === 'LogOut' ? () => { setAuthed(false); setUserName(''); } : undefined}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl glass border border-border/50 ${r.icon === 'LogOut' ? 'border-rose-500/30' : ''}`}
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${r.icon === 'LogOut' ? 'bg-rose-500/15' : 'bg-primary/15'}`}>
                      <Icon name={r.icon} size={18} className={r.icon === 'LogOut' ? 'text-rose-400' : 'text-primary'} />
                    </div>
                    <span className={`flex-1 text-left font-medium ${r.icon === 'LogOut' ? 'text-rose-400' : ''}`}>{r.label}</span>
                    <span className="text-sm text-muted-foreground">{r.val}</span>
                    <Icon name="ChevronRight" size={18} className="text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        {tab === 'chats' && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
            <div className="glass border border-border rounded-2xl h-14 flex items-center px-3 gap-3 glow">
              <input placeholder="Сообщение..." className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none px-2" />
              {recording && <VoiceWave />}
              <button
                onMouseDown={() => setRecording(true)}
                onMouseUp={() => setRecording(false)}
                onMouseLeave={() => setRecording(false)}
                className="relative h-10 w-10 rounded-xl gradient-brand flex items-center justify-center shrink-0"
              >
                {recording && <span className="absolute inset-0 rounded-xl gradient-brand animate-pulse-ring" />}
                <Icon name={recording ? 'Mic' : 'Send'} size={18} className="text-white relative z-10" />
              </button>
            </div>
          </div>
        )}

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-4">
          <div className="glass border border-border rounded-3xl h-16 flex items-center justify-around px-2">
            {tabs.map((t) => {
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full">
                  <div className={`flex items-center justify-center h-9 w-9 rounded-2xl transition-all ${active ? 'gradient-brand glow' : ''}`}>
                    <Icon name={t.icon} size={20} className={active ? 'text-white' : 'text-muted-foreground'} />
                  </div>
                  <span className={`text-[10px] font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {showCreate && (
        <CreateChatModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
