'use client';
import { StrategyBlock } from '@/types';

interface Props {
  data: StrategyBlock;
  onChange: (d: StrategyBlock) => void;
}

export default function BlockStrategy({ data, onChange }: Props) {
  const set = (k: keyof StrategyBlock, v: string) => onChange({ ...data, [k]: v });

  const cards = [
    {
      key: 'key_message' as const,
      num: 'I',
      label: 'Гол мессеж',
      hint: 'Инсайтад суурилсан гол зурвас юу вэ?',
      placeholder: 'Манай бүтээгдэхүүн таны...',
    },
    {
      key: 'channels' as const,
      num: 'II',
      label: 'Суваг',
      hint: 'Хаана, ямар сувгаар хүрэх вэ?',
      placeholder: 'Instagram, TikTok, OOH...',
    },
    {
      key: 'approach' as const,
      num: 'III',
      label: 'Хандлага',
      hint: 'Ямар өнцгөөр, ямар аяар?',
      placeholder: 'Эмоциональ / Шууд / Хошин...',
    },
  ];

  return (
    <div id="block-4" className="block-card">
      <div className="block-header">
        <span className="block-number">04</span>
        <div className="block-title-group">
          <div className="block-subtitle">Strategy</div>
          <h2 className="block-title">Стратеги</h2>
        </div>
      </div>

      <div style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 14,
        fontStyle: 'italic',
        color: 'var(--muted)',
        marginBottom: 28,
        letterSpacing: '0.01em',
      }}>
        Юу хийхээс илүү — юуг ХИЙХГҮЙ байхаа сонго.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--border)' }}>
        {cards.map(c => (
          <div
            key={c.key}
            className="surface-card"
            style={{ borderRadius: 0, border: 'none', margin: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 11,
                fontStyle: 'italic',
                color: 'var(--gold)',
              }}>
                {c.num}
              </span>
              <span className="field-label" style={{ margin: 0 }}>{c.label}</span>
            </div>
            <textarea
              className="field-textarea"
              style={{ minHeight: 100 }}
              placeholder={c.placeholder}
              value={data[c.key]}
              onChange={e => set(c.key, e.target.value)}
            />
            <div className="field-hint">{c.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
