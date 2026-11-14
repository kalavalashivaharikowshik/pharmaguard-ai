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
        rounded-xl
        border
        border-slate-300
        bg-white
        px-4
        py-3
        text-slate-800
        placeholder:text-slate-400
        shadow-sm
        transition-all
        duration-300
        focus:outline-none
        focus:border-teal-700
        focus:ring-4
        focus:ring-teal-100
        hover:border-slate-400
        ${className}
      `}
      {...props}
    />
  );
}