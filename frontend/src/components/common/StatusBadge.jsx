export default function StatusBadge({ status }) {
  const config = {
    TODO: {
      label: 'Chờ làm',
      color: '#475569',
      bg: '#F1F5F9',
      border: '#E2E8F0',
      dot: '#94A3B8',
    },
    IN_PROGRESS: {
      label: 'Đang làm',
      color: '#2563EB',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      dot: '#3B82F6',
    },
    DONE: {
      label: 'Hoàn thành',
      color: '#16A34A',
      bg: '#F0FDF4',
      border: '#BBF7D0',
      dot: '#22C55E',
    },
  };

  const item = config[status] || config.TODO;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '0.78rem',
        fontWeight: 600,
        color: item.color,
        backgroundColor: item.bg,
        border: `1px solid ${item.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: item.dot,
        }}
      />
      {item.label}
    </span>
  );
}
