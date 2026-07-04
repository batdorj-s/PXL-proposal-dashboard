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
      <div className="block-header">
        <span className="block-number">01</span>
        <div className="block-title-group">
          <div className="block-subtitle">Background</div>
          <h2 className="block-title">Нөхцөл байдал</h2>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
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
          <label className="field-label">
            Дэмжих тоо баримт{' '}
            <span style={{ color: 'var(--muted)', fontWeight: 300, textTransform: 'none', letterSpacing: 0 }}>
              (заавал биш)
            </span>
          </label>
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
