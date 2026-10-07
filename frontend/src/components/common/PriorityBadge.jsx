export default function PriorityBadge({ priority }) {
  const config = {
    HIGH: {
      label: 'Cao',
      color: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA',
      icon: '🔴',
    },
    MEDIUM: {
      label: 'Trung bình',
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A',
      icon: '🟡',
    },
    LOW: {
      label: 'Thấp',
      color: '#4F46E5',
      bg: '#EEF2FF',
      border: '#C7D2FE',
      icon: '🔵',
    },
  };

  const item = config[priority] || config.MEDIUM;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 9px',
        borderRadius: '6px',
        fontSize: '0.78rem',
        fontWeight: 600,
        color: item.color,
        backgroundColor: item.bg,
        border: `1px solid ${item.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: '0.65rem' }}>{item.icon}</span>
      {item.label}
    </span>
  );
}
