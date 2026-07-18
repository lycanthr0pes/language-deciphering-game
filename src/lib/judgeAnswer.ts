import type {
  AnswerJudgement,
  Question,
  SelectedAnswers,
  TokenJudgement,
} from "./gameTypes";

export function judgeAnswer(
  question: Question,
  selectedAnswers: SelectedAnswers,
): AnswerJudgement {
  const tokenResults = Object.fromEntries(
    question.tokens.map((token) => {
      const result: TokenJudgement =
        selectedAnswers[token.id] === question.correctAnswers[token.id]
          ? "correct"
          : "incorrect";

      return [token.id, result];
    }),
  );

  const correctWordCount = Object.values(tokenResults).filter(
    (result) => result === "correct",
  ).length;

  return {
    isCorrect: correctWordCount === question.tokens.length,
    correctWordCount,
    totalWordCount: question.tokens.length,
    tokenResults,
  };
}
