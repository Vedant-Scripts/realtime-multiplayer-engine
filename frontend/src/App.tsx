// import { useRef, useState, useEffect } from "react";
// import { Client, type Socket } from "@heroiclabs/nakama-js";

// type Board = Array<'X' | 'O' | null>;

// const App = () => {
//     const [matchId, setMatchId] = useState<string | null>(null);
//     const [inputMatchId, setInputMatchId] = useState('');
//     const [board, setBoard] = useState<Board>(Array(9).fill(null));
//     const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O' | null>(null);
//     const [status, setStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
//     const [mySymbol, setMySymbol] = useState<'X' | 'O' | null>(null);
//     const [winner, setWinner] = useState<string | null>(null);

//     const myUserIdRef = useRef<string | null>(null);
//     const initializedRef = useRef(false);
//     const socketRef = useRef<Socket | null>(null);
//     const matchIdRef = useRef<string | null>(null);

//     const setupMatchListener = (socket: Socket) => {
//         socket.onmatchdata = (matchState) => {
//             if (matchState.op_code === 2) {
//                 const decoder = new TextDecoder("utf-8");
//                 const data = JSON.parse(decoder.decode(matchState.data));

//                 setBoard(data.board);
//                 setCurrentPlayer(data.currentPlayer);
//                 setStatus(data.status);
//                 setWinner(data.winner ?? null);

//                 if (data.players.X === myUserIdRef.current) setMySymbol('X');
//                 else if (data.players.O === myUserIdRef.current) setMySymbol('O');
//             }
//         };
//     };

//     const createMatch = async () => {
//         if (!socketRef.current) return;
//         const result = await socketRef.current.rpc('create_match_rpc', '');
//         const { matchId: id } = JSON.parse(result.payload!);
//         matchIdRef.current = id;
//         setMatchId(id);
//         await socketRef.current.joinMatch(id);
//     };

//     const joinMatch = async () => {
//         if (!socketRef.current || !inputMatchId) return;
//         matchIdRef.current = inputMatchId;
//         setMatchId(inputMatchId);
//         await socketRef.current.joinMatch(inputMatchId);
//     };

//     const cellUpdate = (index: number) => {
//         if (board[index] !== null) return;
//         if (!socketRef.current || !matchIdRef.current) return;

//         if (status !== "playing") return;
//         if (mySymbol !== currentPlayer) return;
//         socketRef.current.sendMatchState(
//             matchIdRef.current,
//             1,
//             JSON.stringify({ position: index })
//         );
//     };

//     useEffect(() => {
//         if (initializedRef.current) return;
//         initializedRef.current = true;

//         const init = async () => {
//             const client = new Client("defaultkey", "127.0.0.1", "7350", false);
//             const session = await client.authenticateDevice("device-" + Math.random());
//             myUserIdRef.current = session.user_id ?? null;

//             const socket = client.createSocket();
//             await socket.connect(session, false);
//             socketRef.current = socket;
//             setupMatchListener(socket);

//             console.log("Socket connected");
//         };

//         init();
//     }, []);

//     const findMatch = async () => {
//         if (!socketRef.current) return;

//         await socketRef.current.addMatchmaker({
//             minCount: 2,
//             maxCount: 2,
//         });

//         console.log("Searching for match...");
//     };

//     // return (
//     //     <div>
//     //         <h1>Tic Tac Toe</h1>

//     //         <div>
//     //             <button onClick={createMatch}>Create Match</button>
//     //         </div>

//     //         <div>
//     //             <input
//     //                 value={inputMatchId}
//     //                 onChange={e => setInputMatchId(e.target.value)}
//     //                 placeholder="Paste match ID to join"
//     //             />
//     //             <button onClick={joinMatch}>Join Match</button>
//     //         </div>

//     //         {matchId && <p style={{ wordBreak: 'break-all' }}>Match ID: {matchId}</p>}

