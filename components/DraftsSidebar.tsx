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
    <aside style={{
      width: 260,
      flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>📋 Ноорогууд</div>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onNew}>
          + Шинэ proposal
        </button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 8px' }}>
        {drafts.length === 0 && (
          <div style={{ padding: 16, color: 'var(--muted)', fontSize: 13, textAlign: 'center' }}>
            Ноорог байхгүй байна
          </div>
        )}
        {drafts.map(p => (
          <div
            key={p.id}
            onClick={() => onSelect(p)}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              marginBottom: 4,
              background: p.id === currentId ? 'rgba(108,99,255,0.15)' : 'transparent',
              border: `1px solid ${p.id === currentId ? 'var(--accent)' : 'transparent'}`,
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p.header.brand_name || 'Нэргүй'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 6 }}>
              {p.header.campaign_name || 'Кампани нэргүй'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>
              {new Date(p.updatedAt).toLocaleDateString('mn-MN')}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn btn-ghost"
                style={{ padding: '2px 8px', fontSize: 11 }}
                onClick={e => handleDuplicate(e, p)}
              >
                Хувилах
              </button>
              <button
                className="btn btn-danger"
                style={{ padding: '2px 8px', fontSize: 11 }}
                onClick={e => handleDelete(e, p.id)}
              >
                Устгах
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
