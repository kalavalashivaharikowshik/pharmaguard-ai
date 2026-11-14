interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "light";
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const styles = {
    primary:
      "bg-teal-700 hover:bg-teal-800 text-white shadow-md hover:shadow-xl",

    secondary:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-xl",

    light:
      "bg-white text-teal-700 hover:bg-slate-100 shadow-md hover:shadow-xl",
  };

  return (
    <button
      disabled={disabled}
      className={`
        inline-flex
        items-center
        justify-center
        px-5
        py-3
        rounded-xl
        font-semibold
        tracking-wide
        transition-all
        duration-300
        ease-in-out
        active:scale-95
        disabled:opacity-60
        disabled:cursor-not-allowed
        disabled:hover:shadow-md
        ${styles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}