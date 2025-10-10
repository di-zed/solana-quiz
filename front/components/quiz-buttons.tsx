'use client';

import { ArrowUpRightIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';

export default function QuizButtons() {
  const { user } = useAuth();
  const router = useRouter();

  const handleGoToQuiz = () => {
    router.push('/quiz');
  };

  const handleGoToStatistics = () => {
    router.push('/statistics');
  };

  return (
    <>
      <div className="flex gap-4 items-center flex-col sm:flex-row">
        {user ? (
          <>
            <Button onClick={handleGoToQuiz}>
              <ArrowUpRightIcon />
              Go to the Quiz section
            </Button>

            <Button variant="outline" onClick={handleGoToStatistics}>
              Statistics
            </Button>
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
