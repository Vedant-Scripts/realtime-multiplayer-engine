import {
    matchInit, matchJoinAttempt, matchJoin,
    matchLeave, matchLoop, matchTerminate, matchSignal
} from './ticTacToe/match';

function rpcCreateMatch(ctx: any, logger: any, nk: any, payload: string) {
    const matchId = nk.matchCreate('tic-tac-toe', {});
    return JSON.stringify({ matchId });
}

(globalThis as any).rpcCreateMatch = rpcCreateMatch;


function matchmakerMatched(ctx: any, logger: any, nk: any, entries: any) {

    logger.info("Matchmaker matched players: " + JSON.stringify(entries));

    const matchId = nk.matchCreate("tic-tac-toe", {});

    logger.info("Match created via matchmaker: " + matchId);

    return {
        matchId
    };
}


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

    initializer.registerRpc('create_match_rpc', rpcCreateMatch);

    initializer.registerMatchmakerMatched(matchmakerMatched);

    logger.info("Tic-Tac-Toe module initialized successfully.");
}

(globalThis as any).InitModule = InitModule;