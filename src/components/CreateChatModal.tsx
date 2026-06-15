import { useState } from 'react';
import Icon from '@/components/ui/icon';

type ChatType = 'group' | 'channel';

const allContacts = [
  { id: 1, name: 'Анна Северная', color: 'from-pink-500 to-rose-500' },
  { id: 2, name: 'Дмитрий Орлов', color: 'from-amber-500 to-orange-500' },
  { id: 3, name: 'Мария Воронова', color: 'from-emerald-500 to-teal-500' },
  { id: 4, name: 'Илья Космос', color: 'from-violet-500 to-fuchsia-500' },
  { id: 5, name: 'Сергей Звёздный', color: 'from-sky-500 to-blue-500' },
];

interface CreateChatModalProps {
  onClose: () => void;
  onCreate: (chat: { name: string; type: ChatType; members: number }) => void;
}

export default function CreateChatModal({ onClose, onCreate }: CreateChatModalProps) {
  const [type, setType] = useState<ChatType>('group');
  const [step, setStep] = useState<'type' | 'info' | 'members'>('type');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<number[]>([]);

  const toggleMember = (id: number) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), type, members: selected.length + 1 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass border border-border border-b-0 rounded-t-3xl p-6 pb-10 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold">
            {step === 'type' ? 'Создать' : step === 'info' ? (type === 'group' ? 'Новая группа' : 'Новый канал') : 'Добавить участников'}
          </h2>
          <button onClick={onClose} className="h-9 w-9 rounded-xl glass flex items-center justify-center">
            <Icon name="X" size={18} />
          </button>
        </div>

        {step === 'type' && (
          <div className="space-y-3">
            <button
              onClick={() => { setType('group'); setStep('info'); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${type === 'group' ? 'border-primary/60 bg-primary/10' : 'border-border/50 glass'}`}
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shrink-0">
                <Icon name="Users" size={22} className="text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Группа</div>
                <div className="text-sm text-muted-foreground">Общение между участниками, голосовые вызовы</div>
              </div>
              <Icon name="ChevronRight" size={18} className="ml-auto text-muted-foreground" />
            </button>

            <button
              onClick={() => { setType('channel'); setStep('info'); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${type === 'channel' ? 'border-primary/60 bg-primary/10' : 'border-border/50 glass'}`}
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
                <Icon name="Megaphone" size={22} className="text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Канал</div>
                <div className="text-sm text-muted-foreground">Публикации для широкой аудитории</div>
              </div>
              <Icon name="ChevronRight" size={18} className="ml-auto text-muted-foreground" />
            </button>
          </div>
        )}

        {step === 'info' && (
          <>
            <div className="flex items-center gap-4 mb-5">
              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-display font-bold text-white bg-gradient-to-br ${type === 'group' ? 'from-indigo-500 to-cyan-500' : 'from-violet-500 to-fuchsia-500'} shrink-0`}>
                {name.charAt(0) || (type === 'group' ? '👥' : '📢')}
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={type === 'group' ? 'Название группы' : 'Название канала'}
                className="flex-1 h-12 px-4 rounded-2xl bg-secondary border border-border text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'group' ? 'Описание группы (необязательно)' : 'Описание канала (необязательно)'}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors resize-none mb-4"
            />
            {type === 'channel' && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-accent/10 border border-accent/30 mb-4">
                <Icon name="Globe" size={18} className="text-accent shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-accent">Публичный канал</div>
                  <div className="text-muted-foreground">Любой сможет подписаться по ссылке</div>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep('type')} className="h-12 px-5 rounded-2xl glass border border-border font-medium">
                Назад
              </button>
              <button
                onClick={() => type === 'group' ? setStep('members') : handleCreate()}
                disabled={!name.trim()}
                className="flex-1 h-12 rounded-2xl gradient-brand text-white font-semibold disabled:opacity-40 transition-opacity"
              >
                {type === 'group' ? 'Далее' : 'Создать канал'}
              </button>
            </div>
          </>
        )}

        {step === 'members' && (
          <>
            <p className="text-sm text-muted-foreground mb-4">Выберите участников группы</p>
            <div className="space-y-2 mb-5 max-h-60 overflow-y-auto">
              {allContacts.map((c) => {
                const sel = selected.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleMember(c.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${sel ? 'border-primary/60 bg-primary/10' : 'border-border/50 glass'}`}
                  >
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center font-display font-semibold text-white`}>
                      {c.name.charAt(0)}
                    </div>
                    <span className="flex-1 text-left font-medium">{c.name}</span>
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${sel ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                      {sel && <Icon name="Check" size={14} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
            {selected.length > 0 && (
              <p className="text-xs text-accent mb-3 text-center">Выбрано: {selected.length} участника(ов)</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep('info')} className="h-12 px-5 rounded-2xl glass border border-border font-medium">
                Назад
              </button>
              <button
                onClick={handleCreate}
                disabled={selected.length === 0}
                className="flex-1 h-12 rounded-2xl gradient-brand text-white font-semibold disabled:opacity-40 transition-opacity"
              >
                Создать группу
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
