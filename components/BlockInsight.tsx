'use client';
import { InsightBlock } from '@/types';

interface Props {
  data: InsightBlock;
  onChange: (d: InsightBlock) => void;
}

export default function BlockInsight({ data, onChange }: Props) {
  const sentences = data.insight.split('.').filter(s => s.trim().length > 0).length;
  const showWarning = data.insight.trim().length > 0 && sentences > 2;

  return (
    <div id="block-3" className="block-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span className="block-badge">3</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Insight</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Гол инсайт</div>
        </div>
      </div>

      <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--muted)' }}>
        Хамгийн чухал блок. Зөвхөн <strong style={{ color: 'var(--accent2)' }}>НЭГ</strong> инсайт.
      </div>

      <div style={{ marginBottom: 12, padding: '12px 16px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, color: 'var(--muted)' }}>
        Загвар: <em style={{ color: 'var(--text)' }}>"Энэ хүн ___ хүсдэг, гэхдээ ___ учраас ___ гэж мэдэрдэг."</em>
      </div>

      <textarea
        className="field-textarea large"
        style={{ fontSize: 16, minHeight: 140 }}
        placeholder="Энэ хүн ________________ хүсдэг, гэхдээ ________________ учраас ________________ гэж мэдэрдэг."
        value={data.insight}
        onChange={e => onChange({ insight: e.target.value })}
      />

      {showWarning && (
        <div className="soft-warning">
          ⚠️ Ганц инсайт бич — олон биш. Хэрэв өөр бүтээгдэхүүнд наасан ч утга алдахгүй бол хэт ерөнхий байна.
        </div>
      )}

      <div className="field-hint" style={{ marginTop: 8 }}>
        Ганц хүчтэй инсайт бич — олон биш. Бүх стратеги эндээс ургана.
      </div>
    </div>
  );
}
