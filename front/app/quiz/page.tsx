'use client';

import Quiz from '@/components/quiz/quiz';

export default function QuizPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Quiz />
      </div>
    </div>
  );
}
