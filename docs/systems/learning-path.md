# Learning path

The course has 13 ordered chapters with three lessons each: left-hand letters; right-hand letters; both hands; capitalization; punctuation; sentences; numbers; paragraphs and whitespace; symbols; Java basics; Java decisions and arrays; Java classes and methods; and mixed mastery. The learning path shows every lesson as a circular node, with future lessons locked. Each new lesson has an introduction with a practice preview and chapter-specific tips; replays go straight to practice. Lessons set their WPM goal and mistake allowance according to the chapter difficulty; passing unlocks the next lesson and awards 20 XP on its first clear. Replays can improve the saved best stars, but do not repeat the first-clear XP reward.

The first three chapters accept uppercase and lowercase as equivalent. From chapter four onward, case must match. In whitespace exercises Enter is displayed as ↵ and Tab as ⇥. When Tab is the next expected character, the Tab key inserts it; Shift+Tab remains available for backward navigation. An Insert Tab button is also offered for keyboards without a Tab key. Learners must correct mistakes before advancing. Exceeding the allowance ends the attempt; finishing below the WPM goal also fails. Results explain the failure and offer a retry. The arrow at the top left of results returns to the learning path. WPM uses correct characters divided into five-character words over active typing time; pausing does not count.

Existing six-level course progress is archived in `legacyCourse` when upgrading to the new curriculum, and the new course starts at chapter one. Lifetime XP, best WPM, activity dates, daily totals and the prior completed count and stars are retained. This avoids presenting old star ratings as if they were earned on different new exercises. The learning path explains the transition, and Profile displays previous course results.

Progress, XP, best WPM, activity dates and daily goal totals are saved in the browser's local storage under `rugo-progress`. They are specific to the browser and origin, not synced to an account. If browser storage is unavailable, a notice appears on the main screen. Daily goals reset at the next local calendar day. The league page is informational until an online leaderboard is implemented.

Opening an exercise from the path or Practice shows a brief full-screen preparation screen; learners can start immediately. Retrying from results begins a fresh attempt directly. The lesson uses a focused layout; navigation and progress return when the learner goes back to the path.

Rugo is a reusable SVG character with independently animated head, eyes, eyebrows, mouth, body, arms, legs and tail. The learning-path mascot cycles through reusable idle, happy, curious, thinking, surprised, proud and celebration expression templates when activated. He uses a side-facing walk cycle during preparation and reacts to lesson results, with distinct eyes, brows and mouth shapes for celebration, surprise, thought and encouragement. Motion respects reduced-motion settings. On the learning path Rugo stays visible while scrolling; smaller screens use a compact corner placement. The earlier Rive and illustrated experiments are retained as source material and are not used in the app.

On compact screens, the learning path, progress panels, keyboard guide and lesson results adapt to the available width. The fixed mascot uses a smaller footprint on phones.

Lesson and results action bars stay visible at the bottom of the viewport while content scrolls.

Sound effects use Howler.js and locally generated short cues for starting a lesson, typing, mistakes, combo milestones and results. Five, ten, twenty, thirty, fifty, seventy-five and one hundred correct keys trigger a short milestone; larger milestones have a distinct cue. Rugo reacts to long combos and offers encouragement after a mistake. The Sound control is available on the learning path, during lessons and on results; the setting persists on the device. Sounds start only after interaction and can be muted.



Run `npm run test:lesson` to check the curriculum, case and whitespace handling, migration, scoring, correction, stars, mistake summaries and daily rollover rules.
