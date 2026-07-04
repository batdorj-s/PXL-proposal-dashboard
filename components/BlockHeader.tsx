'use client';
import { HeaderBlock } from '@/types';

interface Props {
  data: HeaderBlock;
  onChange: (d: HeaderBlock) => void;
}

export default function BlockHeader({ data, onChange }: Props) {
  const set = (k: keyof HeaderBlock, v: string) => onChange({ ...data, [k]: v });

  return (
    <div id="block-0" className="block-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span className="block-badge">✦</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Нүүр мэдээлэл</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Proposal</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label className="field-label">Брэндийн нэр</label>
          <input className="field-input" placeholder="Жишээ: Golomt Bank" value={data.brand_name} onChange={e => set('brand_name', e.target.value)} />
        </div>
        <div>
          <label className="field-label">Кампанит ажлын нэр</label>
          <input className="field-input" placeholder="Жишээ: Q3 Brand Refresh" value={data.campaign_name} onChange={e => set('campaign_name', e.target.value)} />
        </div>
        <div>
          <label className="field-label">Бэлтгэсэн хүн</label>
          <input className="field-input" placeholder="Таны нэр" value={data.prepared_by} onChange={e => set('prepared_by', e.target.value)} />
        </div>
        <div>
          <label className="field-label">Огноо</label>
          <input className="field-input" type="date" value={data.date} onChange={e => set('date', e.target.value)} />
        </div>
      </div>
    </div>
  );
}
