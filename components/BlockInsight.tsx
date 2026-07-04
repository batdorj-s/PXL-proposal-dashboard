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
      <div className="block-header">
        <span className="block-number">03</span>
        <div className="block-title-group">
          <span className="block-subtitle">Insight</span>
          <h2 className="block-title">Гол инсайт</h2>
        </div>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.08em', padding: '4px 10px', border: '1px solid var(--gold-2)', borderRadius: 3, background: 'var(--gold-4)' }}>
          Хамгийн чухал
        </span>
      </div>

      <div className="info-box" style={{ marginBottom: 20 }}>
        Загвар: <em>&ldquo;Энэ хүн ___ хүсдэг, гэхдээ ___ учраас ___ гэж мэдэрдэг.&rdquo;</em>
      </div>

      <textarea
        className="field-textarea large"
        style={{ fontSize: 'var(--text-md)', lineHeight: 1.7 }}
        placeholder="Энэ хүн ________________ хүсдэг, гэхдээ ________________ учраас ________________ гэж мэдэрдэг."
        value={data.insight}
        onChange={e => onChange({ insight: e.target.value })}
      />

      {showWarning && (
        <div className="soft-warning">
          ⚠ Ганц инсайт бич — олон биш. Хэрэв өөр бүтээгдэхүүнд наасан ч утга алдахгүй бол хэт ерөнхий байна.
        </div>
      )}

      <div className="field-hint" style={{ marginTop: 6 }}>
        Ганц хүчтэй инсайт — бүх стратеги эндээс ургана.
      </div>
    </div>
  );
}
