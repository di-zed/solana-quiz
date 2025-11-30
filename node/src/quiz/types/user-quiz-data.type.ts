import { UserQuizQuestion } from './user-quiz-question.type';

/**
 * User Quiz Data Type.
 */
export type UserQuizData = {
  isCompleted: boolean;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  questions: UserQuizQuestion[];
  earnedTokens: number;
  streakDays: number;
};
