import { GameState } from "./type";


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
