import { UserQuizQuestionOption } from './user-quiz-question-option.type';

/**
 * User Quiz Question Type.
 */
export type UserQuizQuestion = {
  id: number;
  question: string;
  isAnswered: boolean;
  isCorrect: boolean;
  options: UserQuizQuestionOption[];
};
