import { Question } from '../types';
import { ROUND_1_SET_A, ROUND_1_SET_B, ROUND_1_SET_C } from './questionsRound1';
import { ROUND_2_SET_A, ROUND_2_SET_B, ROUND_2_SET_C } from './questionsRound2';
import { ROUND_3_SET_A, ROUND_3_SET_B, ROUND_3_SET_C } from './questionsRound3';

export {
  ROUND_1_SET_A,
  ROUND_1_SET_B,
  ROUND_1_SET_C,
  ROUND_2_SET_A,
  ROUND_2_SET_B,
  ROUND_2_SET_C,
  ROUND_3_SET_A,
  ROUND_3_SET_B,
  ROUND_3_SET_C,
};

// ============================================================================
// OFFICIAL TECH BRIDGE '26 QUESTION MASTER REPOSITORY
// Round 1: 90 Questions (Set A: 30, Set B: 30, Set C: 30)
// Round 2: 45 Questions (Set A: 15, Set B: 15, Set C: 15)
// Round 3: 30 Questions (Set A: 10, Set B: 10, Set C: 10)
// TOTAL: 165 Fully Authoritative CS/IT Rebus Questions
// ============================================================================
export const SEED_QUESTIONS: Question[] = [
  // ROUND 1: FOUNDATIONS (30 per set)
  ...ROUND_1_SET_A,
  ...ROUND_1_SET_B,
  ...ROUND_1_SET_C,

  // ROUND 2: DISTRIBUTED SYSTEMS (15 per set)
  ...ROUND_2_SET_A,
  ...ROUND_2_SET_B,
  ...ROUND_2_SET_C,

  // ROUND 3: GRAND FINALE (10 per set)
  ...ROUND_3_SET_A,
  ...ROUND_3_SET_B,
  ...ROUND_3_SET_C,
];
