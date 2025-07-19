import React, { useEffect, useRef, useState } from 'react';
import Board from './components/Board';
import AttackSelector from './components/AttackSelector';
import { buildPath } from './utils/path';

interface Message {
  type: string;
  payload?: any;
}

const attackRanges: Record<'basic' | 'heavy', number> = { basic: 3, heavy: 1 };

export default function Game({userName}: {userName: string}) {
  const socketRef = useRef<WebSocket>();
  const [log, setLog] = useState<string[]>([]);
  const [isYourTurn, setIsYourTurn] = useState(false);
  const [movesLeft, setMovesLeft] = useState(0);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const positionsRef = useRef<Record<string, { x: number; y: number }>>({});
  const [life, setLife] = useState<Record<string, number>>({});
  const [names, setNames] = useState<Record<string, string>>({});
  const [apLeft, setApLeft] = useState(0);
  const [selectedAttack, setSelectedAttack] = useState<'basic' | 'heavy'>('basic');
  const selfIdRef = useRef<string>('');

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001');
    socketRef.current = socket;

    socket.addEventListener('open', () => {
      const id = crypto.randomUUID();
      selfIdRef.current = id;
      socket.send(
        JSON.stringify({
          type: 'join',
          payload: { id: id, name: userName }
        })
      );
    });

    socket.addEventListener('message', (event) => {
      const message: Message = JSON.parse(event.data);
      switch (message.type) {
        case 'system':
          setLog((prev) => [...prev, message.payload]);
          break;
        case 'state':
          setPositions(message.payload.positions);
          positionsRef.current = message.payload.positions;
          setLife(message.payload.life);
          setNames(message.payload.names)
          break;
        case 'spawn':
          setPositions((prev) => {
            const updated = { ...prev, [message.payload.id]: message.payload.position };
            positionsRef.current = updated;
            return updated;
          });
          setLife((prev) => ({ ...prev, [message.payload.id]: message.payload.life }));
          setNames((prev) => ({ ...prev, [message.payload.id]: message.payload.name }));
          break;
        case 'your-turn':
          setLog((prev) => [...prev, 'Your turn!']);
          setIsYourTurn(true);
          setMovesLeft(message.payload?.moves ?? 0);
          setApLeft(message.payload?.ap ?? 0);
          break;
        case 'wait-turn':
          setIsYourTurn(false);
          setMovesLeft(0);
          break;
        case 'action':
          if (message.payload.kind === 'move') {
            animateMovement(message.payload.id, message.payload.to);
          }
          if (message.payload.kind === 'damage') {
            setLife((prev) => ({ ...prev, [message.payload.id]: message.payload.life }));
          }
          if (message.payload.movesLeft !== undefined && message.payload.id === selfIdRef.current) {
            setMovesLeft(message.payload.movesLeft);
          }
          if (message.payload.kind === 'attack') {
            if (message.payload.id === selfIdRef.current) {
              setApLeft(message.payload.apLeft);
            }

            const effects = message.payload.effects as any[];
            effects?.forEach((e) => {
              if (e.kind === 'damage') {
                setLife((prev) => ({ ...prev, [e.targetId]: e.newLife }));
              }
              if (e.kind === 'move' || e.kind === 'push') {
                animateMovement(e.targetId, e.to);
              }
            });
          }
          setLog((prev) => [...prev, `Action: ${JSON.stringify(message.payload)}`]);
          break;
      }
    });

    return () => socket.close();
  }, []);

  function handleCell(x: number, y: number) {
    if (!isYourTurn || !socketRef.current) return;
    const selfPos = positions[selfIdRef.current];
    if (!selfPos) return;
    const targetId = Object.keys(positions).find((pid) => positions[pid].x === x && positions[pid].y === y);
    if (targetId && targetId !== selfIdRef.current) {
        socketRef.current.send(
          JSON.stringify({
            type: 'action',
            payload: { kind: 'attack', id: selfIdRef.current, target: targetId, attackType: selectedAttack }
          })
        );
      
      return;
    }
    // movement
    if (movesLeft <= 0) return;
    socketRef.current.send(
      JSON.stringify({
        type: 'action',
        payload: { kind: 'move', id: selfIdRef.current, to: { x, y } }
      })
    );
  }

  function handlePass() {
    if (!isYourTurn || !socketRef.current) return;
    socketRef.current.send(
      JSON.stringify({
        type: 'action',
        payload: { kind: 'pass', id: selfIdRef.current }
      })
    );
    setMovesLeft(0);
    setIsYourTurn(false);
  }

  const highlightCells = new Set<string>();
  if (isYourTurn && positions[selfIdRef.current]) {
    const { x: sx, y: sy } = positions[selfIdRef.current];
    const range = attackRanges[selectedAttack];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const d = Math.abs(sx - x) + Math.abs(sy - y);
        if (d > 0 && d <= range) {
          highlightCells.add(`${x}-${y}`);
        }
      }
    }
  }

  function animateMovement(id: string, to: { x: number; y: number }) {
    const from = positionsRef.current[id];
    if (!from) {
      setPositions((prev) => {
        const updated = { ...prev, [id]: to };
        positionsRef.current = updated;
        return updated;
      });
      return;
    }

    const path = buildPath(from, to);

    path.forEach((pos, idx) => {
      setTimeout(() => {
        setPositions((prev) => {
          const updated = { ...prev, [id]: pos };
          positionsRef.current = updated;
          return updated;
        });
      }, idx * 120);
    });
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Battle Arena</h1>
      <Board size={8} playerPositions={positions} isYourTurn={isYourTurn} selfId={selfIdRef.current} onCellClick={handleCell} highlightCells={highlightCells} />
      <AttackSelector value={selectedAttack} onChange={(v) => setSelectedAttack(v)} />
      {isYourTurn && (
        <button onClick={handlePass} style={{ marginTop: '0.5rem' }}>
          Pass Turn
        </button>
      )}
      <p>Moves left: {movesLeft} | AP left: {apLeft}</p>
      <div>
        <h2>Life</h2>
        <ul>
          {Object.entries(life).map(([id, hp]) => (
            <li key={id} style={{ color: id === selfIdRef.current ? 'dodgerblue' : 'crimson' }}>
              {id === selfIdRef.current ? `${userName} (you)` : names[id]}: {hp}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <h2>Log</h2>
        <ul>
          {log.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </div>
    </div>
  );
} 