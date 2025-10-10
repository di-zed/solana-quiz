import React from 'react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { UserRewardData } from '@/types/quiz';

export function Summary({ rewardData }: UserRewardData) {
  return (
    <>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Summary</h4>

      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Total Quizzes</TableCell>
            <TableCell className="text-right">{rewardData.totalQuizzes}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Total Questions</TableCell>
            <TableCell className="text-right">{rewardData.totalQuestions}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Correct Answers</TableCell>
            <TableCell className="text-right">{rewardData.correctAnswers}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Wrong Answers</TableCell>
            <TableCell className="text-right">{rewardData.wrongAnswers}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Earned Tokens</TableCell>
            <TableCell className="text-right">{rewardData.earnedTokens}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
}
