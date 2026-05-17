// LBHS Coding Club challenge data.
//
// Beginner-friendly version with clearer goals/instructions.
// Hints remain highly revealing for students who get stuck.

export const challenges = [
  {
    id: 'easy-html-heading-close',
    level: 1,
    difficulty: 'Easy',
    type: 'HTML',
    points: 100,
    title: 'Mismatched Heading Tag',
    story:
      'The LBHS Coding Club welcome banner is acting weird because one heading tag uses the wrong number.',
    goal:
      'Inspect the opening and closing heading tags. One of the tags does not match the other.',
    language: 'html',
    brokenCode: `<h1>LBHS Coding Club</h2>
<p>Welcome to Bug Hunt Arena!</p>`,
    answer: {
      summary: 'Change the closing tag from </h2> to </h1>.',
      accepted: ['</h1>', 'change </h2> to </h1>', 'make the h1 tags match'],
      forbidden: ['</h2>'],
      required: [['</h1>', 'h1 closing tag', 'close the h1', 'matching h1']]
    },
    hint: 'Almost the whole fix: change the closing tag from </h2> to </h1>.'
  },

  {
    id: 'easy-css-color-property',
    level: 2,
    difficulty: 'Easy',
    type: 'CSS',
    points: 100,
    title: 'The Text Color Will Not Change',
    story:
      'The club card should use gold text, but one CSS word is spelled in a way the browser does not understand.',
    goal:
      'Inspect the CSS property name. One word is spelled incorrectly, so the text color will not work.',
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
    hint: 'Almost the whole fix: replace colour with color, so the line becomes color: gold;.'
  },

  {
    id: 'easy-css-class-selector',
    level: 3,
    difficulty: 'Easy',
    type: 'HTML/CSS',
    points: 100,
    title: 'Missing Class Dot',
    story:
      'The arena card should have a bright border, but the CSS selector is missing one tiny symbol.',
    goal:
      'The HTML uses class="arena-card". Inspect the CSS selector and make sure it uses the correct class selector syntax.',
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
    hint: 'Almost the whole fix: change arena-card { to .arena-card {.'
  },

  {
    id: 'medium-js-loop-bound',
    level: 4,
    difficulty: 'Medium',
    type: 'JavaScript',
    points: 150,
    title: 'One Too Many Bugs',
    story:
      'The bug scanner prints one extra empty result because the loop goes one step too far.',
    goal:
      'Inspect the for loop condition. The loop is running one extra time because of the comparison operator.',
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
    hint: 'Almost the whole fix: in the for loop, change i <= bugs.length to i < bugs.length.'
  },

  {
    id: 'medium-js-comparison',
    level: 5,
    difficulty: 'Medium',
    type: 'JavaScript',
    points: 150,
    title: 'Assignment Sneaks Into an If Statement',
    story:
      'The arena says every answer is fixed because the if statement uses the wrong equals sign.',
    goal:
      'Inspect the if statement condition. JavaScript is assigning a value instead of comparing values.',
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
    hint: 'Almost the whole fix: change if (answer = "fixed") to if (answer === "fixed").'
  },

  {
    id: 'medium-js-total-score',
    level: 6,
    difficulty: 'Medium',
    type: 'JavaScript',
    points: 150,
    title: 'Scoreboard Forgets Points',
    story:
      'The scoreboard should add points twice, but it keeps replacing the score instead of growing it.',
    goal:
      'Inspect both score update lines. The code is replacing the score instead of adding to the current score.',
    language: 'js',
    brokenCode: `let score = 0;
const levelPoints = 100;

score = levelPoints;
score = levelPoints;

console.log(score);`,
    answer: {
      summary: 'Add to score with score += levelPoints or score = score + levelPoints.',
      accepted: ['score += levelPoints', 'score = score + levelPoints', 'add levelPoints to score'],
      forbidden: ['score = levelPoints'],
      required: [['score += levelPoints', 'score=score+levelPoints', 'add to score', 'score plus']]
    },
    hint:
      'Almost the whole fix: replace both score = levelPoints; lines with score += levelPoints;.'
  },

  {
    id: 'hard-dom-selector-match',
    level: 7,
    difficulty: 'Hard',
    type: 'HTML/JavaScript',
    points: 250,
    title: 'Button Selector Mismatch',
    story:
      'The submit button looks ready, but the JavaScript is searching for the wrong button id.',
    goal:
      'Inspect the button id and the querySelector() id. They do not match, so the click event never connects to the button.',
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
    hint: 'Almost the whole fix: change querySelector("#submit") to querySelector("#submitFix").'
  },

  {
    id: 'hard-loop-and-selector',
    level: 8,
    difficulty: 'Hard',
    type: 'HTML/CSS/JavaScript',
    points: 250,
    title: 'Final Arena Selector Bug',
    story:
      'The final bug list exists on the page, but the JavaScript and CSS are using the wrong kind of selector.',
    goal:
      'An HTML id named "bug-list" already exists. Inspect BOTH the JavaScript selector and the CSS selector and make sure they correctly target an id selector.',
    language: 'html',
    brokenCode: `<ul id="bug-list"></ul>

<script>
  const bugs = ["HTML", "CSS", "JavaScript"];

  for (let i = 0; i < bugs.length; i++) {
    const item = document.createElement("li");
    item.textContent = bugs[i];
    document.querySelector(".bug-list").appendChild(item);
  }
</script>

<style>
  bug-list {
    color: lime;
  }
</style>`,
    answer: {
      summary:
        'Use #bug-list for the JavaScript querySelector and the CSS selector.',
      accepted: ['fix both #bug-list selectors', 'use #bug-list in javascript and css'],
      forbidden: [
        'querySelector(".bug-list")',
        "querySelector('.bug-list')"
      ],
      required: [
        ['querySelector("#bug-list")', "querySelector('#bug-list')"],
        ['#bug-list {', '#bug-list{']
      ]
    },
    hint:
      'Almost the whole fix: change .bug-list to #bug-list in querySelector, and change bug-list { to #bug-list { in the CSS.'
  }
];

export const totalPossiblePoints = challenges.reduce(
  (sum, challenge) => sum + challenge.points,
  0
);

export function getSpeedBonus(seconds) {
  if (!Number.isFinite(seconds)) return 0;
  if (seconds <= 20 * 60) return 75;
  if (seconds <= 35 * 60) return 50;
  if (seconds <= 45 * 60) return 25;
  return 0;
}
