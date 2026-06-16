interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const styles = {
    primary:
      "bg-[#0F4C81] hover:bg-[#0D3F6A] text-white",
    secondary:
      "bg-[#2E8B57] hover:bg-[#256F46] text-white",
  };

  return (
    <button
      className={`
        px-4 py-2 rounded-lg font-medium
        transition duration-200 cursor-pointer
        ${styles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}