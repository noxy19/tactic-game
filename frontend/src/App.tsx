import React, { useState } from 'react';
import Game from './Game';

export default function App() {
  const [started, setStarted] = useState(false);

  return started ? (
    <Game />
  ) : (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
      <button onClick={() => setStarted(true)} style={{ fontSize: '2rem', padding: '1rem 2rem' }}>
        Start Battle
      </button>
    </div>
  );
} 