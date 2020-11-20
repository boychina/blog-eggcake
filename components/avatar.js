export default function Avatar({ name, picture }) {
  return (
    <div className="flex items-center">
      <img src={picture} className="w-8 h-8 rounded-full mr-4" alt={name} />
      <div className="text-sm">{name}</div>
    </div>
  )
}
