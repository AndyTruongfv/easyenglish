const fs = require('fs');

const PRESET_TRENDS = [
  {
    title: "Perfect - Ed Sheeran",
    category: "Love Songs (Full Lyrics)",
    rawText: `I found a love for me
Oh darling, just dive right in and follow my lead
Well, I found a girl, beautiful and sweet
Oh, I never knew you were the someone waiting for me

'Cause we were just kids when we fell in love
Not knowing what it was
I will not give you up this time
But darling, just kiss me slow, your heart is all I own
And in your eyes, you're holding mine

Baby, I'm dancing in the dark with you between my arms
Barefoot on the grass, listening to our favourite song
When you said you looked a mess, I whispered underneath my breath
But you heard it, darling, you look perfect tonight

Well I found a woman, stronger than anyone I know
She shares my dreams, I hope that someday I'll share her home
I found a lover, to carry more than just my secrets
To carry love, to carry children of our own

We are still kids, but we're so in love
Fighting against all odds
I know we'll be alright this time
Darling, just hold my hand, be my girl, I'll be your man
I see my future in your eyes

Baby, I'm dancing in the dark with you between my arms
Barefoot on the grass, listening to our favourite song
When I saw you in that dress, looking so beautiful
I don't deserve this, darling, you look perfect tonight

Baby, I'm dancing in the dark, with you between my arms
Barefoot on the grass, listening to our favourite song
I have faith in what I see, now I know I have met an angel in person
And she looks perfect, I don't deserve this
You look perfect tonight`,
    youtubeUrl: "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
    karaokeUrl: "https://www.youtube.com/watch?v=1K3b6d2kKVo",
  },
  {
    title: "Die With A Smile - Lady Gaga & Bruno Mars",
    category: "Billboard #1 Hit (Full Lyrics)",
    rawText: `I, I just woke up from a dream
Where you and I had to say goodbye
And I don't know what it all means
But since I survived, I realized

Wherever you go, that's where I'll follow
Nobody's promised tomorrow
So I'ma love you every night like it's the last night
Like it's the last night

If the world was ending
I'd wanna be next to you
If the party was over
And our time on Earth was through
I'd wanna hold you just for a while
And die with a smile
If the world was ending
I'd wanna be next to you`,
    youtubeUrl: "https://www.youtube.com/watch?v=kPa7bsKwL-c",
    karaokeUrl: "https://www.youtube.com/watch?v=uTBPt1k0DDI",
  },
  {
    title: "Cruel Summer - Taylor Swift",
    category: "Billboard Hot 100 (Full Lyrics)",
    rawText: `Fever dream high in the quiet of the night
You know that I caught it
Bad, bad boy
Shiny toy with a price
You know that I bought it

Killing me slow, out the window
I'm always waiting for you to be waiting below
Devils roll the dice, angels roll their eyes
What doesn't kill me makes me want you more

And it's new, the shape of your body
It's blue, the feeling I've got
And it's ooh, whoa oh
It's a cruel summer
It's cool, that's what I tell 'em
No rules in breakable heaven
But ooh, whoa oh
It's a cruel summer
With you`,
    youtubeUrl: "https://www.youtube.com/watch?v=ic8j13U_FS8",
    karaokeUrl: "https://www.youtube.com/watch?v=sU149-jYgRs",
  },
  {
    title: "As It Was - Harry Styles",
    category: "Billboard Hot 100 (Full Lyrics)",
    rawText: `Holdin' me back
Gravity's holdin' me back
I want you to hold out the palm of your hand
Why don't we leave it at that?
Nothin' to say
When everything gets in the way
Seems you cannot be replaced
And I'm the one who will stay, oh-oh-oh

In this world, it's just us
You know it's not the same as it was
In this world, it's just us
You know it's not the same as it was
As it was, as it was`,
    youtubeUrl: "https://www.youtube.com/watch?v=H5v3kku4y6Q",
    karaokeUrl: "https://www.youtube.com/watch?v=VlUqA0A58h8",
  },
  {
    title: "Flowers - Miley Cyrus",
    category: "Billboard Hot 100 (Full Lyrics)",
    rawText: `We were good, we were gold
Kinda dream that can't be sold
We were right 'til we weren't
Built a home and watched it burn

Mm, I didn't wanna leave you
I didn't wanna lie
Started to cry but then remembered I

I can buy myself flowers
Write my name in the sand
Talk to myself for hours
Say things you don't understand
I can take myself dancing
And I can hold my own hand
Yeah, I can love me better than you can`,
    youtubeUrl: "https://www.youtube.com/watch?v=G7KNmW9a75Y",
    karaokeUrl: "https://www.youtube.com/watch?v=5rT4HkU6n1c",
  },
  {
    title: "Blinding Lights - The Weeknd",
    category: "Billboard Hot 100 (Full Lyrics)",
    rawText: `Yeah
I've been tryna call
I've been on my own for long enough
Maybe you can show me how to love, maybe
I'm going through withdrawals
You don't even have to do too much
You can turn me on with just a touch, baby

I look around and Sin City's cold and empty
No one's around to judge me
I can't see clearly when you're gone

I said, ooh, I'm blinded by the lights
No, I can't sleep until I feel your touch
I said, ooh, I'm drowning in the night
Oh, when I'm like this, you're the one I trust`,
    youtubeUrl: "https://www.youtube.com/watch?v=4NRXx6U8ABQ",
    karaokeUrl: "https://www.youtube.com/watch?v=R9KjN_a2Y38",
  },
  {
    title: "Shape of You - Ed Sheeran",
    category: "MTV Europe Chart (Full Lyrics)",
    rawText: `The club isn't the best place to find a lover
So the bar is where I go
Me and my friends at the table doing shots
Drinking fast and then we talk slow
Come over and start up a conversation with just me
And trust me I'll give it a chance now
Take my hand, stop, put Van the Man on the jukebox
And then we start to dance, and now I'm singing like

Girl, you know I want your love
Your love was handmade for somebody like me
Come on now, follow my lead
I may be crazy, don't mind me
Say, boy, let's not talk too much
Grab on my waist and put that body on me
Come on now, follow my lead
Come, come on now, follow my lead

I'm in love with the shape of you
We push and pull like a magnet do
Although my heart is falling too
I'm in love with your body`,
    youtubeUrl: "https://www.youtube.com/watch?v=JGwWNGJdvx8",
    karaokeUrl: "https://www.youtube.com/watch?v=zK2ZJeXgBqU",
  },
  {
    title: "Someone Like You - Adele",
    category: "MTV Europe Chart (Full Lyrics)",
    rawText: `I heard that you're settled down
That you found a girl and you're married now
I heard that your dreams came true
Guess she gave you things, I didn't give to you
Old friend, why are you so shy?
Ain't like you to hold back or hide from the light

I hate to turn up out of the blue, uninvited
But I couldn't stay away, I couldn't fight it
I had hoped you'd see my face
And that you'd be reminded that for me, it isn't over

Never mind, I'll find someone like you
I wish nothing but the best for you, too
"Don't forget me, " I beg
I remember you said
"Sometimes it lasts in love, but sometimes it hurts instead"`,
    youtubeUrl: "https://www.youtube.com/watch?v=hLQl3WQQoQ0",
    karaokeUrl: "https://www.youtube.com/watch?v=Vz_A71_1QhA",
  },
  {
    title: "Counting Stars - OneRepublic",
    category: "MTV Europe Chart (Full Lyrics)",
    rawText: `Lately, I've been, I've been losing sleep
Dreaming about the things that we could be
But baby, I've been, I've been praying hard
Said no more counting dollars, we'll be counting stars
Yeah, we'll be counting stars

I see this life, like a swinging vine
Swing my heart across the line
And in my face is flashing signs
Seek it out and ye shall find
Old, but I'm not that old
Young, but I'm not that bold
And I don't think the world is sold
On just doing what we're told

I feel something so right
Doing the wrong thing
I feel something so wrong
Doing the right thing
I couldn't lie, couldn't lie, couldn't lie
Everything that kills me makes me feel alive`,
    youtubeUrl: "https://www.youtube.com/watch?v=hT_nvWreIhg",
    karaokeUrl: "https://www.youtube.com/watch?v=KzXgZfW1H_A",
  },
  {
    title: "Viva La Vida - Coldplay",
    category: "MTV Europe Chart (Full Lyrics)",
    rawText: `I used to rule the world
Seas would rise when I gave the word
Now in the morning, I sleep alone
Sweep the streets I used to own

I used to roll the dice
Feel the fear in my enemy's eyes
Listen as the crowd would sing
"Now the old king is dead, long live the king"

One minute I held the key
Next the walls were closed on me
And I discovered that my castles stand
Upon pillars of salt and pillars of sand

I hear Jerusalem bells a-ringing
Roman Cavalry choirs are singing
Be my mirror, my sword and shield
My missionaries in a foreign field
For some reason I can't explain
Once you'd gone, there was never, never an honest word
And that was when I ruled the world`,
    youtubeUrl: "https://www.youtube.com/watch?v=dvgZvnPRbCE",
    karaokeUrl: "https://www.youtube.com/watch?v=O1k9iHkK4Y0",
  },
  {
    title: "Night Changes - One Direction",
    category: "MTV Europe Chart (Full Lyrics)",
    rawText: `Going out tonight, changes into something red
Her mother doesn't like that kind of dress
Everything she never had she's showing off
Driving too fast, moon is breaking through her hair
She's heading for something that she won't forget
Having no regrets is all that she really wants

We're only getting older, baby
And I've been thinking about it lately
Does it ever drive you crazy
Just how fast the night changes?
Everything that you've ever dreamed of
Disappearing when you wake up
But there's nothing to be afraid of
Even when the night changes
It will never change me and you`,
    youtubeUrl: "https://www.youtube.com/watch?v=syFZfO_wfMQ",
    karaokeUrl: "https://www.youtube.com/watch?v=0k5i9J7K36o",
  },
  {
    title: "Until I Found You - Stephen Sanchez",
    category: "ZingMp3 US-UK Trending (Full Lyrics)",
    rawText: `Georgia, wrap me up in all your
I want you in my arms
Oh, let me hold you
I'll never let you go again, like I did
Oh, I used to say

"I would never fall in love again until I found her"
I said, "I would never fall unless it's you I fall into"
I was lost within the darkness, but then I found her
I found you

Heaven, when I held you again
How could we ever just be friends?
I would rather die than let you go
Juliet to your Romeo
How I heard you say`,
    youtubeUrl: "https://www.youtube.com/watch?v=GxldQ9eX2c4",
    karaokeUrl: "https://www.youtube.com/watch?v=p4vB_Gj5lK4",
  },
  {
    title: "At My Worst - Pink Sweat$",
    category: "ZingMp3 US-UK Trending (Full Lyrics)",
    rawText: `Can I call you baby?
Can you be my friend?
Can you be my lover up until the very end?
Let me show you love, oh, I don't pretend
Stick by my side even when the world is givin' in, yeah

Oh, oh, oh, don't
Don't you worry
I'll be there, whenever you want me

I need somebody who can love me at my worst
No, I'm not perfect, but I hope you see my worth
'Cause it's only you, nobody new, I put you first
And for you, girl, I swear I'll do the worst`,
    youtubeUrl: "https://www.youtube.com/watch?v=8CEJoCr_94",
    karaokeUrl: "https://www.youtube.com/watch?v=0k5i9J7K36o",
  },
  {
    title: "Double Take - dhruv",
    category: "ZingMp3 US-UK Trending (Full Lyrics)",
    rawText: `I could say I never dare
To think about you in that way, but
I would be lyin'
And I pretend I'm happy for you
When you find some dude to take home
But I won't deny that

In the midst of the crowds
In the shapes in the clouds
I don't see nobody but you
In my rose-tinted dreams
Wrinkled silk on my sheets
I don't see nobody but you

Boy, you got me hooked onto something
Who could say that they saw us coming?
Tell me
Do you feel the love?
Spend a summer or a lifetime with me
Let me take you to the place of your dreams
Tell me
Do you feel the love?`,
    youtubeUrl: "https://www.youtube.com/watch?v=uQFEe9D42H0",
    karaokeUrl: "https://www.youtube.com/watch?v=0k5i9J7K36o",
  },
  {
    title: "Say You Won't Let Go - James Arthur",
    category: "ZingMp3 US-UK Trending (Full Lyrics)",
    rawText: `I met you in the dark, you lit me up
You made me feel as though I was enough
We danced the night away, we drank too much
I held your hair back when
You were throwing up

Then you smiled over your shoulder
For a minute, I was stone-cold sober
I pulled you closer to my chest
And you asked me to stay over
I said, I already told ya
I think that you should get some rest

I knew I loved you then
But you'd never know
'Cause I played it cool when I was scared of letting go
I know I needed you
But I never showed
But I wanna stay with you until we're grey and old
Just say you won't let go
Just say you won't let go`,
    youtubeUrl: "https://www.youtube.com/watch?v=0yW7w8F2TVA",
    karaokeUrl: "https://www.youtube.com/watch?v=0k5i9J7K36o",
  },
  {
    title: "A Thousand Years - Christina Perri",
    category: "US-UK Classics (Full Lyrics)",
    rawText: `Heart beats fast
Colors and promises
How to be brave?
How can I love when I'm afraid to fall?
But watching you stand alone
All of my doubt suddenly goes away somehow

One step closer

I have died everyday waiting for you
Darling, don't be afraid
I have loved you for a thousand years
I'll love you for a thousand more

Time stands still
Beauty in all she is
I will be brave
I will not let anything take away
What's standing in front of me
Every breath, every hour has come to this

One step closer`,
    youtubeUrl: "https://www.youtube.com/watch?v=rtOvBOTyX00",
    karaokeUrl: "https://www.youtube.com/watch?v=R43_Hskg4-g",
  },
  {
    title: "Close to You - The Carpenters",
    category: "US-UK Classics (Full Lyrics)",
    rawText: `Why do birds suddenly appear
Every time you are near?
Just like me, they want to be
Close to you

Why do stars fall down from the sky
Every time you walk by?
Just like me, they want to be
Close to you

On the day that you were born the angels came together
And decided to create a dream come true
So they sprinkled moon dust in your hair of gold
And starlight in your eyes of blue

That is why all the girls in town
Follow you all around
Just like me, they want to be
Close to you`,
    youtubeUrl: "https://www.youtube.com/watch?v=6inwzOoolU4",
    karaokeUrl: "https://www.youtube.com/watch?v=0k5i9J7K36o",
  },
  {
    title: "Take Me to Your Heart - MLTR",
    category: "US-UK Classics (Full Lyrics)",
    rawText: `Hiding from the rain and snow
Trying to forget but I won't let go
Looking at a crowded street
Listening to my own heart beat

So many people all around the world
Tell me where do I find someone like you girl

Take me to your heart take me to your soul
Give me your hand before I'm old
Show me what love is, haven't got a clue
Show me that wonders can be true

They say nothing lasts forever
We're only here today
Love is now or never
Bring me far away

Take me to your heart take me to your soul
Give me your hand and hold me
Show me what love is, be my guiding star
It's easy take me to your heart`,
    youtubeUrl: "https://www.youtube.com/watch?v=h3uAM2h5iX0",
    karaokeUrl: "https://www.youtube.com/watch?v=0k5i9J7K36o",
  },
  {
    title: "Lemon Tree - Fools Garden",
    category: "US-UK Classics (Full Lyrics)",
    rawText: `I'm sitting here in the boring room
It's just another rainy Sunday afternoon
I'm wasting my time, I got nothing to do
I'm hanging around, I'm waiting for you
But nothing ever happens and I wonder

I'm driving around in my car
I'm driving too fast, I'm driving too far
I'd like to change my point of view
I feel so lonely, I'm waiting for you
But nothing ever happens and I wonder

I wonder how, I wonder why
Yesterday you told me 'bout the blue, blue sky
And all that I can see is just a yellow lemon tree
I'm turning my head up and down
I'm turning, turning, turning, turning, turning around
And all that I can see is just another lemon tree`,
    youtubeUrl: "https://www.youtube.com/watch?v=l2UiY2wivTs",
    karaokeUrl: "https://www.youtube.com/watch?v=bCDIt50hRDs",
  },
  {
    title: "My Love - Westlife",
    category: "US-UK Classics (Full Lyrics)",
    rawText: `An empty street, an empty house
A hole inside my heart
I'm all alone, the rooms are getting smaller
I wonder how, I wonder why
I wonder where they are
The days we had, the songs we sang together
Oh, yeah

And oh, my love
I'm holding on forever
Reaching for the love that seems so far

So I say a little prayer
And hope my dreams will take me there
Where the skies are blue
To see you once again, my love
Overseas, from coast to coast
To find the place I love the most
Where the fields are green
To see you once again, my love`,
    youtubeUrl: "https://www.youtube.com/watch?v=ulOb9gIGGd0",
    karaokeUrl: "https://www.youtube.com/watch?v=0k5i9J7K36o",
  },
  {
    title: "Hotel California - Eagles",
    category: "US-UK Classics (Full Lyrics)",
    rawText: `On a dark desert highway, cool wind in my hair
Warm smell of colitas, rising up through the air
Up ahead in the distance, I saw a shimmering light
My head grew heavy and my sight grew dim
I had to stop for the night

There she stood in the doorway
I heard the mission bell
And I was thinking to myself
"This could be Heaven or this could be Hell"
Then she lit up a candle and she showed me the way
There were voices down the corridor
I thought I heard them say

Welcome to the Hotel California
Such a lovely place (Such a lovely place)
Such a lovely face
Plenty of room at the Hotel California
Any time of year (Any time of year)
You can find it here`,
    youtubeUrl: "https://www.youtube.com/watch?v=EqPtz5qN7HM",
    karaokeUrl: "https://www.youtube.com/watch?v=0k5i9J7K36o",
  }
];

const TOP_CHARTS = {
  billboard: PRESET_TRENDS.filter(p => p.category.includes("Billboard")).map(p => ({ title: p.title, artist: p.title.split(" - ")[0], cat: "Billboard Hot 100" })),
  mtv: PRESET_TRENDS.filter(p => p.category.includes("MTV")).map(p => ({ title: p.title, artist: p.title.split(" - ")[0], cat: "MTV Europe Chart" })),
  zing: PRESET_TRENDS.filter(p => p.category.includes("ZingMp3")).map(p => ({ title: p.title, artist: p.title.split(" - ")[0], cat: "ZingMp3 US-UK Trending" })),
  classics: PRESET_TRENDS.filter(p => p.category.includes("Classics")).map(p => ({ title: p.title, artist: p.title.split(" - ")[0], cat: "US-UK Classics" })),
};

fs.writeFileSync('src/lib/songs.ts', "export const PRESET_TRENDS = " + JSON.stringify(PRESET_TRENDS, null, 2) + ";\n\nexport const TOP_CHARTS = " + JSON.stringify(TOP_CHARTS, null, 2) + ";\n");
