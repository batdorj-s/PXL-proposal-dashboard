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
    if (confirm('Энэ ноорогийг устгах уу?')) { deleteDraft(id); onRefresh(); }
  };

  const handleDuplicate = (e: React.MouseEvent, p: Proposal) => {
    e.stopPropagation();
    const copy = duplicateDraft(p); onRefresh(); onSelect(copy);
  };

  return (
    <aside className="sidebar no-print">
      <div className="sidebar-head">
        <div className="sidebar-heading">Ноорогууд</div>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onNew}>
          + Шинэ
        </button>
      </div>

      <div className="sidebar-body">
        {drafts.length === 0 && (
          <div style={{ padding: '24px 12px', color: 'var(--muted)', fontSize: 11, textAlign: 'center', fontStyle: 'italic' }}>
            Ноорог байхгүй
          </div>
        )}

        {drafts.map(p => (
          <div
            key={p.id}
            className={`draft-item${p.id === currentId ? ' is-active' : ''}`}
            onClick={() => onSelect(p)}
          >
            <div className="draft-item-name">{p.header.brand_name || 'Нэргүй'}</div>
            <div className="draft-item-sub">{p.header.campaign_name || 'Кампани нэргүй'}</div>
            <div className="draft-item-date">{new Date(p.updatedAt).toLocaleDateString('mn-MN')}</div>
            <div className="draft-item-actions">
              <button className="btn btn-ghost" style={{ padding: '2px 8px' }} onClick={e => handleDuplicate(e, p)}>Хувилах</button>
              <button className="btn btn-danger" style={{ padding: '2px 8px' }} onClick={e => handleDelete(e, p.id)}>Устгах</button>
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-foot">
        <span className="sidebar-foot-text">Local · Auto-saved</span>
      </div>
    </aside>
  );
}
