import dayjs from "dayjs";
import { DATE_FORMAT } from "@/config";

interface DateFormatterProps {
  dateString: string;
}

export default function DateFormatter({ dateString }: DateFormatterProps) {
  return <time dateTime={dateString}>{dayjs(dateString).format(DATE_FORMAT)}</time>;
}
