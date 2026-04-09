import { GameState } from "./type";


export const createInitialGameState = (): GameState => ({
    board: Array(9).fill(null),
    currentPlayer: null,
    players: {
        X: null,
        O: null
    },
    status: "waiting",
    winner: null
});
