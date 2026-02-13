import { redirect } from 'next/navigation';

export default function SRAPage() {
  // Redirect to IT Risk Assessment (Security Risk Assessment)
  redirect('/audit/it-risk');
}
