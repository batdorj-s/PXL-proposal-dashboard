'use client';
import { PersonaBlock, CoreDriver, CORE_DRIVERS } from '@/types';

interface Props {
  data: PersonaBlock;
  onChange: (d: PersonaBlock) => void;
}

export default function BlockPersona({ data, onChange }: Props) {
  const set = (k: keyof PersonaBlock, v: string) => onChange({ ...data, [k]: v });

  return (
    <div id="block-2" className="block-card">
      <div className="block-header">
        <span className="block-number">02</span>
        <div className="block-title-group">
          <div className="block-subtitle">Persona</div>
          <h2 className="block-title">Зорилтот хэрэглэгч</h2>
        </div>
      </div>

      <div className="info-box" style={{ marginBottom: 28 }}>
        «25–35 настай» биш. <strong>«Амьдралаа удирдаж чаддагаа батлахыг хүсдэг»</strong> гэж бич.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 40px' }}>
        <div>
          <label className="field-label">Юунд итгэдэг вэ?</label>
          <textarea
            className="field-textarea"
            placeholder="Энэ хүн юунд итгэдэг вэ?"
            value={data.believes}
            onChange={e => set('believes', e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Юунаас айдаг / зайлсхийдэг вэ?</label>
          <textarea
            className="field-textarea"
            placeholder="Айдас, зайлсхийдэг зүйл..."
            value={data.fears}
            onChange={e => set('fears', e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Ямар зөрчилтэй амьдардаг вэ?</label>
          <textarea
            className="field-textarea"
            placeholder="Дотоод зөрчил, хэцүү сонголт..."
            value={data.tension}
            onChange={e => set('tension', e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Өдөр тутмын бодит амьдрал</label>
          <textarea
            className="field-textarea"
            placeholder="Өдөр тутмын байдал, орчин..."
            value={data.daily_life}
            onChange={e => set('daily_life', e.target.value)}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="field-label">Гол хөдөлгүүр</label>
          <select
            className="field-select"
            value={data.core_driver}
            onChange={e => set('core_driver', e.target.value as CoreDriver)}
          >
            <option value="">— Сонгох —</option>
            {CORE_DRIVERS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
