- Match Life Cycle
  - match triger can happen when onmultiplayer on multiplayer get matched up, and in inviting the other player accepts the match invite.
  - the starting state all the values can be null, status can be waiting.
    - ```ts
        type GameState = {
         board: Array<"X" | "O" | null>; // length = 9
         currentPlayer: "X" | "O" | null;
         players: {
            X: userId | null;
            O: userId | null;
         };
         status: "waiting" | "playing" | "finished";
         winner: "X" | "O" | "draw" | null;
         };
      ```
   - when the players join this value get updated with userIds
   - Also thinking of the total game time for 90 secs. there are 9 boxes so 9 turn and each turn with 10 seconds. The other can be each player has its own time. like total 90 seconds too each player. so if player rans out time the opponent wins.
   - when player A and player B joins, they will be assigned 'naught' and 'cross' respectively. their userid would also be updated on server.
   - status would change from initial status 'waiting' to 'playing' when the game start count down goes to zero from 5 or 3 to 1.
   -  when game starts its most about subsquent object would be sent to server and server would response with an object too 
      ```ts
      //client side move
         {
            "action": "move",
            "position": 4
         }

         // server broadcast 
         {
            "board": [...], // will we be storing the value in key value form in array, or just values in array [x, O, x ...] like this ??
            "currentPlayer": "O",
            "status": "playing",
            "winner": null
         }  
      ```
   -  when the game ends since the server would have broadcast winner, then in that case that ase Ui would respond which whever way we would have configured,
         - after that we can update scorecard in db as history too, or can just flush the scorecard if we dont want to track rivalry history
         - new game screen would come, can be multipler or invite player options to play with friend.
         - can be designed as we want.
   - When someone disconnects, the the status would changed to "disconnected or match abondened in result", based on that we display the results, question how would server would know the user has disconnected the client must keep sebding something to server right that user is connected if that value changes to null that means the client is disconnected.

- Message Type:
  1. Move ( client -> server)
   ```ts
      {
         "action": "move",
         "position": 4
      }
   ```
  2. state_update (server -> clients)
      ```ts
      {
         'type': 'state',
         'currentPlayer': "X",
         'board': ['x', null, 'o'],
         'status' 'playing',
         'winner': null
      }
      ```
  3. start_game (server -> clients)
      ```ts
         {
            'type': 'start',
            'players' : { 'X': userId, 'O': userId }
         }
      ```
  4. error  (server -> clients)
      ```ts
         {
            "type": "error",
            "message": "Invalid move"
         }
      ```

      ```ts
      // Life Cycles 
            matchInit() {
               const state = {
                  board: Array(9).fill(null),
                  players: { X: null, O: null },
                  currentPlayer: null,
                  status: 'waiting',
                  winner: null,
               }
               return { state };
            }
            matchJoin(state, presences) {
               for (const p of presences) {
                  if (!state.players.X) {
                     state.players.X = p.userId;
                  } else if (!state.players.O) {
                     state.players.O = p.userId;
                  } else {
                     // reject extra players
                  }
               }

               if (state.players.X && state.players.O) {
                  state.status = "playing";
                  state.currentPlayer = 'X'
               }

               return { state }
            }

            matchLoop (state, messages) {
               /*
               // step 1: 0 1 2
               // step 2: 3 4 5
               // step 3: 6 7 8  
               if( !state.currrentPlayer) return error; // will this line will come. i guess not since current player will always be present
               
               if(messages.action === 'move' && messages.position){
                  state.board[postion - 1] = state.currentPlayer;
                  if(state.board){// will the current player existence (0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6),(1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6)
                     state.status = 'finished',
                     state.winner = state.currentPlayer;
                     return { state };
                  }  
                  state.status = 'playing',
                  state.currentPlayer  = state.currentPlayer === 'X' ? 'O' : 'X'
                  return { state };
               } else if () {
                  // any other action idk then else if or switch case might come into
               }
            */

             for (const msg of messages) {
                     const data = JSON.parse(msg.data);
                     if (data.action === "move") {

                        // 1. Identify player
                        const userId = msg.sender.userId;

                        const playerSymbol =
                        state.players.X === userId ? "X" :
                        state.players.O === userId ? "O" :
                        null;

                        if (!playerSymbol) continue; // not part of game

                        // 2. Validate turn
                        if (state.currentPlayer !== playerSymbol) continue;

                        // 3. Validate position
                        const pos = data.position;

                        if (pos < 0 || pos > 8) continue;
                        if (state.board[pos] !== null) continue;

                        // 4. Apply move
                        state.board[pos] = playerSymbol;

                        // 5. Check winner (we’ll extract this later)
                        const winner = checkWinner(state.board);

                        if (winner) {
                        state.status = "finished";
                        state.winner = winner;
                        } else if (!state.board.includes(null)) {
                        state.status = "finished";
                        state.winner = "draw";
                        } else {
                        // 6. Switch turn
                        state.currentPlayer =
                           state.currentPlayer === "X" ? "O" : "X";
                        }
                     }
                  }

               return { state };
            }
            const winningPatterns = [
                                       [0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6] 
                                    ]
            checkWinner(board) {
               if(board.includes(null)) return false;
               // array loop
               // 1st loop 
               // [i] === playerSymbol  break
                 // []  === break
               //
               for (const p of winningPatterns) {
                    console.log(); 
               }
            }

      ```
