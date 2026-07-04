'use client';

const SECTIONS = [
  { id: 'block-0', label: 'Нүүр' },
  { id: 'block-1', label: '1. Нөхцөл' },
  { id: 'block-2', label: '2. Persona' },
  { id: 'block-3', label: '3. Инсайт' },
  { id: 'block-4', label: '4. Стратеги' },
  { id: 'block-5', label: '5. Санаа' },
  { id: 'block-6', label: '6. Үнэ' },
];

interface Props {
  active: string;
}

export default function SectionNav({ active }: Props) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="sidebar-nav">
      {SECTIONS.map(s => (
        <button
          key={s.id}
          onClick={() => scrollTo(s.id)}
          title={s.label}
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            background: active === s.id ? 'var(--accent)' : 'var(--border)',
            transform: active === s.id ? 'scale(1.4)' : 'scale(1)',
            transition: 'all 0.2s',
          }}
          aria-label={s.label}
        />
      ))}
    </nav>
  );
}
