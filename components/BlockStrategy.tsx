'use client';
import { StrategyBlock } from '@/types';

interface Props {
  data: StrategyBlock;
  onChange: (d: StrategyBlock) => void;
}

export default function BlockStrategy({ data, onChange }: Props) {
  const set = (k: keyof StrategyBlock, v: string) => onChange({ ...data, [k]: v });

  const cards = [
    { key: 'key_message' as const, num: '1', label: 'Гол мессеж', hint: 'Инсайтад суурилсан гол зурвас юу вэ?', placeholder: 'Манай бүтээгдэхүүн таны...' },
    { key: 'channels' as const, num: '2', label: 'Суваг', hint: 'Хаана, ямар сувгаар хүрэх вэ?', placeholder: 'Instagram, TikTok, OOH...' },
    { key: 'approach' as const, num: '3', label: 'Хандлага', hint: 'Ямар өнцгөөр, ямар аяар?', placeholder: 'Эмоциональ / Шууд / Хошин...' },
  ];

  return (
    <div id="block-4" className="block-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span className="block-badge">4</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Strategy</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Стратеги</div>
        </div>
      </div>

      <div style={{ marginBottom: 20, fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
        Юу хийхээс илүү — юуг ХИЙХГҮЙ байхаа сонго.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {cards.map(c => (
          <div key={c.key} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(108,99,255,0.2)', color: 'var(--accent2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{c.num}</span>
              <span className="field-label" style={{ margin: 0 }}>{c.label}</span>
            </div>
            <textarea
              className="field-textarea"
              style={{ background: 'var(--surface)', minHeight: 90 }}
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
