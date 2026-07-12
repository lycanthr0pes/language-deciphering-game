type Question = {
  tokens: { id: string }[];
  correctAnswers: Record<string, string>;
};

type SelectedAnswers = Partial<Record<string, string>>;

export function judgeAnswer(question: Question, selectedAnswers: SelectedAnswers) {
  return question.tokens.every((token) => {
    return selectedAnswers[token.id] === question.correctAnswers[token.id];
  });
}
