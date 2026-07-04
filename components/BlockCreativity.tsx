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
      <div className="block-header">
        <span className="block-number">05</span>
        <div className="block-title-group">
          <div className="block-subtitle">Creativity</div>
          <h2 className="block-title">Бүтээлч санаа</h2>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Big Idea */}
        <div>
          <label className="field-label">Big Idea</label>
          <textarea
            className="field-textarea large"
            style={{ fontSize: 'var(--text-md)', lineHeight: 1.7 }}
            placeholder="Нэг өгүүлбэрт багтах гол санаа — реклам, эвент, бүх зүйл эндээс ургана."
            value={data.big_idea}
            onChange={e => set('big_idea', e.target.value)}
          />
          <div className="field-hint">
            Big idea нь tagline биш — tagline, реклам, эвент бүгд эндээс ургадаг гол санаа.
          </div>
        </div>

        {/* Tagline */}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <label className="field-label" style={{ margin: 0 }}>
              Гүйцэтгэлийн жишээнүүд
            </label>
            <button className="btn btn-ghost" onClick={addExecution} type="button">
              + Нэмэх
            </button>
          </div>

          {data.executions.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '32px 24px',
              color: 'var(--muted)',
              fontSize: 13,
              border: '1px dashed var(--border-2)',
              borderRadius: 2,
              fontStyle: 'italic',
            }}>
              Гүйцэтгэлийн жишээ нэмнэ үү (постер, рийлс, эвент...)
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.executions.map((ex, i) => (
              <div key={ex.id} className="execution-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 11,
                    fontStyle: 'italic',
                    color: 'var(--gold)',
                    flexShrink: 0,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <select
                    className="field-select"
                    style={{ flex: 1 }}
                    value={ex.content_type}
                    onChange={e => updateExecution(ex.id, { content_type: e.target.value as ContentType, sample: '' })}
                  >
                    <option value="">— Контент төрөл —</option>
                    {CONTENT_TYPES.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                  </select>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '4px 10px', fontSize: 10 }}
                    onClick={() => removeExecution(ex.id)}
                    type="button"
                  >
                    ✕
                  </button>
                </div>

                <div style={{ marginBottom: ex.content_type ? 12 : 0 }}>
                  <label className="field-label">Тайлбар</label>
                  <textarea
                    className="field-textarea"
                    placeholder="Тухайн гүйцэтгэлийн тайлбар..."
                    value={ex.description}
                    onChange={e => updateExecution(ex.id, { description: e.target.value })}
                  />
                </div>

                {ex.content_type && (
                  <div>
                    <label className="field-label">
                      {isMedia(ex.content_type) ? 'Видео линк / файл' :
                       ex.content_type === 'Постер' ? 'Зургийн линк' : 'Жишээ / Дэлгэрэнгүй'}
                    </label>
                    <input
                      className="field-input"
                      placeholder={isMedia(ex.content_type) ? 'https://...' : 'Жишээ, референс...'}
                      value={ex.sample}
                      onChange={e => updateExecution(ex.id, { sample: e.target.value })}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
