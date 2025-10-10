'use client';

import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserRewardData } from '@/types/quiz';

export function Rewards({ rewardData }: UserRewardData) {
  return (
    <>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Rewards</h4>

      <Table>
        <TableCaption>A list of your recent rewards.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead className="text-right">Total Questions</TableHead>
            <TableHead className="text-right">Correct Answers</TableHead>
            <TableHead className="text-right">Wrong Answers</TableHead>
            <TableHead className="text-right">Earned Tokens</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rewardData.rewards.map((reward) => (
            <TableRow key={reward.date}>
              <TableCell className="font-medium">{reward.date}</TableCell>
              <TableCell className="text-right">{reward.totalQuestions}</TableCell>
              <TableCell className="text-right">{reward.correctAnswers}</TableCell>
              <TableCell className="text-right">{reward.wrongAnswers}</TableCell>
              <TableCell className="text-right">{reward.earnedTokens}</TableCell>
              <TableCell>{reward.isSent ? 'Sent' : 'Waiting'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell className="text-right">{rewardData.totalQuestions}</TableCell>
            <TableCell className="text-right">{rewardData.correctAnswers}</TableCell>
            <TableCell className="text-right">{rewardData.wrongAnswers}</TableCell>
            <TableCell className="text-right">{rewardData.earnedTokens}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </>
  );
}
