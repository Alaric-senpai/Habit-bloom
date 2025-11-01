import { eq, and } from "drizzle-orm";
import { db, schema } from "@/database/calldb";
import {
  createUserAnswerSchema,
  type CreateUserAnswerSchemaType,
} from "@/types";

export class UserAnswerActions {
  /**
   * Save user answer (create or update)
   */
  async saveAnswer(data: CreateUserAnswerSchemaType) {
    const parsed = createUserAnswerSchema.parse(data);

    // Check if answer already exists for this question
    const existing = await db()
      .select()
      .from(schema.userAnswersTable)
      .where(
        and(
          eq(schema.userAnswersTable.userId, parsed.userId),
          eq(schema.userAnswersTable.questionKey, parsed.questionKey)
        )
      )
      .get();

    if (existing) {
      // Update existing answer
      await db()
        .update(schema.userAnswersTable)
        .set({ answer: parsed.answer, updatedAt: new Date() })
        .where(eq(schema.userAnswersTable.id, existing.id));

      return await db()
        .select()
        .from(schema.userAnswersTable)
        .where(eq(schema.userAnswersTable.id, existing.id))
        .get();
    }

    // Create new answer
    const [answer] = await db()
      .insert(schema.userAnswersTable)
      .values(parsed)
      .returning();

    return answer;
  }

  /**
   * Get all user answers
   */
  async getUserAnswers(userId: number) {
    return await db()
      .select()
      .from(schema.userAnswersTable)
      .where(eq(schema.userAnswersTable.userId, userId))
      .all();
  }

  /**
   * Get answer by ID
   */
  async getAnswerById(answerId: number, userId: number) {
    const answer = await db()
      .select()
      .from(schema.userAnswersTable)
      .where(
        and(
          eq(schema.userAnswersTable.id, answerId),
          eq(schema.userAnswersTable.userId, userId)
        )
      )
      .get();

    if (!answer) {
      throw new Error("Answer not found");
    }

    return answer;
  }

  /**
   * Get specific answer by question key
   */
  async getAnswer(userId: number, questionKey: string) {
    return await db()
      .select()
      .from(schema.userAnswersTable)
      .where(
        and(
          eq(schema.userAnswersTable.userId, userId),
          eq(schema.userAnswersTable.questionKey, questionKey)
        )
      )
      .get();
  }

  /**
   * Get answers by question keys (batch)
   */
  async getAnswersByKeys(userId: number, questionKeys: string[]) {
    const answers = await this.getUserAnswers(userId);
    return answers.filter(a => questionKeys.includes(a.questionKey));
  }

  /**
   * Update answer
   */
  async updateAnswer(userId: number, questionKey: string, newAnswer: string) {
    const existing = await this.getAnswer(userId, questionKey);

    if (!existing) {
      throw new Error("Answer not found");
    }

    await db()
      .update(schema.userAnswersTable)
      .set({ answer: newAnswer, updatedAt: new Date() })
      .where(
        and(
          eq(schema.userAnswersTable.userId, userId),
          eq(schema.userAnswersTable.questionKey, questionKey)
        )
      );

    return await this.getAnswer(userId, questionKey);
  }

  /**
   * Delete answer
   */
  async deleteAnswer(userId: number, questionKey: string) {
    await db()
      .delete(schema.userAnswersTable)
      .where(
        and(
          eq(schema.userAnswersTable.userId, userId),
          eq(schema.userAnswersTable.questionKey, questionKey)
        )
      );

    return { success: true };
  }

  /**
   * Delete all user answers
   */
  async deleteAllAnswers(userId: number) {
    await db()
      .delete(schema.userAnswersTable)
      .where(eq(schema.userAnswersTable.userId, userId));

    return { success: true };
  }

  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(userId: number, requiredQuestions: string[]): Promise<boolean> {
    const answers = await this.getUserAnswers(userId);
    const answeredKeys = new Set(answers.map(a => a.questionKey));

    return requiredQuestions.every(key => answeredKeys.has(key));
  }

  /**
   * Get onboarding completion percentage
   */
  async getOnboardingProgress(userId: number, requiredQuestions: string[]) {
    const answers = await this.getUserAnswers(userId);
    const answeredKeys = new Set(answers.map(a => a.questionKey));
    const answeredCount = requiredQuestions.filter(key => answeredKeys.has(key)).length;

    return {
      completed: answeredCount,
      total: requiredQuestions.length,
      percentage: Math.round((answeredCount / requiredQuestions.length) * 100),
      isComplete: answeredCount === requiredQuestions.length,
    };
  }

  /**
   * Get missing questions
   */
  async getMissingQuestions(userId: number, requiredQuestions: string[]) {
    const answers = await this.getUserAnswers(userId);
    const answeredKeys = new Set(answers.map(a => a.questionKey));

    return requiredQuestions.filter(key => !answeredKeys.has(key));
  }

  /**
   * Bulk save answers
   */
  async bulkSaveAnswers(userId: number, answers: Array<{ questionKey: string; answer: string }>) {
    const results = [];

    for (const answer of answers) {
      const result = await this.saveAnswer({
        userId,
        questionKey: answer.questionKey,
        answer: answer.answer,
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Get answers as key-value map
   */
  async getAnswersMap(userId: number): Promise<Record<string, string>> {
    const answers = await this.getUserAnswers(userId);
    const map: Record<string, string> = {};

    answers.forEach(answer => {
      map[answer.questionKey] = answer.answer;
    });

    return map;
  }

  /**
   * Export answers (for backup/transfer)
   */
  async exportAnswers(userId: number) {
    const answers = await this.getUserAnswers(userId);
    
    return {
      userId,
      exportDate: new Date(),
      answers: answers.map(a => ({
        questionKey: a.questionKey,
        answer: a.answer,
        answeredAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
    };
  }

  /**
   * Import answers (from backup)
   */
  async importAnswers(userId: number, answers: Array<{ questionKey: string; answer: string }>) {
    return await this.bulkSaveAnswers(userId, answers);
  }

  /**
   * Get answer count
   */
  async getAnswerCount(userId: number): Promise<number> {
    const answers = await this.getUserAnswers(userId);
    return answers.length;
  }

  /**
   * Check if specific question is answered
   */
  async isQuestionAnswered(userId: number, questionKey: string): Promise<boolean> {
    const answer = await this.getAnswer(userId, questionKey);
    return !!answer;
  }

  /**
   * Get answers for specific category/prefix
   */
  async getAnswersByCategory(userId: number, categoryPrefix: string) {
    const answers = await this.getUserAnswers(userId);
    return answers.filter(a => a.questionKey.startsWith(categoryPrefix));
  }
}