//     //         <h2>You are: {mySymbol ?? "waiting..."}</h2>
//     //         <h2>Current turn: {currentPlayer ?? "..."}</h2>
//     //         {status === "finished" && (
//     //             <h2>
//     //                 {winner === "draw"
//     //                     ? "Draw 🤝"
//     //                     : `${winner} wins 🎉`}
//     //             </h2>
//     //         )}

//     //         <div style={{
//     //             display: 'grid',
//     //             gridTemplateColumns: "repeat(3, 50px)",
//     //             gap: "5px",
//     //             marginTop: "20px"
//     //         }}>
//     //             {board.map((cell, index) => (
//     //                 <div
//     //                     key={index}
//     //                     style={{
//     //                         width: "50px",
//     //                         height: "50px",
//     //                         border: "1px solid black",
//     //                         display: "flex",
//     //                         justifyContent: "center",
//     //                         alignItems: "center",
//     //                         cursor: status === "playing" && mySymbol === currentPlayer ? "pointer" : "default"
//     //                     }}
//     //                     onClick={() => cellUpdate(index)}
//     //                 >
//     //                     {cell ?? ""}
//     //                 </div>
//     //             ))}
//     //         </div>
//     //     </div>
//     // );
//     return (
//         <div style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             justifyContent: "center",
//             height: "100vh",
//             fontFamily: "sans-serif",
//             background: "#0f172a",
//             color: "#fff"
//         }}>
//             <h1 style={{ marginBottom: "10px" }}>Tic Tac Toe</h1>

//             <p style={{ opacity: 0.7 }}>
//                 {status === "waiting" && "Waiting for opponent..."}
//                 {status === "playing" && `Your turn: ${mySymbol === currentPlayer ? "Yes" : "No"}`}
//                 {status === "finished" && "Game Over"}
//             </p>

//             <div style={{
//                 display: "grid",
//                 gridTemplateColumns: "repeat(3, 80px)",
//                 gap: "10px",
//                 marginTop: "20px"
//             }}>
//                 {board.map((cell, index) => (
//                     <div
//                         key={index}
//                         onClick={() => cellUpdate(index)}
//                         style={{
//                             width: "80px",
//                             height: "80px",
//                             background: "#1e293b",
//                             borderRadius: "10px",
//                             display: "flex",
//                             justifyContent: "center",
//                             alignItems: "center",
//                             fontSize: "28px",
//                             fontWeight: "bold",
//                             cursor:
//                                 status === "playing" &&
//                                     mySymbol === currentPlayer &&
//                                     cell === null
//                                     ? "pointer"
//                                     : "not-allowed",
//                             transition: "0.2s",
//                         }}
//                     >
//                         {cell}
//                     </div>
//                 ))}
//             </div>

//             <div style={{ marginTop: "20px" }}>
//                 <p>You are: <b>{mySymbol ?? "..."}</b></p>
//                 <p>Turn: <b>{currentPlayer ?? "..."}</b></p>
//             </div>

//             {status === "finished" && (
//                 <h2 style={{ marginTop: "10px" }}>
//                     {winner === "draw" ? "Draw 🤝" : `${winner} wins 🎉`}
//                 </h2>
//             )}
//         </div>
//     );
// };

// export default App;

import { useRef, useState, useEffect } from "react";
import { Client, type Socket } from "@heroiclabs/nakama-js";

type Board = Array<'X' | 'O' | null>;

const OPCODES = {
    MOVE: 1,
    STATE_UPDATE: 2,
};

