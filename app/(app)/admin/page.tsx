import { redirect } from 'next/navigation';
import { routes } from '@/config';

export default function AdminPage() {
  redirect(routes.adminDashboard);
}
