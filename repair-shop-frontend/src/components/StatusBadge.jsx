import { Tag } from 'antd';
import { TICKET_STATUS_COLORS, TICKET_STATUS_LABELS } from '../utils/constants';
export function TicketStatusBadge({ status }) {
  return <Tag color={TICKET_STATUS_COLORS[status]}>{TICKET_STATUS_LABELS[status] || status}</Tag>;
}
