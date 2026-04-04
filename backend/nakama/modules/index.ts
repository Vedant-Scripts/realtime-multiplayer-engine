import {
    matchInit, matchJoinAttempt, matchJoin,
    matchLeave, matchLoop, matchTerminate, matchSignal
} from './ticTacToe/match';

function InitModule(ctx: any, logger: any, nk: any, initializer: any) {
    initializer.registerMatch('tic-tac-toe', {
        matchInit,
        matchJoinAttempt,
        matchJoin,
        matchLeave,
        matchLoop,
        matchTerminate,
        matchSignal,
    });
    logger.info("Tic-Tac-Toe registered successfully.");
}

(globalThis as any).InitModule = InitModule;