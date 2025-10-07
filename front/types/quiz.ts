/**
 * User Quiz Question Option Type.
 */
export type UserQuizQuestionOption = {
  id: number;
  option: string;
};

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

/**
 * User Quiz Data Type.
 */
export type UserQuizData = {
  isCompleted: boolean;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  questions: UserQuizQuestion[];
};
