'use client';
import { BackgroundBlock } from '@/types';

interface Props {
  data: BackgroundBlock;
  onChange: (d: BackgroundBlock) => void;
}

export default function BlockBackground({ data, onChange }: Props) {
  const set = (k: keyof BackgroundBlock, v: string) => onChange({ ...data, [k]: v });

  return (
    <div id="block-1" className="block-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span className="block-badge">1</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Background</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Нөхцөл байдал</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="field-label">Брэндийн одоогийн нөхцөл</label>
          <textarea
            className="field-textarea"
            placeholder="Брэнд одоо хаана байна? Юуг шийдэх гэж байна вэ?"
            value={data.context}
            onChange={e => set('context', e.target.value)}
          />
          <div className="field-hint">Энд шийдлээ бүү бич — зөвхөн асуудлыг тодорхойл.</div>
        </div>
        <div>
          <label className="field-label">Гол сорилт</label>
          <textarea
            className="field-textarea"
            placeholder="Гол сорилтоо 1–2 өгүүлбэрээр тодорхой бич."
            value={data.key_challenge}
            onChange={e => set('key_challenge', e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Дэмжих тоо баримт <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(заавал биш)</span></label>
          <textarea
            className="field-textarea"
            placeholder="Борлуулалт, зах зээлийн хувь, судалгаа г.м"
            value={data.supporting_data}
            onChange={e => set('supporting_data', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
