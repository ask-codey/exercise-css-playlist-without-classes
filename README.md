# Exercise: Style a Playlist Without Adding Classes

Exercise code for the lesson **Exercise: Style a Playlist Without Adding Classes** in the CSS in Depth course on [ask-codey.com](https://www.ask-codey.com).

*Road Trip Mix* is a playlist page of twelve songs: each has a title, an artist, a length and a Like checkbox, two have explicit lyrics, one is playing now and two are already liked. Its HTML has no classes and no ids, and you may not add any: a check makes sure `index.html` stays exactly as it came. You'll write eight rules in `styles.css` that reach every part with combinators, attribute selectors, pseudo-classes, pseudo-elements and `:has()`, and ten checks tell you when each rule is doing its job.

## Before you start

You need VS Code with the Live Server extension, a current Chrome, Edge or Firefox, and Node.js 24 or newer, set up as in the lesson *Setup: VS Code, a Browser and Node.js*. If you've run an exercise's checks before, you know the steps below; if not, they're all spelled out.

## What's here

- `index.html`: the Road Trip Mix page. The song that's playing has `aria-current="true"` on its `<li>`, the explicit songs have `data-rating="explicit"` and an `<abbr title="Explicit lyrics">E</abbr>` badge, and each song's checkbox has an `aria-label` such as *Like Windows Down*. Ready to use: **don't change it**, not even a space.
- `styles.css`: a comment with the style guide and the eight rules, then ready-made rules for the fonts and spacing, then the place for your rules. For you to finish.
- `page.test.js`: the ten checks. You don't need to change this file.
- `package.json`: tells npm what the checks need (`jsdom`, which reads your page and stylesheet the way a browser does). Ready to use.
- `.gitignore`: keeps the `node_modules` folder that `npm install` makes out of Git. Ready to use.

The footer's lyrics link points at a PDF that isn't included: it's there to be styled, not opened.

## What to do

1. **Open this folder in VS Code** (**File > Open Folder**, the folder with `package.json` directly inside it), then right-click `index.html` and choose **Open with Live Server**. Put VS Code and the browser side by side.
2. **Read the comment at the top of `styles.css`**: the style guide and the eight rules.
3. **Write the rules one at a time, under `/* Your rules */`.** After each one, save and look at the browser. For rules 5 and 6, move the pointer over a song, and press Tab to move between the checkboxes.

## Check your work

1. **Open the terminal:** **Terminal > New Terminal**, or **Ctrl+`** (the backtick key, left of 1).
2. **Install what the checks need, once:**

   ```bash
   npm install
   ```

3. **Run the checks:**

   ```bash
   npm test
   ```

   Before you write any rules, two checks pass (the link line and the unchanged HTML) and eight fail. That's expected. Each failing check has a message that starts **Not yet:** and says which rule to look at.
4. **Fix one thing, save, and run `npm test` again** (the up arrow brings the command back). When the last lines say `pass 10` and `fail 0`, you're done.

Some checks do more than look at the page as it is. They move "now playing" to another song, tick and untick checkboxes, and add two songs to the end of the list, then look again, the way the page would change while someone uses it. A rule that names a song by its number passes today and fails then, so the message tells you to reach the song another way.

## The rules

- Write every rule in `styles.css`, and leave `index.html` exactly as it is.
- No classes and no ids: the HTML has none to reach. Every rule reaches its elements with selectors alone.
- Use the style guide's colors, sizes and characters exactly. Copy ▶ and ↗ from the comment at the top of `styles.css`.
- The checklist the checks can't do, in the browser:
  - Move the pointer over a striped song and over the playing song: each turns light blue. If one stays gray or yellow, your hover rule is losing to rule 1 or 2: put it after them.
  - Click a song's checkbox with the mouse: no blue outline. Press Tab to reach a checkbox: a thick blue outline.
  - Tick a song's checkbox: the pink border appears on its left. Untick it: it goes.

## Tips

- Draw the family tree of one song on paper: the `<li>`, then its `<strong>`, two `<span>`s, sometimes an `<abbr>`, and an `<input>`. Most rules start by reaching the `<li>`.
- Rules 1 and 2 both reach song 4. When two rules reach the same element, the cascade picks a winner: specificity first, then the order of the rules. The developer tools' Styles pane shows the losing declaration crossed out.
- `::before` shows nothing without a `content` line.
- A selector you can't read aloud is a selector to simplify. `li:has(:checked)` reads "a song that has something checked inside it".

## Hand it in

When it works, put your solution in a public repo of your own on GitHub, then paste that repo's address into **Submit your exercise** on the lesson page at [ask-codey.com](https://www.ask-codey.com). That's what completes the lesson. You don't need Git: create the repo on GitHub, choose **Add file**, then **Upload files**, and upload everything in this folder except `node_modules` (it's the files `npm install` downloaded, far too many for GitHub's upload, and `npm install` makes it again). The lesson page shows each step, and the lesson *Put Your Page Online for Free* walks through every screen.
