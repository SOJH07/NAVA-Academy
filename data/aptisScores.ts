import { AptisScores } from '../types';

// FIX: Populated missing AptisScores properties with data from studentPerformanceData.ts where available, or with default values to satisfy the type definition.
export const aptisScoresData: { [navaId: number]: AptisScores } = {
  24001: {"overall":{"score":49,"cefr":"A1"},"grammarAndVocabulary":{"score":14},"listening":{"score":28,"cefr":"B1"},"reading":{"score":14,"cefr":"A1"},"speaking":{"score":5,"cefr":"A1"},"writing":{"score":2,"cefr":"A0"}},
  // FIX: Completed the truncated JSON object for student 24003.
  24003: {"overall":{"score":86,"cefr":"A2"},"grammarAndVocabulary":{"score":21},"listening":{"score":28,"cefr":"B1"},"reading":{"score":20,"cefr":"A2"},"speaking":{"score":34,"cefr":"B1"},"writing":{"score":4,"cefr":"A0"}}
};