'use client';
import { StrategyBlock } from '@/types';

interface Props {
  data: StrategyBlock;
  onChange: (d: StrategyBlock) => void;
}

export default function BlockStrategy({ data, onChange }: Props) {
  const set = (k: keyof StrategyBlock, v: string) => onChange({ ...data, [k]: v });

  const cols = [
    { key: 'key_message' as const, num: 'I',   label: 'Гол мессеж', hint: 'Инсайтад суурилсан гол зурвас',    placeholder: 'Манай бүтээгдэхүүн таны...' },
    { key: 'channels'   as const, num: 'II',  label: 'Суваг',       hint: 'Хаана, ямар сувгаар хүрэх вэ?',   placeholder: 'Instagram, TikTok, OOH...' },
    { key: 'approach'   as const, num: 'III', label: 'Хандлага',    hint: 'Ямар өнцгөөр, ямар аяар?',        placeholder: 'Эмоциональ / Шууд / Хошин...' },
  ];

  return (
    <div id="block-4" className="block-card">
      <div className="block-header">
        <span className="block-number">04</span>
        <div className="block-title-group">
          <span className="block-subtitle">Strategy</span>
          <h2 className="block-title">Стратеги</h2>
        </div>
      </div>

      <p style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--muted)', marginBottom: 20 }}>
        Юу хийхээс илүү — юуг хийхгүй байхаа сонго.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {cols.map(c => (
          <div key={c.key} className="surface-card">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 10, fontStyle: 'italic', color: 'var(--gold)' }}>{c.num}</span>
              <span className="field-label" style={{ margin: 0 }}>{c.label}</span>
            </div>
            <textarea
              className="field-textarea"
              style={{ minHeight: 96 }}
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
