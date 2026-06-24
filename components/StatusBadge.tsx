type Status = string;

const styles: Record<string, string> = {
  Pending: 'bg-orange-50 text-orange-600 border border-orange-200',
  Sent: 'bg-blue-50 text-blue-600 border border-blue-200',
  Accepted: 'bg-green-50 text-green-700 border border-green-200',
  Approved: 'bg-green-50 text-green-700 border border-green-200',
  Done: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

export default function StatusBadge({ status }: { status: Status }) {
  const cls = styles[status] ?? 'bg-gray-100 text-gray-600 border border-gray-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}
