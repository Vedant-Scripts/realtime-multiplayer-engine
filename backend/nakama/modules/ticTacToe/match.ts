import { createInitialGameState, GameState } from './state';
import { findWinner } from './logic';

export const OPCODES = {
    MOVE: 1,
    STATE_UPDATE: 2,
    ERROR: 3,
    GAME_START: 4,
};

const matchInit = () => {
    const state = createInitialGameState();

    return { state };
};

const matchJoin = (state: GameState, presences, dispatcher) => {
    let gameStarted = false;
    for (const p of presences) {
        if (!state.players.X) {
            state.players.X = p.userId;
        } else if (!state.players.O) {
            state.players.O = p.userId
        } else {
            // reject others
        }

        if (state.players.X && state.players.O && state.status !== "playing") {
            state.status = 'playing';
            state.currentPlayer = 'X';
            gameStarted = true;
            break;
        }
    }

    if (gameStarted) {
        dispatcher.broadcastMessage(
            OPCODES.STATE_UPDATE,
            JSON.stringify(state)
        );
    }

    return { state };
};



const matchLoop = (state: GameState, messages, dispatcher) => {
    let stateChanged = false;

    for (const msg of messages) {
        if (msg.opCode !== OPCODES.MOVE) continue;

        let data;
        try {
            data = JSON.parse(msg.data);
        } catch {
            continue;
        }

        const userId = msg.sender.userId;

        const playerSymbol =
            state.players.X === userId ? 'X' :
                state.players.O === userId ? 'O' :
                    null;

        if (!playerSymbol) continue;

        if (state.currentPlayer !== playerSymbol) continue;

        const pos = data.position;

        if (pos < 0 || pos > 8) continue;
        if (state.board[pos] !== null) continue;

        state.board[pos] = playerSymbol;
        stateChanged = true;

        const winner = findWinner(state.board);

        if (winner) {
            state.status = "finished";
            state.winner = winner
        } else if (!state.board.includes(null)) {
            state.status = "finished";
            state.winner = 'draw'
        } else {
            state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
        }


    }

    if (stateChanged) {
        dispatcher.broadcastMessage(
            OPCODES.STATE_UPDATE,
            JSON.stringify(state)
        );
    }
    return { state };
}


const matchLeave = (state: GameState, presences, dispatcher) => {
    if (state.status === "finished") return { state };
    if (state.status !== "playing") return { state };

    let stateChanged = false;
    for (const p of presences) {
        // if (state.status)
        const userId = p.userId;
        if (state.players.X === userId) {
            state.status = 'finished';
            state.winner = 'O';
            stateChanged = true;
            break;
        } else if (state.players.O === userId) {
            state.status = 'finished';
            state.winner = 'X';
            stateChanged = true;
            break;
        }
    }

    if (stateChanged) {
        dispatcher.broadcastMessage(
            OPCODES.STATE_UPDATE,
            JSON.stringify(state)
        );
    }

    return { state };
}
