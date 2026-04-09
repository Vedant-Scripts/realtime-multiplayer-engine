import { useRef, useState, useEffect } from "react";
import { Client, type Socket } from "@heroiclabs/nakama-js";

type Board = Array<'X' | 'O' | null>;

const OPCODES = { MOVE: 1, STATE_UPDATE: 2 };

const WINS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

const STRIKE_COORDS: Record<string, [number, number, number, number]> = {
    '0,2': [40, 40, 230, 40],
    '3,5': [40, 135, 230, 135],
    '6,8': [40, 230, 230, 230],
    '0,6': [40, 40, 40, 230],
    '1,7': [135, 40, 135, 230],
    '2,8': [230, 40, 230, 230],
    '0,8': [40, 40, 230, 230],
    '2,6': [230, 40, 40, 230],
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&display=swap');
.ttt-root {
    min-height: 100vh;
    background: #080c1a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Rajdhani', sans-serif;
    position: relative;
    overflow: hidden;
    padding: 2rem 1rem;
}
.ttt-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
        radial-gradient(ellipse at 30% 20%, rgba(0,200,255,0.07) 0%, transparent 60%),
        radial-gradient(ellipse at 70% 80%, rgba(200,0,255,0.07) 0%, transparent 60%);
    pointer-events: none;
}
.ttt-title {
    font-size: 2.4rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: #e0f0ff;
    text-shadow: 0 0 20px rgba(0,200,255,0.5), 0 0 40px rgba(0,200,255,0.2);
    margin-bottom: 1rem;
    text-transform: uppercase;
}
.ttt-scores {
    display: flex;
    gap: 2.5rem;
    margin-bottom: 1rem;
}
.score-box { text-align: center; min-width: 60px; }
.score-label {
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    color: #4a6a7a;
    text-transform: uppercase;
    margin-bottom: 2px;
}
.score-x { font-size: 1.5rem; font-weight: 700; color: #00d4ff; text-shadow: 0 0 8px rgba(0,212,255,0.5); }
.score-o { font-size: 1.5rem; font-weight: 700; color: #d400ff; text-shadow: 0 0 8px rgba(212,0,255,0.5); }
.score-d { font-size: 1.5rem; font-weight: 700; color: #666; }
.ttt-status {
    font-size: 1.05rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    color: #8ab4cc;
    min-height: 1.8rem;
    margin-bottom: 1.2rem;
    transition: color 0.3s;
}
.ttt-status.x-turn  { color: #00d4ff; text-shadow: 0 0 10px rgba(0,212,255,0.5); }
.ttt-status.o-turn  { color: #d400ff; text-shadow: 0 0 10px rgba(212,0,255,0.5); }
.ttt-status.win     { color: #ffe066; text-shadow: 0 0 14px rgba(255,220,0,0.6); font-size: 1.3rem; }
.ttt-board-wrap { position: relative; width: 270px; height: 270px; margin-bottom: 1.6rem; }
.ttt-board {
    display: grid;
    grid-template-columns: repeat(3, 80px);
    grid-template-rows: repeat(3, 80px);
    gap: 15px;
    position: relative;
    z-index: 2;
}
.ttt-cell {
    width: 80px; height: 80px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 2.2rem; font-weight: 700;
    transition: background 0.2s, transform 0.1s, border-color 0.2s;
}
.ttt-cell.clickable { cursor: pointer; }
.ttt-cell.clickable:hover {
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.18);
    transform: scale(1.04);
}
.ttt-cell.clickable:active { transform: scale(0.96); }
.ttt-cell.win-cell { background: rgba(255,220,0,0.06); border-color: rgba(255,220,0,0.3); }
.mark-x {
    color: #00d4ff;
    text-shadow: 0 0 12px #00d4ff, 0 0 24px rgba(0,212,255,0.6);
    animation: popIn 0.25s cubic-bezier(0.175,0.885,0.32,1.275) forwards;
}
.mark-o {
    color: #d400ff;
    text-shadow: 0 0 12px #d400ff, 0 0 24px rgba(212,0,255,0.6);
    animation: popIn 0.25s cubic-bezier(0.175,0.885,0.32,1.275) forwards;
}
@keyframes popIn {
    from { opacity: 0; transform: scale(0.3); }
    to   { opacity: 1; transform: scale(1); }
}
.strike-svg {
    position: absolute; top: 0; left: 0;
    width: 270px; height: 270px;
    pointer-events: none; z-index: 3;
    overflow: visible;
}
.strike-line {
    stroke-width: 4; stroke-linecap: round; fill: none;
    stroke-dasharray: 300; stroke-dashoffset: 300;
    transition: stroke-dashoffset 0.5s ease;
}
.strike-line.x-line { stroke: #00d4ff; filter: drop-shadow(0 0 6px #00d4ff); }
.strike-line.o-line { stroke: #d400ff; filter: drop-shadow(0 0 6px #d400ff); }
.strike-line.animate { stroke-dashoffset: 0; }
.ttt-info { display: flex; gap: 2rem; margin-bottom: 1.2rem; }
.info-pill {
    padding: 0.35rem 1rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: #8ab4cc;
}
.info-pill.x { border-color: rgba(0,212,255,0.3); color: #00d4ff; }
.info-pill.o { border-color: rgba(212,0,255,0.3); color: #d400ff; }
.ttt-btn {
    padding: 0.6rem 2rem;
    border-radius: 8px;
    border: 1px solid rgba(0,212,255,0.35);
    background: rgba(0,212,255,0.08);
    color: #00d4ff;
    font-family: 'Rajdhani', sans-serif;
    font-size: 1rem; font-weight: 600;
    letter-spacing: 0.08em;
    cursor: pointer;
    text-transform: uppercase;
    transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
    margin-top: 0.4rem;
}
.ttt-btn:hover:not(:disabled) { background: rgba(0,212,255,0.18); box-shadow: 0 0 16px rgba(0,212,255,0.25); }
.ttt-btn:active:not(:disabled) { transform: scale(0.97); }
.ttt-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ttt-btn.searching {
    border-color: rgba(212,0,255,0.35);
    color: #d400ff;
    background: rgba(212,0,255,0.08);
    animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
    0%, 100% { box-shadow: 0 0 8px rgba(212,0,255,0.2); }
    50%       { box-shadow: 0 0 20px rgba(212,0,255,0.5); }
}
.ttt-match-id {
    font-size: 0.7rem;
    color: #3a5a6a;
    letter-spacing: 0.05em;
    margin-top: 0.8rem;
    word-break: break-all;
    text-align: center;
    max-width: 300px;
}
`;

const App = () => {
    const [matchId, setMatchId] = useState<string | null>(null);
    const [board, setBoard] = useState<Board>(Array(9).fill(null));
    const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O' | null>(null);
    const [status, setStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
    const [mySymbol, setMySymbol] = useState<'X' | 'O' | null>(null);
    const [winner, setWinner] = useState<string | null>(null);
    const [searching, setSearching] = useState(false);
    const [winCells, setWinCells] = useState<number[]>([]);
    const [strikeAnim, setStrikeAnim] = useState(false);
    const [strikeKey, setStrikeKey] = useState<string | null>(null);
    const [scores, setScores] = useState({ X: 0, O: 0, D: 0 });

    const myUserIdRef = useRef<string | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const matchIdRef = useRef<string | null>(null);
    const loseAudioRef = useRef<HTMLAudioElement | null>(null);

    const getStatusClass = () => {
        if (status === 'finished') return 'ttt-status win';
        if (status === 'playing') return mySymbol === currentPlayer ? 'ttt-status x-turn' : 'ttt-status o-turn';
        return 'ttt-status';
    };

    const getStatusText = () => {
        if (status === 'waiting' && !matchId) return 'Press Find Match to play';
        if (status === 'waiting') return 'Waiting for opponent...';
        if (status === 'playing') return mySymbol === currentPlayer ? 'Your turn' : "Opponent's turn";
        if (status === 'finished') {
            if (winner === 'draw') return "It's a draw!";
            return winner === mySymbol ? 'You win!' : 'You lose!';
        }
        return '';
    };

    const setupSocketListeners = (socket: Socket) => {
        socket.onmatchdata = (matchState) => {
            if (matchState.op_code !== OPCODES.STATE_UPDATE) return;

            const data = JSON.parse(new TextDecoder().decode(matchState.data));

            setBoard(data.board);
            setCurrentPlayer(data.currentPlayer);
            setStatus(data.status);
            setWinner(data.winner ?? null);

            if (
                data.status === 'playing' &&
                (data.board as Board).every(cell => cell === null)
            ) {
                setWinCells([]);
                setStrikeAnim(false);
                setStrikeKey(null);
            }

            // 🔥 FIX: use local variable instead of state
            let mySymbolLocal: 'X' | 'O' | null = null;

            if (data.players.X === myUserIdRef.current) {
                mySymbolLocal = 'X';
                setMySymbol('X');
            } else if (data.players.O === myUserIdRef.current) {
                mySymbolLocal = 'O';
                setMySymbol('O');
            }

            // 🔥 WIN HANDLING
            if (data.status === 'finished' && data.winner && data.winner !== 'draw') {
                const combo = WINS.find(([a, b, c]) =>
                    data.board[a] &&
                    data.board[a] === data.board[b] &&
                    data.board[a] === data.board[c]
                );

                if (combo) {
                    setWinCells(combo);
                    setStrikeKey(`${combo[0]},${combo[2]}`);
                    setTimeout(() => setStrikeAnim(true), 50);
                }

                setScores(s => ({
                    ...s,
                    [data.winner]: (s[data.winner as 'X' | 'O'] ?? 0) + 1
                }));
            }

            // 🔥 DRAW HANDLING
            if (data.status === 'finished' && data.winner === 'draw') {
                setScores(s => ({ ...s, D: s.D + 1 }));
            }

            // 🔥 LOSS SOUND (FINAL FIX)
            const iLost =
                mySymbolLocal &&
                data.status === 'finished' &&
                data.winner &&
                data.winner !== 'draw' &&
                data.winner !== mySymbolLocal;

            if (iLost && loseAudioRef.current) {
                console.log("🔊 Playing lose sound");
                loseAudioRef.current.currentTime = 0;
                loseAudioRef.current.play().catch(err => {
                    console.log("Audio error:", err);
                });
            }
        };

        socket.onmatchmakermatched = async (matched) => {
            setSearching(false);

            const res = await socket.joinMatch(matched.match_id);

            matchIdRef.current = res.match_id;
            setMatchId(res.match_id);
        };
    };
    const findMatch = async () => {
        if (!socketRef.current) return;
        setSearching(true);
        await socketRef.current.addMatchmaker("*", 2, 2);
    };

    const cellUpdate = (index: number) => {
        if (!socketRef.current || !matchIdRef.current) return;
        if (status !== 'playing' || mySymbol !== currentPlayer || board[index] !== null) return;
        socketRef.current.sendMatchState(matchIdRef.current, OPCODES.MOVE, JSON.stringify({ position: index }));
    };

    const rematch = () => {
        if (!socketRef.current || !matchIdRef.current) return;

        socketRef.current.sendMatchState(
            matchIdRef.current,
            3, // REMATCH opcode
            JSON.stringify({})
        );

        setWinCells([]);
        setStrikeAnim(false);
        setStrikeKey(null);
        setWinner(null);
    };

    const newMatch = async () => {
        setMatchId(null);
        setBoard(Array(9).fill(null));
        setStatus('waiting');
        setWinner(null);
        setMySymbol(null);
        setCurrentPlayer(null);
        setStrikeAnim(false);
        setWinCells([]);

        if (!socketRef.current) return;

        setSearching(true);

        await socketRef.current.addMatchmaker("*", 2, 2);
    };

    useEffect(() => {
        const init = async () => {
            const client = new Client("defaultkey", import.meta.env.VITE_NAKAMA_HOST, import.meta.env.VITE_NAKAMA_PORT, import.meta.env.VITE_USE_SSL === "true");
            const session = await client.authenticateDevice(crypto.randomUUID());
            myUserIdRef.current = session.user_id ?? null;
            loseAudioRef.current = new Audio("/sounds/faahhhh.mp3");
            const socket = client.createSocket(import.meta.env.VITE_USE_SSL === "true");
            await socket.connect(session, import.meta.env.VITE_USE_SSL === "true");
            socketRef.current = socket;
            setupSocketListeners(socket);
        };
        init();
    }, []);

    const strikeCoords = strikeKey ? STRIKE_COORDS[strikeKey] : null;
    const winnerColor = winner === 'X' ? '#00d4ff' : '#d400ff';

    return (
        <>
            <style>{css}</style>
            <div className="ttt-root">
                <h1 className="ttt-title">Tic Tac Toe</h1>

                <div className="ttt-scores">
                    <div className="score-box">
                        <div className="score-label">X</div>
                        <div className="score-x">{scores.X}</div>
                    </div>
                    <div className="score-box">
                        <div className="score-label">Draw</div>
                        <div className="score-d">{scores.D}</div>
                    </div>
                    <div className="score-box">
                        <div className="score-label">O</div>
                        <div className="score-o">{scores.O}</div>
                    </div>
                </div>

                <div className={getStatusClass()}>{getStatusText()}</div>

                {mySymbol && (
                    <div className="ttt-info">
                        <span className={`info-pill ${mySymbol.toLowerCase()}`}>You: {mySymbol}</span>
                        <span className={`info-pill ${currentPlayer?.toLowerCase() ?? ''}`}>Turn: {currentPlayer ?? '...'}</span>
                    </div>
                )}

                <div className="ttt-board-wrap">
                    <div className="ttt-board">
                        {board.map((cell, i) => {
                            const isClickable = status === 'playing' && mySymbol === currentPlayer && cell === null;
                            const isWin = winCells.includes(i);
                            return (
                                <div
                                    key={i}
                                    className={`ttt-cell${isClickable ? ' clickable' : ''}${isWin ? ' win-cell' : ''}`}
                                    onClick={() => cellUpdate(i)}
                                >
                                    {cell && (
                                        <span className={cell === 'X' ? 'mark-x' : 'mark-o'}>
                                            {cell}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <svg className="strike-svg" viewBox="0 0 270 270">
                        {strikeCoords && (
                            <line
                                className={`strike-line ${winner?.toLowerCase()}-line${strikeAnim ? ' animate' : ''}`}
                                x1={strikeCoords[0]} y1={strikeCoords[1]}
                                x2={strikeCoords[2]} y2={strikeCoords[3]}
                                style={{ filter: `drop-shadow(0 0 6px ${winnerColor})` }}
                            />
                        )}
                    </svg>
                </div>

                {!matchId && (
                    <button
                        className={`ttt-btn${searching ? ' searching' : ''}`}
                        onClick={findMatch}
                        disabled={searching}
                    >
                        {searching ? 'Searching...' : 'Find Match'}
                    </button>
                )}

                {status === 'finished' && (
                    <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                        <button className="ttt-btn" onClick={rematch}>
                            Rematch
                        </button>
                        <button className="ttt-btn" onClick={newMatch}>
                            New Match
                        </button>
                    </div>
                )}

                {matchId && <div className="ttt-match-id">Match: {matchId}</div>}
            </div>
        </>
    );
};

export default App;