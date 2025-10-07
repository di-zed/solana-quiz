'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserQuizData, UserQuizQuestion } from '@/types/quiz';

type QuizFormProps = {
  quizData: UserQuizData;
  quizQuestion: UserQuizQuestion;
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

export function QuizForm({ quizData, quizQuestion }: QuizFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

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

      if (!res.ok || result.status !== 'success') {
        throw new Error(result.message || 'Error sending answer');
      }

      toast.success('The answer has been sent!', {
        description: `Вопрос ${data.questionId}, вариант ${data.optionId}`,
      });
    } catch (err) {
      toast.error('Error!', {
        description: err.message || 'Error sending answer',
      });
    }

    // toast('You submitted the following values', {
    //   description: (
    //     <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
    //       <code className="text-white">{JSON.stringify(data, null, 2)}</code>
    //     </pre>
    //   ),
    // });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="optionId"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{quizQuestion.question}</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col">
                  {quizQuestion.options.map((option) => (
                    <FormItem key={option.id} className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value={option.id} />
                      </FormControl>
                      <FormLabel className="font-normal">{option.option}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Input type="hidden" name="questionId" value={quizQuestion.id} {...form.register('questionId')} />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
