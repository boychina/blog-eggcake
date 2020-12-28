import DateFormatter from "./DateFormatter";

export default function Avatar({ name, picture, date }) {
  return (
    <div className="flex items-center">
      <img src={picture} className="w-8 h-8 rounded-full mr-4" alt={name} />
      <div className="text-sm text-cyan-600">{name}</div>
      <span className="ml-1 text-gray-500"><DateFormatter dateString={date} /></span>
    </div>
  );
}
