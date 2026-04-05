import { useState } from "react";

type Board = Array<'X' | 'O' | null>

const App = () => {
    // state of board

    const [board, setBoard] = useState<Board>(Array(9).fill(null));
    const cellUpdate = (index: number) => {
        setBoard(board.map((val, ind) => (index === ind ? 'X' : val)));
    }
    return (
        <div>
            <h1> Tic Tac Toe</h1>
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
                        {cell ?? index}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default App;