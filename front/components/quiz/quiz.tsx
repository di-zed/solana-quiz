'use client';

import React, { useEffect, useState } from 'react';
import { AlertElement } from '@/components/elements/alert';
import { QuizForm } from '@/components/quiz/form';
import { Summary } from '@/components/quiz/summary';
import { UserQuizData, UserQuizQuestion } from '@/types/quiz';

export default function Quiz() {
  const [quizData, setQuizData] = useState<UserQuizData | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizData = async (): Promise<void> => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_URL}/v1/quiz/questions`, {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }

        const data = await res.json();

        if (data.status !== 'success' || !data.data) {
          throw new Error(`Failed to fetch data`);
        }

        const firstUnansweredIndex = data.data.questions.findIndex((q: UserQuizQuestion) => !q.isAnswered);
        const startIndex = firstUnansweredIndex !== -1 ? firstUnansweredIndex : data.data.questions.length - 1;

        setQuizData(data.data);
        setCurrentIndex(startIndex);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, []);

  if (loading) {
    return <AlertElement title="Loading" description="Loading questions..." />;
  }
  if (error) {
    return <AlertElement variant="destructive" title="Error" description={error} />;
  }
  if (!quizData || quizData.questions.length === 0) {
    return <AlertElement description="No questions found." />;
  }

  const currentQuestion = quizData.questions[currentIndex];

  return (
    <div className="space-y-12">
      <Summary quizData={quizData} />
      <QuizForm quizData={quizData} quizQuestion={currentQuestion} />
    </div>
  );
}
