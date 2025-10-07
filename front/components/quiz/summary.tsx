import { Table, TableBody, TableCell, TableFooter, TableRow } from '@/components/ui/table';
import { UserQuizData } from '@/types/quiz';

export function Summary({ quizData }: UserQuizData) {
  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Total Questions</TableCell>
          <TableCell className="text-right">{quizData.totalQuestions}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Correct Answers</TableCell>
          <TableCell className="text-right">{quizData.correctAnswers}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Wrong Answers</TableCell>
          <TableCell className="text-right">{quizData.wrongAnswers}</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Progress</TableCell>
          <TableCell className="text-right">
            {quizData.correctAnswers + quizData.wrongAnswers} / {quizData.totalQuestions}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
