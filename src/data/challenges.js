// LBHS Coding Club challenge data.
//
// To edit the activity:
// - Change title, story, goal, and brokenCode for the student-facing prompt.
// - Change points to adjust scoring.
// - Add accepted patterns that should appear in corrected code.
// - Add forbidden patterns that should not remain in corrected code.
// - Add required answer groups when a challenge needs multiple ideas.
//   Each inner array is a list of acceptable ways to say the same fix.
//   A response is correct when it matches at least one item from every group.

export const challenges = [
  {
    id: 'easy-html-heading-close',
    level: 1,
    difficulty: 'Easy',
    type: 'HTML',
    points: 100,
    title: 'Mismatched Heading Tag',
    story:
      'The LBHS Coding Club welcome banner is showing up strangely. The opening and closing heading tags are not on the same team.',
    goal: 'Fix the heading so the browser sees one complete h1 element.',
    language: 'html',
    brokenCode: `<h1>LBHS Coding Club</h2>
<p>Welcome to Bug Hunt Arena!</p>`,
    answer: {
      summary: 'Change the closing tag from </h2> to </h1>.',
      accepted: ['</h1>', 'change </h2> to </h1>', 'make the h1 tags match'],
      forbidden: ['</h2>'],
      required: [['</h1>', 'h1 closing tag', 'close the h1', 'matching h1']]
    },
    hint: 'Check the number on the opening heading tag and the closing heading tag.'
  },
  {
    id: 'easy-css-color-property',
    level: 2,
    difficulty: 'Easy',
    type: 'CSS',
    points: 100,
    title: 'The Text Color Will Not Change',
    story:
      'The club card should use a gold text color, but the browser is ignoring one CSS property.',
    goal: 'Fix the CSS property name so the text color works.',
    language: 'css',
    brokenCode: `.club-card {
  colour: gold;
  background: #10233f;
}`,
    answer: {
      summary: 'Use the CSS property color instead of colour.',
      accepted: ['color: gold', 'change colour to color', 'use color not colour'],
      forbidden: ['colour:'],
      required: [['color:', 'change colour to color', 'use color']]
    },
    hint: 'CSS uses the American spelling for this property.'
  },
  {
    id: 'easy-css-class-selector',
    level: 3,
    difficulty: 'Easy',
    type: 'HTML/CSS',
    points: 100,
    title: 'Missing Class Dot',
    story:
      'The arena card should have a bright border, but the CSS selector is looking for an element instead of a class.',
    goal: 'Fix the selector so it targets class="arena-card".',
    language: 'html/css',
    brokenCode: `<section class="arena-card">
  <h2>Level 3</h2>
</section>

arena-card {
  border: 2px solid gold;
}`,
    answer: {
      summary: 'Add a dot: .arena-card',
      accepted: ['.arena-card', 'add a dot before arena-card', 'use .arena-card'],
      required: [['.arena-card', 'dot before arena-card', 'class selector']]
    },
    hint: 'Classes start with a dot in CSS selectors.'
  },
  {
    id: 'medium-js-loop-bound',
    level: 4,
    difficulty: 'Medium',
    type: 'JavaScript',
    points: 150,
    title: 'One Too Many Bugs',
    story:
      'The bug scanner prints one extra empty result. The loop is stepping past the end of the list.',
    goal: 'Fix the loop condition so it only reads real items from the array.',
    language: 'js',
    brokenCode: `const bugs = ["HTML tag", "CSS typo", "JS loop"];

for (let i = 0; i <= bugs.length; i++) {
  console.log(bugs[i]);
}`,
    answer: {
      summary: 'Use i < bugs.length instead of i <= bugs.length.',
      accepted: ['i < bugs.length', 'change <= to <', 'use less than bugs.length'],
      forbidden: ['i <= bugs.length'],
      required: [['i < bugs.length', 'change <= to <', 'less than bugs.length']]
    },
    hint: 'Array indexes stop one before the array length.'
  },
  {
    id: 'medium-js-comparison',
    level: 5,
    difficulty: 'Medium',
    type: 'JavaScript',
    points: 150,
    title: 'Assignment Sneaks Into an If Statement',
    story:
      'The arena says every answer is fixed, even when it is not. The if statement is setting a value instead of comparing it.',
    goal: 'Fix the condition so it compares the answer.',
    language: 'js',
    brokenCode: `let answer = "still broken";

if (answer = "fixed") {
  console.log("Bug cleared!");
}`,
    answer: {
      summary: 'Use === or == for comparison, such as answer === "fixed".',
      accepted: ['answer === "fixed"', "answer === 'fixed'", 'change = to ===', 'use ==='],
      forbidden: ['answer = "fixed"', "answer = 'fixed'"],
      required: [['===', '==', 'strict equality', 'comparison'], ['answer', 'fixed']]
    },
    hint: 'A single equals sign assigns a value. Comparisons need two or three equals signs.'
  },
  {
    id: 'medium-js-total-score',
    level: 6,
    difficulty: 'Medium',
    type: 'JavaScript',
    points: 150,
    title: 'Scoreboard Forgets Points',
    story:
      'The scoreboard only remembers the last level value. It should add every level score together.',
    goal: 'Fix the line inside the loop so total keeps growing.',
    language: 'js',
    brokenCode: `let total = 0;
const points = [100, 150, 150];

for (let i = 0; i < points.length; i++) {
  total = points[i];
}

console.log(total);`,
    answer: {
      summary: 'Add to total with total += points[i] or total = total + points[i].',
      accepted: ['total += points[i]', 'total = total + points[i]', 'add points[i] to total'],
      forbidden: ['total = points[i]'],
      required: [['total += points[i]', 'total=total+points[i]', 'add to total', 'total plus']]
    },
    hint: 'The current line replaces total. The fix should add the new points to total.'
  },
  {
    id: 'hard-dom-selector-match',
    level: 7,
    difficulty: 'Hard',
    type: 'HTML/JavaScript',
    points: 250,
    title: 'Button Selector Mismatch',
    story:
      'The submit button looks ready, but clicking it does nothing. The JavaScript is searching for an id that does not exist.',
    goal: 'Make the button id and the JavaScript selector match.',
    language: 'html',
    brokenCode: `<button id="submitFix">Submit Fix</button>
<p id="result"></p>

<script>
  document.querySelector("#submit").addEventListener("click", () => {
    document.querySelector("#result").textContent = "Bug cleared!";
  });
</script>`,
    answer: {
      summary: 'Change the selector to #submitFix, or change the button id to submit.',
      accepted: [
        'querySelector("#submitFix")',
        "querySelector('#submitFix')",
        'id="submit"',
        "id='submit'"
      ],
      required: [
        ['querySelector("#submitFix")', "querySelector('#submitFix')", 'id="submit"', "id='submit'"]
      ]
    },
    hint: 'Compare the id inside the button with the selector inside querySelector.'
  },
  {
    id: 'hard-loop-and-selector',
    level: 8,
    difficulty: 'Hard',
    type: 'HTML/JavaScript',
    points: 250,
    title: 'Final Arena List Bug',
    story:
      'The final bug list skips the first item, adds an empty item, and cannot find the list on the page.',
    goal: 'Fix the loop start, loop condition, and list selector.',
    language: 'html',
    brokenCode: `<ul id="bugs"></ul>

<script>
  const bugs = ["HTML", "CSS", "JavaScript"];

  for (let i = 1; i <= bugs.length; i++) {
    const item = document.createElement("li");
    item.textContent = bugs[i];
    document.querySelector(".bugs").appendChild(item);
  }
</script>`,
    answer: {
      summary:
        'Start at i = 0, loop while i < bugs.length, and select the list with #bugs.',
      accepted: [
        'let i = 0; i < bugs.length; document.querySelector("#bugs")',
        'start at 0, use < bugs.length, and use #bugs'
      ],
      forbidden: ['let i = 1', 'i <= bugs.length', 'querySelector(".bugs")', "querySelector('.bugs')"],
      required: [
        ['let i = 0', 'i=0', 'start at 0'],
        ['i < bugs.length', 'i<bugs.length', 'change <= to <'],
        ['#bugs', 'querySelector("#bugs")', "querySelector('#bugs')", 'id selector']
      ]
    },
    hint: 'There are three bugs: the starting index, the ending condition, and the CSS selector.'
  }
];

export const totalPossiblePoints = challenges.reduce((sum, challenge) => sum + challenge.points, 0);

export function getSpeedBonus(seconds) {
  if (!Number.isFinite(seconds)) return 0;
  if (seconds <= 20 * 60) return 75;
  if (seconds <= 35 * 60) return 50;
  if (seconds <= 45 * 60) return 25;
  return 0;
}
