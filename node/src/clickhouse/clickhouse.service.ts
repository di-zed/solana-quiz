import { ClickHouseClient } from '@clickhouse/client';
import { InsertResult } from '@clickhouse/client-common/dist/client';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ClickHouseService {
  public constructor(
    @Inject('CLICKHOUSE') private readonly client: ClickHouseClient,
  ) {}

  /**
   * Saves a single quiz answer event into ClickHouse.
   *
   * @param answer
   * @returns Promise<InsertResult>
   */
  public async saveAnswer(answer: ClickHouseAnswer): Promise<InsertResult> {
    /*
    CREATE TABLE IF NOT EXISTS quiz_answers
    (
        quiz_id       UInt32,
        user_id       UInt32,
        question_id   UInt32,
        option_id     UInt32,
        is_correct    UInt8,
        created_at    DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    ORDER BY (quiz_id, user_id, question_id);
    */

    return this.client.insert({
      table: 'quiz_answers',
      values: [answer],
      format: 'JSONEachRow',
    });
  }

  /**
   * Saves a single quiz reward event into ClickHouse.
   *
   * @param reward
   * @returns Promise<InsertResult>
   */
  public async saveReward(reward: ClickHouseReward): Promise<InsertResult> {
    /*
    CREATE TABLE IF NOT EXISTS quiz_rewards
    (
        quiz_id         UInt32,
        user_id         UInt32,
        total_questions UInt32,
        correct_answers UInt32,
        wrong_answers   UInt32,
        earned_tokens   UInt32,
        streak_days     UInt32,
        created_at      DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    ORDER BY (user_id, quiz_id);
    */

    return this.client.insert({
      table: 'quiz_rewards',
      values: [reward],
      format: 'JSONEachRow',
    });
  }
}

/**
 * Click House Answer Type.
 */
type ClickHouseAnswer = {
  quiz_id: number;
  user_id: number;
  question_id: number;
  option_id: number;
  is_correct: boolean;
  created_at?: string;
};

/**
 * Click House Reward Type.
 */
type ClickHouseReward = {
  quiz_id: number;
  user_id: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  earned_tokens: number;
  streak_days: number;
  created_at?: string;
};
