'use client';

import React, { useEffect, useState } from 'react';
import { AlertElement } from '@/components/elements/alert';
import { QuizForm } from '@/components/quiz/form';
import { Summary } from '@/components/quiz/summary';
import { UserQuizData, UserQuizQuestion, UserQuizQuestionAnswer } from '@/types/quiz';

export default function Quiz() {
  const [quizData, setQuizData] = useState<UserQuizData | null>(null);

  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [wrongAnswers, setWrongAnswers] = useState<number>(0);
  const [earnedTokens, setEarnedTokens] = useState<number>(0);

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

        setIsQuizCompleted(firstUnansweredIndex === -1);
        setCurrentIndex(startIndex);
        setEarnedTokens(data.data.earnedTokens);

        setCorrectAnswers(data.data.correctAnswers || 0);
        setWrongAnswers(data.data.wrongAnswers || 0);
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
      <Summary quizData={quizData} correctAnswers={correctAnswers} wrongAnswers={wrongAnswers} earnedTokens={earnedTokens} />
      <hr />
      {!isQuizCompleted ? (
        <QuizForm
          quizData={quizData}
          quizQuestion={currentQuestion}
          currentIndex={currentIndex}
          onAnswered={(answer: UserQuizQuestionAnswer) => {
            setIsQuizCompleted(answer.isQuizCompleted);
            setCurrentIndex((prev) => prev + 1);
            setEarnedTokens(answer.earnedTokens);

            if (answer.isCorrectAnswer) {
              setCorrectAnswers((prev) => prev + 1);
            } else {
              setWrongAnswers((prev) => prev + 1);
            }
          }}
        />
      ) : (
        <AlertElement
          title="Quiz completed!"
          description={
            <>
              You’ve answered all the questions 🎉
              <br />
              {earnedTokens > 0 ? (
                <>
                  You’ve earned {earnedTokens} {earnedTokens > 1 ? 'tokens' : 'token'}, which will be credited to your account soon 💰
                </>
              ) : (
                <>😔 No luck this time! But don’t worry - a new quiz awaits you tomorrow. Give it another shot and win tokens! 💪</>
              )}
            </>
          }
        />
      )}
    </div>
  );
}
