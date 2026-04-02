export type GameState = {
    board: Array<"X" | "O" | null>;
    currentPlayer: "X" | "O" | null;
    players: {
        X: string | null;
        O: string | null;
    };
    status: "waiting" | "playing" | "finished";
    winner: "X" | "O" | "draw" | null;
};


export const createInitialGameState = (): GameState => ({
    // Game's initial state
    board: Array(9).fill(null),
    currentPlayer: null,
    players: {
        X: null,
        O: null
    },
    status: "waiting",
    winner: null
});
