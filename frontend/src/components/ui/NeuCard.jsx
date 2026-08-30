export default function NeuCard({children, className=""}){
  return (
    <div className={`neu-raised p-6 md:p-8 ${className}`}>
      {children}
    </div>
  )
}
