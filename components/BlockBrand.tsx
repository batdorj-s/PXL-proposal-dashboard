'use client';
import { BrandAssets } from '@/types';

interface Props {
  data: BrandAssets;
  onChange: (d: BrandAssets) => void;
}

const FONT_OPTIONS_SERIF = [
  'Cormorant Garamond',
  'Georgia',
  'Playfair Display',
  'Merriweather',
  'PT Serif',
  'Times New Roman',
];

const FONT_OPTIONS_SANS = [
  'Space Grotesk',
  'Inter',
  'System UI',
  'Helvetica Neue',
  'DM Sans',
  'Public Sans',
];

export default function BlockBrand({ data, onChange }: Props) {
  const set = (k: keyof BrandAssets, v: string) => onChange({ ...data, [k]: v });

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Зураг 2MB-с бага байх ёстой'); return; }
    const reader = new FileReader();
    reader.onload = () => set('logo', reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div id="block-0b" className="block-card">
      <div className="block-header">
        <span className="block-number">✦</span>
        <div className="block-title-group">
          <div className="block-subtitle">Brand Assets</div>
          <h2 className="block-title">Брэндийн тохиргоо</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 40px' }}>

        {/* Logo */}
        <div>
          <label className="field-label">Лого</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 3,
              background: 'var(--surface-2)',
              border: '1px solid var(--border-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0,
            }}>
              {data.logo ? (
                <img src={data.logo} alt="logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, color: 'var(--muted)' }}>—</span>
              )}
            </div>
            <label style={{ cursor: 'pointer' }}>
              <input type="file" accept="image/*" onChange={handleLogo} style={{ display: 'none' }} />
              <span className="btn btn-ghost" style={{ cursor: 'pointer' }}>Файл сонгох</span>
            </label>
            {data.logo && (
              <button className="btn btn-danger" style={{ padding: '3px 7px', fontSize: 10 }} onClick={() => set('logo', '')}>✕</button>
            )}
          </div>
          <div className="field-hint">Дээд тал 2MB. PNG / JPG / WebP</div>
        </div>

        {/* Colors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label className="field-label" style={{ margin: 0 }}>Брэндийн өнгө</label>
          {[
            { key: 'primary_color' as keyof BrandAssets, label: 'Үндсэн өнгө' },
            { key: 'secondary_color' as keyof BrandAssets, label: 'Хоёрдогч өнгө' },
            { key: 'accent_color' as keyof BrandAssets, label: 'Текст өнгө' },
          ].map(c => (
            <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="color"
                value={data[c.key]}
                onChange={e => set(c.key, e.target.value)}
                style={{
                  width: 32, height: 32, padding: 0, border: '1px solid var(--border-2)',
                  borderRadius: 3, cursor: 'pointer', background: 'transparent',
                }}
              />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: 'var(--muted)', width: 90, flexShrink: 0 }}>{c.label}</span>
              <input
                className="field-input"
                style={{ fontFamily: 'var(--font-sans)', fontSize: 10, padding: '4px 0' }}
                value={data[c.key]}
                onChange={e => set(c.key, e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* Fonts */}
        <div>
          <label className="field-label">Гарчиг фонт (Serif)</label>
          <select className="field-select" value={data.font_serif}
            onChange={e => set('font_serif', e.target.value)}>
            {FONT_OPTIONS_SERIF.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <div className="field-hint" style={{ marginTop: 4 }}>Гарчиг, блок дугаарт хэрэглэгдэнэ</div>
        </div>

        <div>
          <label className="field-label">Body фонт (Sans)</label>
          <select className="field-select" value={data.font_sans}
            onChange={e => set('font_sans', e.target.value)}>
            {FONT_OPTIONS_SANS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <div className="field-hint" style={{ marginTop: 4 }}>Навигац, товч, үнийн дүнгүүдэд хэрэглэгдэнэ</div>
        </div>

      </div>

      {/* Preview */}
      <div style={{ marginTop: 24 }}>
        <label className="field-label">Харагдах байдал</label>
        <div style={{
          background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3,
          padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: data.primary_color,
            flexShrink: 0,
          }} />
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: data.font_serif, fontSize: 18, color: data.accent_color, lineHeight: 1.3,
            }}>
              {data.font_serif} — ABCabc 123
            </div>
            <div style={{
              fontFamily: data.font_sans, fontSize: 11, color: data.secondary_color, marginTop: 4,
            }}>
              {data.font_sans} — ABCabc 123
            </div>
          </div>
          <div style={{
            padding: '4px 10px', borderRadius: 2,
            background: data.primary_color, color: data.accent_color,
            fontFamily: data.font_sans, fontSize: 9, fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap',
          }}>
            Preview
          </div>
        </div>
      </div>

    </div>
  );
}
