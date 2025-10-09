import React from 'react';
import { Table, TableBody, TableCell, TableFooter, TableRow } from '@/components/ui/table';
import { UserQuizData } from '@/types/quiz';

type QuizFormProps = {
  quizData: UserQuizData;
  correctAnswers: number;
  wrongAnswers: number;
  earnedTokens: number;
};

export function Summary({ quizData, correctAnswers, wrongAnswers, earnedTokens }: QuizFormProps) {
  return (
    <>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Summary</h4>

      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Total Questions</TableCell>
            <TableCell className="text-right">{quizData.totalQuestions}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Correct Answers</TableCell>
            <TableCell className="text-right">{correctAnswers}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Wrong Answers</TableCell>
            <TableCell className="text-right">{wrongAnswers}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Earned Tokens</TableCell>
            <TableCell className="text-right">{earnedTokens}</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Progress</TableCell>
            <TableCell className="text-right">
              {correctAnswers + wrongAnswers} / {quizData.totalQuestions}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </>
  );
}
