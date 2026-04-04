import { createInitialGameState } from './state';
import { findWinner } from './logic';

export const OPCODES = {
    MOVE: 1,
    STATE_UPDATE: 2,
    ERROR: 3,
    GAME_START: 4,
};

export function matchInit(ctx: any, logger: any, nk: any, params: any) {
    const state = createInitialGameState();
    return {
        state,
        tickRate: 1
    };
}

export function matchJoinAttempt(ctx: any, logger: any, nk: any, dispatcher: any, tick: number, state: any, presence: any, metadata: any) {
    return { state, accept: true };
}

export function matchJoin(ctx: any, logger: any, nk: any, dispatcher: any, tick: number, state: any, presences: any) {
    let gameStarted = false;
    for (const p of presences) {
        if (!state.players.X) {
            state.players.X = p.userId;
        } else if (!state.players.O) {
            state.players.O = p.userId;
        }

        if (state.players.X && state.players.O && state.status !== "playing") {
            state.status = 'playing';
            state.currentPlayer = 'X';
            gameStarted = true;
            break;
        }
    }

    if (gameStarted) {
        dispatcher.broadcastMessage(OPCODES.STATE_UPDATE, JSON.stringify(state));
    }

    return { state };
}

export function matchLoop(ctx: any, logger: any, nk: any, dispatcher: any, tick: number, state: any, messages: any) {
    let stateChanged = false;

    for (const msg of messages) {
        if (msg.opCode !== OPCODES.MOVE) continue;

        let data;
        try {
            data = JSON.parse(nk.binaryToString(msg.data));
        } catch {
            continue;
        }

        const userId = msg.sender.userId;
        const playerSymbol = state.players.X === userId ? 'X' : state.players.O === userId ? 'O' : null;

        if (!playerSymbol || state.currentPlayer !== playerSymbol) continue;

        const pos = data.position;
        if (pos < 0 || pos > 8 || state.board[pos] !== null) continue;

        state.board[pos] = playerSymbol;
        stateChanged = true;

        const winner = findWinner(state.board);
        if (winner) {
            state.status = "finished";
            state.winner = winner;
        } else if (!state.board.includes(null)) {
            state.status = "finished";
            state.winner = 'draw';
        } else {
            state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
        }
    }

    if (stateChanged) {
        dispatcher.broadcastMessage(OPCODES.STATE_UPDATE, JSON.stringify(state));
    }
    return { state };
}

export function matchLeave(ctx: any, logger: any, nk: any, dispatcher: any, tick: number, state: any, presences: any) {
    if (state.status === "finished" || state.status !== "playing") return { state };

    let stateChanged = false;
    for (const p of presences) {
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
        dispatcher.broadcastMessage(OPCODES.STATE_UPDATE, JSON.stringify(state));
    }

    return { state };
}

export function matchTerminate(ctx: any, logger: any, nk: any, dispatcher: any, tick: number, state: any, graceSeconds: number) {
    return { state };
}

export function matchSignal(ctx: any, logger: any, nk: any, dispatcher: any, tick: number, state: any, data: string) {
    return { state, data };
}