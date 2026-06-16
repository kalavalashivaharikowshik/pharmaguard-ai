interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Input({
  className = "",
  ...props
}: InputProps) {
  return (
    <input
      className={`
        w-full
        border
        border-slate-300
        rounded-lg
        px-4
        py-2
        focus:outline-none
        focus:ring-2
        focus:ring-[#0F4C81]
        ${className}
      `}
      {...props}
    />
  );
}