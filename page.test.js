// Checks the eight rules in your styles.css: it reads index.html and styles.css the way a browser does, then asks
// what each song, badge, checkbox and link ends up with. It also checks that index.html hasn't changed.
// Run it with: npm test (run npm install once first). You don't need to change this file.
const { test } = require('node:test');
const { createHash } = require('node:crypto');
const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const read = (file) => (existsSync(path.join(__dirname, file)) ? readFileSync(path.join(__dirname, file), 'utf8') : '');
const html = read('index.html');
const css = read('styles.css');

// The page as it came, as a fingerprint: any change to index.html, even one letter, gives a different one.
const FINGERPRINT = '08fef35a9b614553b9c2f8fc0016118f4b60f31c6bfcc31ddb64bc3aeea25230';

// A fresh copy of the page for each check, with styles.css added. A browser loads styles.css through the link line;
// the checks have no web server, so they add the file to the page themselves.
function load() {
  const { window } = new JSDOM(html);
  const { document } = window;
  const sheet = document.createElement('style');
  sheet.textContent = css;
  document.head.append(sheet);
  const songs = [...document.querySelectorAll('ol > li')];
  return { window, document, songs, style: (element) => window.getComputedStyle(element) };
}

// The browser turns every way of writing a color (#f1f5f9, #F1F5F9, rgb(241, 245, 249)) into one form.
function asBrowserColor(window, color) {
  const probe = window.document.createElement('i');
  probe.style.color = color;
  window.document.body.append(probe);
  const result = window.getComputedStyle(probe).color;
  probe.remove();
  return result;
}

// Fails a check with a plain message, so the output shows what to fix and no stack trace to scroll past.
function check(passed, message) {
  if (!passed) {
    const problem = new Error(message);
    problem.stack = `Not yet: ${message}`;
    throw problem;
  }
}

// Splits "a, b:is(c, d)" into ["a", "b:is(c, d)"]: commas inside parentheses belong to :is(), :not() or :has().
function splitList(selectorText) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const ch of selectorText) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current.trim());
  return parts;
}

// Every style rule in styles.css, including any inside @media or @layer.
function allRules(list) {
  return [...list].flatMap((rule) => (rule.selectorText !== undefined ? [rule] : rule.cssRules ? allRules(rule.cssRules) : []));
}

// A browser shows :hover, :focus-visible, ::before and ::after while the page is in use, and the checks can't hover
// or press Tab. So they read your rules instead: the declarations of every rule that names the state or part, for
// an element that the rest of its selector matches. "li:hover" counts for an li; "li:hover strong" doesn't.
function rulesWith(page, word, element) {
  const found = [];
  for (const rule of allRules(page.document.styleSheets[page.document.styleSheets.length - 1].cssRules)) {
    for (const selector of splitList(rule.selectorText)) {
      // Older stylesheets write ::before and ::after with one colon, and browsers still accept it.
      const spelling = selector.includes(word) ? word : word.startsWith('::') && selector.includes(word.slice(1)) ? word.slice(1) : null;
      if (!spelling) continue;
      let rest = selector.split(spelling).join('').trim();
      if (rest === '' || /[>+~]$/.test(rest)) rest += '*';
      try {
        if (element.matches(rest)) found.push(rule.style);
      } catch {
        // A selector jsdom can't read is skipped, as a browser would skip it.
      }
    }
  }
  return found;
}

const playing = (page) => page.document.querySelector('li[aria-current="true"]');

// Moves "now playing" to another song, the way a music player would when the next song starts.
function playSong(page, number) {
  playing(page).removeAttribute('aria-current');
  page.songs[number - 1].setAttribute('aria-current', 'true');
}

// The text a ::before or ::after rule shows, or '' when it shows nothing.
function shownText(style) {
  const content = style.getPropertyValue('content').trim();
  return ['', 'none', 'normal', '""', "''"].includes(content) ? '' : content;
}

test('index.html links styles.css', () => {
  check(html, 'There is no index.html in this folder. Check that you opened the exercise folder, the one with package.json in it.');
  const link = load().document.querySelector('link[rel="stylesheet"]');
  check(link && link.getAttribute('href') === 'styles.css',
    'index.html no longer links styles.css. Put this line back inside <head>: <link rel="stylesheet" href="styles.css">');
});

