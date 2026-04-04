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

export type Player = "X" | "O";

export type BoardValue = Player | null;


export type Presence = {
    userId: string;
}

export type MatchMessage = {
    opCode: number;
    data: string;
    sender: {
        userId: string;
    }
}

export type Dispatcher = {
    broadcastMessage: (opCode: number, data: string) => void;
};

