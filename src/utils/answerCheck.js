function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCompact(value) {
  return normalizeText(value).replace(/\s+/g, '').replace(/[`;]/g, '');
}

function matchesPattern(answerText, answerCompact, pattern) {
  const patternText = normalizeText(pattern);
  const patternCompact = normalizeCompact(pattern);

  return answerText.includes(patternText) || answerCompact.includes(patternCompact);
}

export function checkChallengeAnswer(rawAnswer, challenge) {
  const answerText = normalizeText(rawAnswer);
  const answerCompact = normalizeCompact(rawAnswer);

  if (!answerText) {
    return {
      correct: false,
      message: 'Type the fix or paste corrected code before submitting.'
    };
  }

  const forbidden = challenge.answer?.forbidden || [];
  const forbiddenMatch = forbidden.some((pattern) =>
    matchesPattern(answerText, answerCompact, pattern)
  );

  if (forbiddenMatch) {
    return {
      correct: false,
      message: challenge.hint || 'The original bug still appears in the code.'
    };
  }

  const accepted = challenge.answer?.accepted || [];
  const acceptedMatch = accepted.some((pattern) =>
    matchesPattern(answerText, answerCompact, pattern)
  );

  if (acceptedMatch) {
    return {
      correct: true,
      message: challenge.answer.summary
    };
  }

  const requiredGroups = challenge.answer?.required || [];
  if (requiredGroups.length > 0) {
    const requiredMatch = requiredGroups.every((group) =>
      group.some((pattern) => matchesPattern(answerText, answerCompact, pattern))
    );

    if (requiredMatch) {
      return {
        correct: true,
        message: challenge.answer.summary
      };
    }
  }

  return {
    correct: false,
    message: challenge.hint || 'Something is still buggy. Compare the prompt and the code again.'
  };
}
