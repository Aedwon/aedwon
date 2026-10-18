'use client';

import dynamic from 'next/dynamic';

// The wish history is a few hundred KB of records, so the counter loads only when its section is opened.
const WishCounter = dynamic(() => import('./WishCounter'), {
  ssr: false,
  loading: () => <div style={{ height: 420 }} aria-hidden />,
});

export default WishCounter;
