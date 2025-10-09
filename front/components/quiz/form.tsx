'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserQuizData, UserQuizQuestion, UserQuizQuestionAnswer } from '@/types/quiz';

type QuizFormProps = {
  quizData: UserQuizData;
  quizQuestion: UserQuizQuestion;
  currentIndex: number;
  onAnswered?: () => void;
};

const FormSchema = z.object({
  optionId: z.coerce.number({
    required_error: 'Please specify the option',
    invalid_type_error: 'Please specify the option',
  }),
  questionId: z.coerce.number({
    required_error: 'Please specify the question',
    invalid_type_error: 'Please specify the question',
  }),
});

export function QuizForm({ quizData, quizQuestion, currentIndex, onAnswered }: QuizFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const [answer, setAnswer] = useState<UserQuizQuestionAnswer | null>(null);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_URL}/v1/quiz/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          questionId: data.questionId,
          optionId: data.optionId,
        }),
      });

      const result = await res.json();
      const resData = result.data as UserQuizQuestionAnswer;

      if (!res.ok || result.status !== 'success') {
        throw new Error(result.message || 'Error sending answer');
      }

      setAnswer(resData);

      if (resData.isCorrectAnswer) {
        toast.success('Success!', {
          description: 'The selected answer option is correct!',
        });
      } else {
        toast.warning('Incorrect option!', {
          description: 'The selected answer option is not correct!',
        });
      }
    } catch (err) {
      toast.error('Error!', {
        description: err.message || 'Error sending answer',
      });
    }
  }

  useEffect(() => {
    form.setValue('questionId', quizQuestion.id);
    setAnswer(null);
  }, [quizQuestion.id, form]);

  return (
    <>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Question #{currentIndex + 1}</h4>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
          <FormField
            control={form.control}
            name="optionId"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>{quizQuestion.question}</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col" disabled={!!answer}>
                    {quizQuestion.options.map((option) => {
                      const isSelected = Number(field.value) === option.id;
                      const isCorrect = answer?.correctOptionId === option.id;
                      const isWrong = isSelected && !answer?.isCorrectAnswer && answer?.selectedOptionId === option.id;

                      let labelClass = 'font-normal';
                      if (isCorrect) {
                        labelClass += ' text-green-600 font-semibold';
                      }
                      if (isWrong) {
                        labelClass += ' text-red-600 font-semibold';
                      }

                      return (
                        <FormItem key={option.id} className="flex items-center gap-3">
                          <FormControl>
                            <RadioGroupItem value={option.id} />
                          </FormControl>
                          <FormLabel className={labelClass}>{option.option}</FormLabel>
                        </FormItem>
                      );
                    })}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Input type="hidden" name="questionId" value={quizQuestion.id} {...form.register('questionId')} />

          {!answer && <Button type="submit">Answer</Button>}

          {answer && (
            <Button type="button" variant="outline" onClick={() => onAnswered?.(answer)}>
              Next
            </Button>
          )}
        </form>
      </Form>
    </>
  );
}
