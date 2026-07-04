'use client';
import { CreativityBlock, Execution, ContentType, CONTENT_TYPES } from '@/types';

interface Props {
  data: CreativityBlock;
  onChange: (d: CreativityBlock) => void;
}

function newExecution(): Execution {
  return { id: crypto.randomUUID(), content_type: '', description: '', sample: '' };
}

export default function BlockCreativity({ data, onChange }: Props) {
  const set = (k: keyof CreativityBlock, v: string) => onChange({ ...data, [k]: v });

  const addExecution = () =>
    onChange({ ...data, executions: [...data.executions, newExecution()] });

  const removeExecution = (id: string) =>
    onChange({ ...data, executions: data.executions.filter(e => e.id !== id) });

  const updateExecution = (id: string, patch: Partial<Execution>) =>
    onChange({
      ...data,
      executions: data.executions.map(e => (e.id === id ? { ...e, ...patch } : e)),
    });

  const isMedia = (ct: ContentType) => ct === 'Рийлс' || ct === 'Видео';

  return (
    <div id="block-5" className="block-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span className="block-badge">5</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Creativity</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Бүтээлч санаа</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="field-label">Big Idea</label>
          <textarea
            className="field-textarea large"
            style={{ fontSize: 16 }}
            placeholder="Нэг өгүүлбэрт багтах гол санаа — реклам, эвент, бүх зүйл эндээс ургана."
            value={data.big_idea}
            onChange={e => set('big_idea', e.target.value)}
          />
          <div className="field-hint">Big idea нь tagline биш — tagline, реклам, эвент бүгд эндээс ургадаг гол санаа.</div>
        </div>

        <div>
          <label className="field-label">Tagline — Уриа үг</label>
          <input
            className="field-input"
            placeholder="Богино, санахуйц уриа үг"
            value={data.tagline}
            onChange={e => set('tagline', e.target.value)}
          />
        </div>

        {/* Executions */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <label className="field-label" style={{ margin: 0 }}>Гүйцэтгэлийн жишээнүүд</label>
            <button className="btn btn-ghost" onClick={addExecution} type="button">+ Нэмэх</button>
          </div>

          {data.executions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)', fontSize: 13, border: '1px dashed var(--border)', borderRadius: 10 }}>
              Гүйцэтгэлийн жишээ нэмнэ үү (постер, рийлс, эвент...)
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.executions.map((ex, i) => (
              <div key={ex.id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>#{i + 1}</span>
                  <select
                    className="field-select"
                    style={{ background: 'var(--surface)', flex: 1 }}
                    value={ex.content_type}
                    onChange={e => updateExecution(ex.id, { content_type: e.target.value as ContentType, sample: '' })}
                  >
                    <option value="">— Контент төрөл —</option>
                    {CONTENT_TYPES.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                  </select>
                  <button className="btn btn-danger" style={{ padding: '6px 10px' }} onClick={() => removeExecution(ex.id)} type="button">✕</button>
                </div>

                <textarea
                  className="field-textarea"
                  style={{ background: 'var(--surface)', marginBottom: 10 }}
                  placeholder="Тухайн гүйцэтгэлийн тайлбар..."
                  value={ex.description}
                  onChange={e => updateExecution(ex.id, { description: e.target.value })}
                />

                {ex.content_type && (
                  isMedia(ex.content_type) ? (
                    <div>
                      <label className="field-label">Видео линк / файл</label>
                      <input
                        className="field-input"
                        style={{ background: 'var(--surface)' }}
                        placeholder="https://..."
                        value={ex.sample}
                        onChange={e => updateExecution(ex.id, { sample: e.target.value })}
                      />
                    </div>
                  ) : ex.content_type === 'Постер' ? (
                    <div>
                      <label className="field-label">Зургийн линк</label>
                      <input
                        className="field-input"
                        style={{ background: 'var(--surface)' }}
                        placeholder="Зургийн URL эсвэл тайлбар..."
                        value={ex.sample}
                        onChange={e => updateExecution(ex.id, { sample: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="field-label">Жишээ / Дэлгэрэнгүй</label>
                      <input
                        className="field-input"
                        style={{ background: 'var(--surface)' }}
                        placeholder="Жишээ, референс..."
                        value={ex.sample}
                        onChange={e => updateExecution(ex.id, { sample: e.target.value })}
                      />
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
