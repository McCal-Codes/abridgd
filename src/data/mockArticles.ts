import { Article } from '../types/Article';

const BODY_TEXT = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. EXCEPTEUR sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.`;

export const MOCK_ARTICLES: Article[] = [
  // TOP
  {
    id: '1',
    headline: 'New Bridge Proposal Sparks Debate in City Council',
    summary: 'The proposed timeline for the new span across the Monongahela has drawn both praise and criticism from local leaders.',
    body: BODY_TEXT,
    source: 'City Desk',
    timestamp: '2 hours ago',
    category: 'Top',
    readTimeMinutes: 5,
  },
  {
    id: '99',
    headline: 'Major Traffic Accident Cleared on I-376',
    summary: 'Authorities have reopened all lanes following a multi-vehicle collision early this morning.',
    body: BODY_TEXT,
    source: 'Breaking News',
    timestamp: '1 hour ago',
    category: 'Top',
    readTimeMinutes: 2,
    isSensitive: true,
    sensitivityWarning: 'Contains descriptions of a vehicle accident.',
  },
  {
    id: '2',
    headline: 'Steelers Training Camp: Top Takeaways',
    summary: 'As the season approaches, the defense is looking sharper than ever, but questions remain about the offensive line.',
    body: BODY_TEXT,
    source: 'Sports Desk',
    timestamp: '4 hours ago',
    category: 'Top',
    readTimeMinutes: 3,
  },

  // LOCAL
  {
    id: '3',
    headline: 'Lawrenceville Market Expansion Approved',
    summary: 'The popular weekend market will now extend to two additional blocks starting next month.',
    body: BODY_TEXT,
    source: 'Neighborhood Watch',
    timestamp: '1 day ago',
    category: 'Local',
    readTimeMinutes: 4,
  },
  {
    id: '4',
    headline: 'Pittsburgh Schools Announce New Art Program',
    summary: 'A grant from a local foundation will fund arts education in 15 elementary schools.',
    body: BODY_TEXT,
    source: 'Education Beat',
    timestamp: '2 days ago',
    category: 'Local',
    readTimeMinutes: 6,
  },

  // BUSINESS
  {
    id: '5',
    headline: 'Tech Hub Growth: Shadyside Startup Secures Series B',
    summary: 'Robotics firm "Automata" raises $20M to expand its AI-driven logistics platform.',
    body: BODY_TEXT,
    source: 'Biz Journals',
    timestamp: '5 hours ago',
    category: 'Business',
    readTimeMinutes: 7,
  },
  
  // SPORTS
  {
    id: '6',
    headline: 'Pirates Look to Snap Losing Streak',
    summary: 'Pitching rotation changes are expected ahead of the weekend series.',
    body: BODY_TEXT,
    source: 'Sports Desk',
    timestamp: '30 mins ago',
    category: 'Sports',
    readTimeMinutes: 2,
  },
  
  // CULTURE
  {
    id: '7',
    headline: 'Carnegie Museum Unveils Industrial Era Exhibit',
    summary: 'A look back at the steel workers who built the city, featuring never-before-seen photographs.',
    body: BODY_TEXT,
    source: 'Arts & Life',
    timestamp: '1 week ago',
    category: 'Culture',
    readTimeMinutes: 8,
  },
  {
    id: '8',
    headline: 'Best Coffee Shops in the Strip District',
    summary: 'We ranked the top 5 places to get your morning brew, from classic Italian espresso to modern pour-overs.',
    body: BODY_TEXT,
    source: 'Food & Drink',
    timestamp: '3 days ago',
    category: 'Culture',
    readTimeMinutes: 5,
  },
];
