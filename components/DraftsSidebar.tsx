'use client';
import { Proposal } from '@/types';
import { deleteDraft, duplicateDraft } from '@/lib/storage';

interface Props {
  drafts: Proposal[];
  currentId: string;
  onSelect: (p: Proposal) => void;
  onNew: () => void;
  onRefresh: () => void;
}

export default function DraftsSidebar({ drafts, currentId, onSelect, onNew, onRefresh }: Props) {
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Энэ ноорогийг устгах уу?')) {
      deleteDraft(id);
      onRefresh();
    }
  };

  const handleDuplicate = (e: React.MouseEvent, p: Proposal) => {
    e.stopPropagation();
    const copy = duplicateDraft(p);
    onRefresh();
    onSelect(copy);
  };

  return (
    <aside
      className="no-print"
      style={{
        width: 248,
        flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Header */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 9,
          fontWeight: 500,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: 14,
        }}>
          Ноорогууд
        </div>
        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', fontSize: 10 }}
          onClick={onNew}
        >
          + Шинэ proposal
        </button>
      </div>

      {/* Draft list */}
      <div style={{ overflowY: 'auto', flex: 1, padding: '12px 8px' }}>
        {drafts.length === 0 && (
          <div style={{
            padding: '24px 16px',
            color: 'var(--muted)',
            fontSize: 12,
            textAlign: 'center',
            fontStyle: 'italic',
          }}>
            Ноорог байхгүй байна
          </div>
        )}

        {drafts.map(p => {
          const isActive = p.id === currentId;
          return (
            <div
              key={p.id}
              onClick={() => onSelect(p)}
              style={{
                padding: '12px 14px',
                borderRadius: 2,
                cursor: 'pointer',
                marginBottom: 2,
                background: isActive ? 'var(--gold-glow)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--gold-dim)' : 'transparent'}`,
                borderLeft: `2px solid ${isActive ? 'var(--gold)' : 'transparent'}`,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--surface-2)';
                  e.currentTarget.style.borderLeftColor = 'var(--border-2)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderLeftColor = 'transparent';
                }
              }}
            >
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 15,
                fontWeight: 300,
                marginBottom: 2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: isActive ? 'var(--text)' : 'var(--muted-2)',
              }}>
                {p.header.brand_name || 'Нэргүй'}
              </div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                color: 'var(--muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: 8,
                fontStyle: 'italic',
              }}>
                {p.header.campaign_name || 'Кампани нэргүй'}
              </div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 9,
                color: 'var(--muted)',
                letterSpacing: '0.08em',
                marginBottom: 8,
              }}>
                {new Date(p.updatedAt).toLocaleDateString('mn-MN')}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '2px 8px', fontSize: 9 }}
                  onClick={e => handleDuplicate(e, p)}
                >
                  Хувилах
                </button>
                <button
                  className="btn btn-danger"
                  style={{ padding: '2px 8px', fontSize: 9 }}
                  onClick={e => handleDelete(e, p.id)}
                >
                  Устгах
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 9,
          color: 'var(--muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Local · Auto-saved
        </div>
      </div>
    </aside>
  );
}
