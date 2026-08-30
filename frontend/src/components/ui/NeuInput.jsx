export default function NeuInput({value,onChange,placeholder,type="text"}){
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="neu-inset w-full px-4 py-3 outline-none bg-transparent"
    />
  )
}
