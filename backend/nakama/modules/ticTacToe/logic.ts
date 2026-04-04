import { BoardValue, Player } from "./type";



export const findWinner = (board: BoardValue[]): Player | null => {
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