test('index.html is exactly as it came', () => {
  const fingerprint = createHash('sha256').update(html.replace(/\r\n/g, '\n')).digest('hex');
  check(fingerprint === FINGERPRINT,
    'index.html has changed. This exercise styles the page from styles.css alone, with no new classes or ids. Undo your changes to index.html, or download a fresh copy of it from the exercise code.');
});

test('rule 1: every even-numbered song is striped', () => {
  const page = load();
  check(css.includes('Your rules'), 'styles.css is missing its "Your rules" comment. Download a fresh copy of styles.css from the exercise code.');
  const stripe = asBrowserColor(page.window, '#f1f5f9');
  page.songs.forEach((song, i) => {
    const number = i + 1;
    if (song.hasAttribute('aria-current')) return;
    const background = page.style(song).backgroundColor;
    if (number % 2 === 0) {
      check(background === stripe, `Song ${number} has no stripe (#f1f5f9) yet. Rule 1 stripes every even-numbered song: count the songs with :nth-child().`);
    } else {
      check(background !== stripe, `Song ${number} is striped, but only the even-numbered songs (2, 4, 6 ...) should be. Look at what's in the parentheses of your :nth-child().`);
    }
  });
  // Two more songs added to the end: song 14 must be striped and song 13 not, with no change to your CSS.
  const list = page.document.querySelector('ol');
  list.append(page.songs[0].cloneNode(true), page.songs[0].cloneNode(true));
  const extra = [...list.children];
  check(page.style(extra[13]).backgroundColor === stripe && page.style(extra[12]).backgroundColor !== stripe,
    'The stripes work for these twelve songs only. When songs 13 and 14 are added, song 14 should be striped and song 13 not. Use :nth-child(even) rather than listing song numbers.');
});

test('rule 2: the playing song has the now-playing background', () => {
  const page = load();
  const nowPlaying = asBrowserColor(page.window, '#fff3c4');
  check(page.style(playing(page)).backgroundColor === nowPlaying,
    page.style(playing(page)).backgroundColor === asBrowserColor(page.window, '#f1f5f9')
      ? 'Song 4, the playing song, shows the stripe instead of the now-playing background (#fff3c4). Both rules reach it, so the cascade picks one: give the two rules the same specificity (li[aria-current="true"] and li:nth-child(even) both score 0, 1, 1) and put rule 2 after rule 1.'
      : 'Song 4, the playing song, has no now-playing background (#fff3c4) yet. Its li has aria-current="true": reach it with an attribute selector.');
  playSong(page, 7);
  check(page.style(page.songs[6]).backgroundColor === nowPlaying && page.style(page.songs[3]).backgroundColor !== nowPlaying,
    'When song 7 starts playing (its li gets aria-current="true" and song 4 loses it), the now-playing background should move to song 7. Reach the song by its aria-current attribute, not by its number.');
});

test('rule 3: the explicit songs\' E badges have the badge colors', () => {
  const page = load();
  const badge = asBrowserColor(page.window, '#334155');
  const white = asBrowserColor(page.window, '#ffffff');
  for (const abbr of page.document.querySelectorAll('li[data-rating="explicit"] abbr')) {
    const song = abbr.closest('li').querySelector('strong').textContent;
    check(page.style(abbr).backgroundColor === badge, `The E badge of "${song}" has no badge background (#334155) yet. Rule 3 reaches the abbr inside the explicit songs.`);
    check(page.style(abbr).color === white, `The E badge of "${song}" has no white text (#ffffff) yet. Rule 3 sets its color too.`);
  }
  const minutes = page.document.querySelector('header abbr');
  check(page.style(minutes).backgroundColor !== badge,
    'The "min" in the header has the badge background too. It is an abbr, but not an explicit badge: reach only the abbr inside a song whose data-rating is explicit (or the abbr whose title is "Explicit lyrics").');
});