const App = () => {
    const [matchId, setMatchId] = useState<string | null>(null);
    const [board, setBoard] = useState<Board>(Array(9).fill(null));
    const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O' | null>(null);
    const [status, setStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
    const [mySymbol, setMySymbol] = useState<'X' | 'O' | null>(null);
    const [winner, setWinner] = useState<string | null>(null);
    const [searching, setSearching] = useState(false);

    const myUserIdRef = useRef<string | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const matchIdRef = useRef<string | null>(null);

    const setupSocketListeners = (socket: Socket) => {

        // 🔥 MATCH DATA (GAME STATE)
        socket.onmatchdata = (matchState) => {
            if (matchState.op_code !== OPCODES.STATE_UPDATE) return;

            const decoder = new TextDecoder("utf-8");
            const data = JSON.parse(decoder.decode(matchState.data));

            setBoard(data.board);
            setCurrentPlayer(data.currentPlayer);
            setStatus(data.status);
            setWinner(data.winner ?? null);

            if (data.players.X === myUserIdRef.current) setMySymbol('X');
            else if (data.players.O === myUserIdRef.current) setMySymbol('O');
        };

        // 🔥 MATCHMAKER FOUND MATCH
        socket.onmatchmakermatched = async (matched) => {
            setSearching(false);

            const res = await socket.joinMatch(undefined, matched.token);

            matchIdRef.current = res.match_id;
            setMatchId(res.match_id);

            console.log("Joined match:", res.match_id);
        };
    };

    const findMatch = async () => {
        if (!socketRef.current) return;

        setSearching(true);

        await socketRef.current.addMatchmaker(
            "+mode:tic-tac-toe",
            2,
            2
        );

        console.log("Searching for match...");
    };
    const cellUpdate = (index: number) => {
        if (!socketRef.current || !matchIdRef.current) return;

        // ❌ prevent invalid moves
        if (status !== "playing") return;
        if (mySymbol !== currentPlayer) return;
        if (board[index] !== null) return;

        socketRef.current.sendMatchState(
            matchIdRef.current,
            OPCODES.MOVE,
            JSON.stringify({ position: index })
        );
    };

    useEffect(() => {
        const init = async () => {
            const client = new Client("defaultkey", "127.0.0.1", "7350", false);

            const session = await client.authenticateDevice(
                crypto.randomUUID()
            );
            myUserIdRef.current = session.user_id ?? null;

            const socket = client.createSocket();
            await socket.connect(session, false);

            socketRef.current = socket;
            setupSocketListeners(socket);

            console.log("Socket connected");
        };

        init();
    }, []);

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            fontFamily: "sans-serif",
            background: "#0f172a",
            color: "#fff"
        }}>
            <h1>Tic Tac Toe</h1>

            {/* 🔥 MATCHMAKING BUTTON */}
            {!matchId && (
                <button
                    onClick={findMatch}
                    disabled={searching}
                    style={{
                        marginTop: "10px",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#3b82f6",
                        color: "#fff",
                        cursor: "pointer"
                    }}
                >
                    {searching ? "Searching..." : "Find Match"}
                </button>
            )}

            {/* 🔥 STATUS */}
            <p style={{ marginTop: "10px", opacity: 0.8 }}>
                {status === "waiting" && "Waiting for opponent..."}
                {status === "playing" && (
                    mySymbol === currentPlayer ? "Your Turn" : "Opponent's Turn"
                )}
                {status === "finished" && "Game Over"}
            </p>

            {/* 🔥 BOARD */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 80px)",
                gap: "10px",
                marginTop: "20px"
            }}>
                {board.map((cell, index) => (
                    <div
                        key={index}
                        onClick={() => cellUpdate(index)}
                        style={{
                            width: "80px",
                            height: "80px",
                            background: "#1e293b",
                            borderRadius: "10px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "28px",
                            fontWeight: "bold",
                            cursor:
                                status === "playing" &&
                                    mySymbol === currentPlayer &&
                                    cell === null
                                    ? "pointer"
                                    : "not-allowed"
                        }}
                    >
                        {cell ?? ""}
                    </div>
                ))}
            </div>

            {/* 🔥 INFO */}
            <div style={{ marginTop: "20px" }}>
                <p>You: <b>{mySymbol ?? "..."}</b></p>
                <p>Turn: <b>{currentPlayer ?? "..."}</b></p>
            </div>

            {/* 🔥 RESULT */}
            {status === "finished" && (
                <h2 style={{ marginTop: "10px" }}>
                    {winner === "draw"
                        ? "Draw 🤝"
                        : `${winner} wins 🎉`}
                </h2>
            )}
        </div>
    );
};

export default App;