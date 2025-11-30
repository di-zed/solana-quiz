-- CreateTable
CREATE TABLE "public"."quiz_answers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "option_id" INTEGER NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quiz_answers_user_id_quiz_id_idx" ON "public"."quiz_answers"("user_id", "quiz_id");

-- AddForeignKey
ALTER TABLE "public"."quiz_answers" ADD CONSTRAINT "quiz_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quiz_answers" ADD CONSTRAINT "quiz_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quiz_answers" ADD CONSTRAINT "quiz_answers_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "public"."quiz_question_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
