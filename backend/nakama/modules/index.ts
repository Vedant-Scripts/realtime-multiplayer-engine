import {
    matchInit, matchJoinAttempt, matchJoin,
    matchLeave, matchLoop, matchTerminate, matchSignal
} from './ticTacToe/match';

function rpcCreateMatch(ctx: any, logger: any, nk: any, payload: string) {
    const matchId = nk.matchCreate('tic-tac-toe', {});
    return JSON.stringify({ matchId });
}

(globalThis as any).rpcCreateMatch = rpcCreateMatch;

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

    // Register the RPC so it appears in your API Explorer dropdown
    initializer.registerRpc('create_match_rpc', rpcCreateMatch);

    logger.info("Tic-Tac-Toe registered successfully.");
}

(globalThis as any).InitModule = InitModule;