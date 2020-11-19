import { parseISO, format } from 'date-fns'

export default function DateFormatter({ dateString }) {
  const date = parseISO(dateString)
  console.log(dateString, date);
  return <time dateTime={dateString}>{format(date, 'LLLL	d, yyyy')}</time>
}
