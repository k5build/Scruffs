import { redirect } from 'next/navigation';

// Redirect old /more to /profile
export default function MorePage() {
  redirect('/profile');
}
