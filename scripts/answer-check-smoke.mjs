import { challenges } from '../src/data/challenges.js';
import { checkChallengeAnswer } from '../src/utils/answerCheck.js';

const cases = [
  {
    name: 'level 1 rejects unchanged broken code',
    expected: false,
    actual: checkChallengeAnswer(challenges[0].brokenCode, challenges[0]).correct
  },
  {
    name: 'level 1 accepts corrected heading',
    expected: true,
    actual: checkChallengeAnswer(
      '<h1>LBHS Coding Club</h1>\n<p>Welcome to Bug Hunt Arena!</p>',
      challenges[0]
    ).correct
  },
  {
    name: 'level 4 rejects unchanged loop bug',
    expected: false,
    actual: checkChallengeAnswer(challenges[3].brokenCode, challenges[3]).correct
  },
  {
    name: 'level 4 accepts fixed loop condition',
    expected: true,
    actual: checkChallengeAnswer(
      'for (let i = 0; i < bugs.length; i++) {\n  console.log(bugs[i]);\n}',
      challenges[3]
    ).correct
  },
  {
    name: 'level 7 rejects unchanged selector mismatch',
    expected: false,
    actual: checkChallengeAnswer(challenges[6].brokenCode, challenges[6]).correct
  },
  {
    name: 'level 7 accepts matching submitFix selector',
    expected: true,
    actual: checkChallengeAnswer(
      '<button id="submitFix">Submit Fix</button>\n<script>document.querySelector("#submitFix").addEventListener("click", () => {})</script>',
      challenges[6]
    ).correct
  },
  {
    name: 'level 8 rejects unchanged final bug',
    expected: false,
    actual: checkChallengeAnswer(challenges[7].brokenCode, challenges[7]).correct
  },
  {
    name: 'level 8 accepts both selector fixes',
    expected: true,
    actual: checkChallengeAnswer(
      '<ul id="bug-list"></ul>\n<script>document.querySelector("#bug-list").appendChild(item);</script>\n<style>#bug-list { color: lime; }</style>',
      challenges[7]
    ).correct
  }
];

const failures = cases.filter((testCase) => testCase.actual !== testCase.expected);

for (const testCase of cases) {
  const status = testCase.actual === testCase.expected ? 'PASS' : 'FAIL';
  console.log(`${status} ${testCase.name}`);
}

if (failures.length > 0) {
  console.error(`\n${failures.length} answer-check smoke test(s) failed.`);
  process.exit(1);
}

console.log(`\n${cases.length} answer-check smoke tests passed.`);
