// Pattern APAC Values Week — office closed, no whereabouts status updates

export const VALUES_WEEK_INTRO = {
  title: '🎉 Values Week Schedule (HK Office)',
  disclaimer:
    'Times below are close to final and may shift slightly as we lock in details — stay tuned for updates!',
};

/** Short labels for calendar pills (emoji + uppercase theme). */
export const VALUES_WEEK_2026 = {
  '2026-09-28': '🎉 GAME CHANGERS',
  '2026-09-29': '🎉 PARTNER OBSESSED & DATA FANATICS',
  '2026-09-30': '🎉 TEAM OF DOERS',
};

export const isValuesWeekDate = ds => ds in VALUES_WEEK_2026;

export const VALUES_WEEK_DAYS = [
  {
    date: '2026-09-28',
    label: 'Monday, 9/28',
    theme: 'Game Changers',
    sessions: [
      {
        slot: 'Morning',
        items: [
          '9:45–10:00 AM — Quick game rule briefing, get ready to play!',
          '10:00–10:15 AM — Kickoff: AI Acceleration mid-point highlights — celebrating our wins so far',
          'Online games: Color Block Sleuth & Live AI Challenge Game — bring your competitive spirit!',
        ],
      },
      {
        slot: 'Afternoon',
        items: [
          '🐱 Giving Back to the Community — join us for a heartwarming visit supporting stray kitties, paired with a relaxing free cup of tea. A little kindness, a little calm, a lot of good vibes.',
        ],
      },
    ],
  },
  {
    date: '2026-09-29',
    label: 'Tuesday, 9/29',
    theme: 'Partner Obsessed & Data Fanatics',
    sessions: [
      {
        slot: 'Morning',
        items: [
          'Team-Based Telephone Pictionary — put your communication and intent-reading skills to the test as messages pass down the line!',
        ],
      },
      {
        slot: 'Afternoon',
        items: [
          '🎊 Party House Celebration — kick back with the team for some fun, games, and good energy to close out the day.',
        ],
      },
    ],
  },
  {
    date: '2026-09-30',
    label: 'Wednesday, 9/30',
    theme: 'Team of Doers',
    sessions: [
      {
        slot: 'Morning',
        items: ['Details coming soon — stay tuned!'],
      },
    ],
  },
];

export const getValuesWeekDay = ds => VALUES_WEEK_DAYS.find(d => d.date === ds);
