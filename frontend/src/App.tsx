import React, { useState } from 'react';
import Game from './Game';

export default function App() {
  const [started, setStarted] = useState(false);
  const [userNameInput, setUserNameInput] = useState<string>("");

  const handleUserNameInputChange = 
  (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserNameInput(e.target.value);
  };

  return started ? (
    <Game userName = {userNameInput} />
  ) : (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
      <form action="/action_page.php">
        <input style={{width: "100%"}} type="text" value={userNameInput} onChange={handleUserNameInputChange} placeholder="Enter your username"/>
        <br />
        <br />
        <input type="submit" value="Start Battle" onClick={() => setStarted(true)} style={{ fontSize: '2rem', padding: '1rem 2rem' }}/>
      </form>
    </div>
  );
}