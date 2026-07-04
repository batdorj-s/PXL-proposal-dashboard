'use client';
import { PricingBlock, LineItem, ContentType, CONTENT_TYPES, RATE_CARD } from '@/types';
import { calcPricing, fmt } from '@/lib/pricing';

interface Props {
  data: PricingBlock;
  onChange: (d: PricingBlock) => void;
}

function newItem(): LineItem {
  return { id: crypto.randomUUID(), content_type: '', unit_price: 0, quantity: 1 };
}

export default function BlockPricing({ data, onChange }: Props) {
  const totals = calcPricing(data);

  const addItem    = () => onChange({ ...data, items: [...data.items, newItem()] });
  const removeItem = (id: string) => onChange({ ...data, items: data.items.filter(i => i.id !== id) });
  const updateItem = (id: string, patch: Partial<LineItem>) =>
    onChange({ ...data, items: data.items.map(i => (i.id === id ? { ...i, ...patch } : i)) });

  const handleTypeChange = (id: string, ct: ContentType) => {
    const unit_price = RATE_CARD[ct] ?? 0;
    updateItem(id, { content_type: ct, unit_price });
  };

  const setField = (k: 'discount_pct' | 'vat_pct', v: number) =>
    onChange({ ...data, [k]: Math.max(0, Math.min(100, v)) });

  return (
    <div id="block-6" className="block-card">
      <div className="block-header">
        <span className="block-number">06</span>
        <div className="block-title-group">
          <div className="block-subtitle">Pricing</div>
          <h2 className="block-title">Үнийн санал</h2>
        </div>
        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 9,
          color: 'var(--muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '4px 10px',
          border: '1px solid var(--border-2)',
          borderRadius: 2,
          alignSelf: 'flex-start',
        }}>
          Автомат тооцоолол
        </div>
      </div>

      {/* Line items */}
      <div style={{ overflowX: 'auto', marginBottom: 20 }}>
        <table className="pricing-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Контент төрөл</th>
              <th>Нэгжийн үнэ (₮)</th>
              <th>Тоо ширхэг</th>
              <th>Нийт</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: 'center',
                    color: 'var(--muted)',
                    padding: '32px 24px',
                    fontStyle: 'italic',
                    fontSize: 13,
                  }}
                >
                  Мөр нэмнэ үү
                </td>
              </tr>
            )}
            {data.items.map((item, i) => {
              const line_total = item.unit_price * Math.max(0, item.quantity);
              return (
                <tr key={item.id}>
                  <td style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    color: 'var(--muted)',
                    width: 36,
                    fontSize: 11,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </td>
                  <td>
                    <select
                      className="field-select"
                      style={{ minWidth: 140 }}
                      value={item.content_type}
                      onChange={e => handleTypeChange(item.id, e.target.value as ContentType)}
                    >
                      <option value="">— Сонгох —</option>
                      {CONTENT_TYPES.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                    </select>
                  </td>
                  <td>
                    <input
                      className="field-input"
                      type="number"
                      min={0}
                      style={{ minWidth: 130 }}
                      value={item.unit_price || ''}
                      onChange={e => updateItem(item.id, { unit_price: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </td>
                  <td>
                    <input
                      className="field-input"
                      type="number"
                      min={1}
                      step={1}
                      style={{ width: 72 }}
                      value={item.quantity || ''}
                      onChange={e => updateItem(item.id, { quantity: Math.floor(Number(e.target.value)) })}
                      placeholder="1"
                    />
                  </td>
                  <td>
                    <span className="computed-value">{fmt(line_total)}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '3px 8px', fontSize: 10 }}
                      onClick={() => removeItem(item.id)}
                      type="button"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: 28 }}>
        <button className="btn btn-ghost" onClick={addItem} type="button">
          + Мөр нэмэх
        </button>
      </div>

      {/* Rate card hint */}
      <div className="info-box" style={{ marginBottom: 28 }}>
        <strong>Rate card:</strong>{' '}
        Рийлс 2M₮ · Постер 500K₮ · Видео 5M₮ · Сошиал пост 300K₮ —
        контент төрөл сонгоход автоматаар бөглөгдөнө. Та дарж засаж болно.
      </div>

      {/* Discount & VAT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 40px', marginBottom: 28 }}>
        <div>
          <label className="field-label">Хөнгөлөлт (%)</label>
          <input
            className="field-input"
            type="number"
            min={0}
            max={100}
            value={data.discount_pct || ''}
            placeholder="0"
            onChange={e => setField('discount_pct', Number(e.target.value))}
          />
        </div>
        <div>
          <label className="field-label">НӨАТ (%)</label>
          <input
            className="field-input"
            type="number"
            min={0}
            max={100}
            value={data.vat_pct}
            onChange={e => setField('vat_pct', Number(e.target.value))}
          />
        </div>
      </div>

      {/* Totals */}
      <div style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 2,
        padding: '4px 24px 20px',
      }}>
        <div className="totals-row">
          <span style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Нийт дүн
          </span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16 }}>{fmt(totals.subtotal)}</span>
        </div>

        {data.discount_pct > 0 && (
          <div className="totals-row">
            <span style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Хөнгөлөлт ({data.discount_pct}%)
            </span>
            <span style={{ color: 'var(--danger)', fontFamily: 'var(--font-serif)', fontSize: 16 }}>
              −{fmt(totals.discount_amount)}
            </span>
          </div>
        )}

        <div className="totals-row">
          <span style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            НӨАТ-гүй нийт
          </span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16 }}>{fmt(totals.total_before_vat)}</span>
        </div>

        <div className="totals-row">
          <span style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            НӨАТ ({data.vat_pct}%)
          </span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16 }}>{fmt(totals.vat_amount)}</span>
        </div>

        <div className="totals-row grand">
          <span>Нийт төлбөр</span>
          <span>{fmt(totals.grand_total)}</span>
        </div>
      </div>
    </div>
  );
}
