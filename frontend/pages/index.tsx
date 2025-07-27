import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    // TODO: Check auth, redirect accordingly
    router.push('/login');
  }, [router]);
  return null;
} 