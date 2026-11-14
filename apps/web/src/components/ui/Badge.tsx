interface BadgeProps {
  status:
    | "safe"
    | "expired"
    | "recalled"
    | "pending";
}

export default function Badge({
  status,
}: BadgeProps) {
  const styles = {
    safe:
      "bg-emerald-100 text-emerald-700",

    expired:
      "bg-orange-100 text-orange-700",

    recalled:
      "bg-red-100 text-red-700",

    pending:
      "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-3.5
        py-1.5
        text-xs
        font-semibold
        tracking-wide
        shadow-sm
        ${styles[status]}
      `}
    >
      {status.toUpperCase()}
    </span>
  );
}