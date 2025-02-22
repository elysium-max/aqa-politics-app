export function identifyQuestionType(questionText: string): string {
  if (questionText.includes('compare') || questionText.includes('contrast')) {
    return 'comparative';
  }
  if (questionText.includes('extract')) {
    return 'extract';
  }
  if (questionText.match(/\[9 marks\]/)) {
    return '9-mark';
  }
  if (questionText.match(/\[25 marks\]/)) {
    return 'essay';
  }
  if (questionText.match(/\[30 marks\]/)) {
    return 'comparative essay';
  }
  if (questionText.match(/\[30 marks\]/) && questionText.includes('ideology')) {
    return 'ideologies essay';
  }
  return 'unknown';
}
