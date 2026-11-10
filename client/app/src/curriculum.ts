export type Chapter = { title: string; difficulty: number; caseSensitive: boolean; focus: string; tips: string[]; drills: { name: string; text: string }[] }

/** The order introduces keys, text conventions, and Java syntax one step at a time. */
export const chapters: Chapter[] = [
  { title:'Left hand letters', difficulty:1, caseSensitive:false, focus:'Get comfortable reaching with your left hand.', tips:['Rest your left index finger on F.', 'Reach for each key and return to your home row.', 'Capital letters count the same as lowercase in this chapter.'], drills:[
    {name:'Home row: A to G', text:'aaa sss ddd fff ggg asdf fdsa'},
    {name:'Reach up and down', text:'qwe rtt zxc vb qaz wsx edc rfv'},
    {name:'Left-hand words', text:'after grass fast craft trade'} ] },
  { title:'Right hand letters', difficulty:1, caseSensitive:false, focus:'Find the right-hand home row and reach with control.', tips:['Rest your right index finger on J.', 'Return to J after reaching for nearby letters.', 'Keep your hands relaxed; case does not matter yet.'], drills:[
    {name:'Home row: H to L', text:'hhh jjj kkk lll hjkl lkjh'},
    {name:'Reach up and down', text:'yui opn mju iko lpo hnm'},
    {name:'Right-hand patterns', text:'jump join look moon pony'} ] },
  { title:'Both hands', difficulty:2, caseSensitive:false, focus:'Bring both hands together for familiar words.', tips:['Start with your index fingers on F and J.', 'Use a thumb for spaces.', 'Build a steady rhythm before chasing speed.'], drills:[
    {name:'Hand-to-hand rhythm', text:'the quick fox jumps over the lazy dog'},
    {name:'Common words', text:'the little cat and the happy dog play'},
    {name:'Everyday phrases', text:'make a small plan and take your time'} ] },
  { title:'Capitalization', difficulty:3, caseSensitive:true, focus:'Use Shift to make capital letters.', tips:['Capitalization counts from this chapter onward.', 'Hold Shift and type the letter together.', 'Try using the opposite hand for Shift.'], drills:[
    {name:'First capitals', text:'A B C D E F G H I J K L M N'},
    {name:'Names', text:'Rugo Mia Alex Jamie Jordan Sam'},
    {name:'Sentence starts', text:'Hello Rugo Good morning Nice work'} ] },
  { title:'Punctuation', difficulty:4, caseSensitive:true, focus:'Add periods, commas, exclamation points and question marks.', tips:['The period and comma live near your right hand.', 'Hold Shift for ! and ? on a US keyboard.', 'Type spaces after punctuation where shown.'], drills:[
    {name:'Periods and commas', text:'red, blue, green. cats, dogs, birds.'},
    {name:'Questions and excitement', text:'Ready? Yes! Go! Where? Here!'},
    {name:'Mix the marks', text:'Hi, Rugo! Are you ready? Yes, I am.'} ] },
  { title:'Sentences', difficulty:5, caseSensitive:true, focus:'Combine capitals, words and punctuation.', tips:['Begin each sentence with a capital letter.', 'Notice the spaces after punctuation.', 'Accuracy first, then build speed.'], drills:[
    {name:'Short sentences', text:'Rugo runs fast. Mia walks slowly.'},
    {name:'Questions and replies', text:'Can you see the stars? Yes, I can!'},
    {name:'A tiny story', text:'The rain stopped, and Rugo smiled. What a lovely day!'} ] },
  { title:'Number row', difficulty:5, caseSensitive:true, focus:'Reach for the number row and return home.', tips:['Reach upward from your home row.', 'Keep the other fingers relaxed.', 'Numbers count just like letters.'], drills:[
    {name:'Number patterns', text:'12345 67890 13579 24680'},
    {name:'Numbers in context', text:'I have 3 books and 12 pencils.'},
    {name:'Dates and quantities', text:'On day 24, Rugo found 8 shiny stones.'} ] },
  { title:'Paragraphs and whitespace', difficulty:6, caseSensitive:true, focus:'Practice Enter and Tab as part of your text.', tips:['Press Enter when you see the return symbol.', 'Press Tab when you see the arrow; Shift+Tab still moves focus.', 'Match spaces and punctuation as shown.'], drills:[
    {name:'New lines', text:'First line.\nSecond line.\nThird line.'},
    {name:'Indented lines', text:'Title\n\tOne small step.\n\tAnother small step.'},
    {name:'A short paragraph', text:'Rugo found a trail.\n\tHe followed it home.\nThe sun was setting.'} ] },
  { title:'Special characters', difficulty:7, caseSensitive:true, focus:'Use Shift and the number row for symbols.', tips:['On a US keyboard, @ # $ and % use Shift.', 'Watch the symbol carefully before typing.', 'Return to the home row after reaching.'], drills:[
    {name:'Symbol patterns', text:'@ # $ % @ # $ %'},
    {name:'Symbols in context', text:'Email me @ noon. Save 20% of $50.'},
    {name:'Mixed symbols', text:'Task #3: save $25 and share @home.'} ] },
  { title:'Java basics', difficulty:7, caseSensitive:true, focus:'Type simple Java variables and strings.', tips:['Java is case-sensitive.', 'Match semicolons and quotation marks exactly.', 'Spaces are part of the exercise.'], drills:[
    {name:'Variables', text:'int score = 10;'},
    {name:'Strings', text:'String name = "Rugo";'},
    {name:'Print a value', text:'System.out.println(name);'} ] },
  { title:'Java decisions and arrays', difficulty:8, caseSensitive:true, focus:'Practice the punctuation used in if statements and arrays.', tips:['Match parentheses and braces carefully.', 'Square brackets mark an array.', 'Keep uppercase and lowercase exact.'], drills:[
    {name:'If statement', text:'if (score > 10) { score = 10; }'},
    {name:'If and else', text:'if (ready) { go(); } else { wait(); }'},
    {name:'Arrays', text:'int[] scores = {1, 2, 3};'} ] },
  { title:'Java classes and methods', difficulty:9, caseSensitive:true, focus:'Type more complete Java structures.', tips:['Braces group the code inside a class or method.', 'Press Enter and Tab where indicated.', 'Notice Java’s capitalization in names.'], drills:[
    {name:'A class', text:'class Rugo {\n\tint score = 0;\n}'},
    {name:'A method', text:'void wave() {\n\tSystem.out.println("Hi!");\n}'},
    {name:'Return a value', text:'int add(int a, int b) {\n\treturn a + b;\n}'} ] },
  { title:'Mixed mastery', difficulty:9, caseSensitive:true, focus:'Bring every skill together.', tips:['Expect letters, numbers, punctuation and code.', 'Read ahead, then keep a steady rhythm.', 'Take your time with whitespace and symbols.'], drills:[
    {name:'A message', text:'Hi, Rugo! Meet me @ 3:30. Bring $5.'},
    {name:'Notes', text:'Plan #2\n\tPack 3 bags.\n\tSave 10% for later.'},
    {name:'Final challenge', text:'String pet = "Rugo";\nif (score >= 90) {\n\tSystem.out.println(pet);\n}'} ] },
]

export const lessons = chapters.flatMap((chapter, chapterIndex) => chapter.drills.map((drill, levelIndex) => ({
  ...drill, chapterIndex, levelIndex, caseSensitive: chapter.caseSensitive,
  minWpm: Math.min(30, 12 + chapter.difficulty * 2 + levelIndex),
  maxMistakes: chapter.difficulty <= 2 ? 5 : chapter.difficulty <= 5 ? 4 : 3,
})))
