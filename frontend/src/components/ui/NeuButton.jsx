export default function NeuButton({children,onClick,className=""}){
  return (
    <button
      onClick={onClick}
      className={`neu-raised px-5 py-3 text-neuPrimary font-medium active:neu-inset transition-all duration-150 ${className}`}
    >
      {children}
    </button>
  )
}
