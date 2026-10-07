export default function PriorityBadge({ priority }) {
  const config = {
    HIGH: {
      label: 'Cao',
      color: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA',
    },
    MEDIUM: {
      label: 'Trung bình',
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A',
    },
    LOW: {
      label: 'Thấp',
      color: '#4F46E5',
      bg: '#EEF2FF',
      border: '#C7D2FE',
    },
  };

  const item = config[priority] || config.MEDIUM;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '0.78rem',
        fontWeight: 600,
        color: item.color,
        backgroundColor: item.bg,
        border: `1px solid ${item.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="none"
        aria-hidden="true"
      >
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
        <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2.5"></line>
      </svg>
      {item.label}
    </span>
  );
}
