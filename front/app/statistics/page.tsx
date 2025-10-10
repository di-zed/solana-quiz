'use client';

import { ArrowLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Statistics from '@/components/statistics/statistics';
import { Button } from '@/components/ui/button';

export default function StatisticsPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.push('/');
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-3xl mx-auto">
        <Button variant="outline" onClick={handleGoBack}>
          <ArrowLeftIcon />
          Back
        </Button>
        <br />
        <br />
        <Statistics />
      </div>
    </div>
  );
}
