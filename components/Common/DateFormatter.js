import * as dayjs from 'dayjs'
import { DATE_FORMAT } from '@/config';

export default function DateFormatter({ dateString }) {
  return <time dateTime={dateString}>{dayjs(dateString).format(DATE_FORMAT)}</time>;
}
