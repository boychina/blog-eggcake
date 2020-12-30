import { parseISO, format } from "date-fns";
import { DATE_FORMAT } from '@/config';

export default function DateFormatter({ dateString }) {
  const date = parseISO(dateString);
  return <time dateTime={dateString}>{format(date, DATE_FORMAT)}</time>;
}
