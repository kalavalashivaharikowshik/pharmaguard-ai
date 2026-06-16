interface BadgeProps {
  status:
    | "safe"
    | "expired"
    | "recalled"
    | "pending";
}

export default function Badge({ status }: BadgeProps) {
  const styles = {
    safe: "bg-green-100 text-green-700",
    expired: "bg-orange-100 text-orange-700",
    recalled: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`
        px-3 py-1 rounded-full text-sm font-medium
        ${styles[status]}
      `}
    >
      {status.toUpperCase()}
    </span>
  );
}