test('rule 4: the play icon is before the playing song\'s title', () => {
  const page = load();
  const shows = (number) => {
    const song = page.songs[number - 1];
    return [song, ...song.querySelectorAll('*')].some((element) => rulesWith(page, '::before', element).some((style) => shownText(style)));
  };
  const icon = [playing(page), ...playing(page).querySelectorAll('*')]
    .flatMap((element) => rulesWith(page, '::before', element)).map(shownText).find(Boolean);
  check(icon, 'The playing song has no ::before yet. Rule 4 adds one to its title, with a content value: content: "▶ ";');
  check(/▶|\\25b6/i.test(icon), `The playing song's ::before shows ${icon}. The style guide's play icon is "▶ ": copy the triangle from the comment at the top of styles.css.`);
  check(!shows(1), 'Song 1 has a play icon too, but only the playing song should. Reach the title inside the li whose aria-current is "true".');
  playSong(page, 9);
  check(shows(9) && !shows(4), 'When song 9 starts playing, the play icon should move to it. Reach the song by its aria-current attribute, not by its number.');
});

test('rule 5: the song under the pointer gets the hover background', () => {
  const page = load();
  const hover = asBrowserColor(page.window, '#e0f2fe');
  for (const [i, song] of page.songs.entries()) {
    const backgrounds = rulesWith(page, ':hover', song).map((style) => style.getPropertyValue('background-color'));
    check(backgrounds.length, css.includes(':hover')
      ? `Your :hover rule doesn't reach song ${i + 1}'s li itself. Put :hover right after the selector for the song (li:hover), not after something inside it.`
      : `Song ${i + 1} has no :hover rule yet. Rule 5 is for the song's li while the pointer is over it.`);
    check(backgrounds.includes(hover), `The :hover rule for song ${i + 1} doesn't set the hover background (#e0f2fe) yet. Use the background-color property.`);
  }
});

test('rule 6: every checkbox gets the focus outline with :focus-visible', () => {
  const page = load();
  for (const box of page.document.querySelectorAll('input[type="checkbox"]')) {
    const outlines = rulesWith(page, ':focus-visible', box)
      .map((style) => `${style.getPropertyValue('outline')} ${style.getPropertyValue('outline-style')}`.trim())
      .filter((outline) => outline && !/none|hidden|^0(px)?\b/.test(outline));
    check(outlines.length, `The checkbox "${box.getAttribute('aria-label')}" has no visible :focus-visible outline yet. Rule 6 is for the checkboxes with :focus-visible, and sets outline: 3px solid #1d4ed8;`);
  }
});

test('rule 7: every liked song has the heart border, and it follows the checkbox', () => {
  const page = load();
  const heart = asBrowserColor(page.window, '#e63973');
  const liked = (song) => page.style(song).borderLeftStyle === 'solid' && page.style(song).borderLeftWidth === '4px'
    && page.style(song).borderLeftColor === heart;
  page.songs.forEach((song, i) => {
    const checked = song.querySelector('input').checked;
    check(liked(song) === checked, checked
      ? `Song ${i + 1} is liked (its checkbox is checked) but has no heart border yet: border-left: 4px solid #e63973;`
      : `Song ${i + 1} isn't liked, but it has the heart border. Rule 7 is only for songs whose checkbox is checked.`);
  });
  // Someone likes song 7 and unlikes song 2.
  page.songs[6].querySelector('input').checked = true;
  page.songs[1].querySelector('input').checked = false;
  check(liked(page.songs[6]) && !liked(page.songs[1]),
    'The heart border doesn\'t follow the clicks yet: after liking song 7 and unliking song 2, song 7 should have it and song 2 not. Use :has() with :checked, so the song is styled by its checkbox.');
});

test('rule 8: the link that leaves the site has the arrow after it', () => {
  const page = load();
  const [lyrics, share] = page.document.querySelectorAll('footer a');
  const arrow = rulesWith(page, '::after', share).map(shownText).find(Boolean);
  check(arrow, 'The "Share this mix" link has no ::after yet. Rule 8 adds one to links whose href starts with https://, with content: " ↗";');
  check(/↗|\\2197/i.test(arrow), `The link's ::after shows ${arrow}. The style guide's arrow is " ↗": copy it from the comment at the top of styles.css.`);
  check(!rulesWith(page, '::after', lyrics).some(shownText),
    'The lyrics link has the arrow too, but it stays on this site. Reach only the links whose href starts with https:// (^= is read "starts with").');
});
