import { useState } from "react";

type Board = Array<'X' | 'O' | null>
type Player = "X" | "O";
type BoardValue = Player | null;

const App = () => {
    // state of board

    const [board, setBoard] = useState<Board>(Array(9).fill(null));
    const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
    const [status, setStatus] = useState<'playing' | 'finished'>('playing');

    const findWinner = (board: BoardValue[]): Player | null => {
        if (board.length !== 9) return null;
        const winningPatterns: Array<[number, number, number]> = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const [a, b, c] of winningPatterns) {
            if (board[a] &&
                board[a] === board[b] &&
                board[a] === board[c]
            ) {
                return board[a];
            }
        }
        return null;
    }

    const cellUpdate = (index: number) => {
        if (status !== 'playing') return;
        if (board[index] !== null) return;
        const newBoard = board.map((val, ind) =>
            ind === index ? currentPlayer : val
        );

        const winner = findWinner(newBoard)

        if (winner) setStatus('finished');

        setBoard(newBoard);

        if (!winner) {
            setCurrentPlayer(prev => prev === 'X' ? 'O' : 'X');
        }
    };

    return (
        <div>
            <h1> Tic Tac Toe</h1>
            <h2>Current Player: {currentPlayer}</h2>
            {status === "finished" && <h2>Game Over</h2>}
            <div style={{
                display: 'grid',
                gridTemplateColumns: "repeat(3, 50px)",
                gap: "5px"
            }} >
                {board.map((cell, index) => (
                    <div key={index}
                        style={{
                            width: "50px",
                            height: "50px",
                            border: "1px solid black",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                        onClick={() => cellUpdate(index)}
                    >
                        {cell ?? ""}
                    </div>
                ))}
            </div>
        </div>
    )
}


export default App;