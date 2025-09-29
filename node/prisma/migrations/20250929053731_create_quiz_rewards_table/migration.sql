-- CreateTable
CREATE TABLE "public"."quiz_rewards" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "total_questions" INTEGER NOT NULL,
    "correct_answers" INTEGER NOT NULL,
    "wrong_answers" INTEGER NOT NULL,
    "earned_tokens" INTEGER NOT NULL,
    "is_sent" BOOLEAN NOT NULL,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quiz_rewards_user_id_quiz_id_key" ON "public"."quiz_rewards"("user_id", "quiz_id");

-- AddForeignKey
ALTER TABLE "public"."quiz_rewards" ADD CONSTRAINT "quiz_rewards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
