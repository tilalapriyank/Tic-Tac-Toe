$(document).ready(function () {
  $(".box").hide();
  $("#nav").hide();
  $("#player").hide();
  $("#submit").hide();
  $(".roomId").hide();
  
  let currentPlayer = "X";
  let player1 = "";
  let player2 = "";
  let symbol1 = "X";
  let symbol2 = "O";
  
  const $btns = $(".btn");
  const $result = $(".result");
  const $resetBtn = $("#reset");
  
  let roomId = "";
  let rounds = 0;
  let winsPlayer1 = 0;
  let winsPlayer2 = 0;
  
  function generateRandomString(length) {
    const characters = "0123456789";
    let randomString = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
    return randomString;
  }
  $("#roomcreate").on("click", function () {
    $("#player").show();
    $("#submit").show();
    $(".roomId").show();
    roomId = generateRandomString(5);
    $("#roomId1").val(roomId);
    $("#roomcreate").hide();
  });
  
  function updateGameInfo(player1, player2, score1, score2, roomId) {
    $.post("ttt.php", {
      action: "updateGameInfo",
      player1: player1,
      player2: player2,
      score1: score1,
      score2: score2,
      room_id: roomId
    });
  }

  function insertGameRoom(roomId, player1, player2){
    $.post("ttt.php", {
      action: "insertGameRoom",
      roomCode: roomId,
      player1: player1,
      player2: player2
    });
  }
  
  function updateSeriesWinner(roomId, winner) {
    $.post("ttt.php", {
      action: "updateSeriesWinner",
      room_id: roomId,
      series_winner: winner
    });
  }
  
  
  $("#submit").on("click", function () {
    $(".box").show();
    $("#nav").show();
    $(".roomId").show();
    $("#player").hide();
    $("#submit").hide();
    insertGameRoom(roomId, player1, player2);
    $("#roomcreate").hide();
  });
  
  function updateTurnText() {
    if (player1 && player2) {
      $result.text(`Player ${currentPlayer === symbol1 ? player1 : player2} Turn`);
    }
  }
  
  function checkWinner() {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
  
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (
        $btns.eq(a).val() === currentPlayer &&
        $btns.eq(b).val() === currentPlayer &&
        $btns.eq(c).val() === currentPlayer
      ) {
        $btns.eq(a).addClass("winning-btn");
        $btns.eq(b).addClass("winning-btn");
        $btns.eq(c).addClass("winning-btn");
        return true;
      }
    }
  
    return false;
  }
  
  function checkDraw() {
    for (let i = 0; i < 9; i++) {
      if ($btns.eq(i).val() === "") {
        return false;
      }
    }
    return true;
  }
  
  function resetGame() {
    $btns.val("");
    currentPlayer = symbol1;
    updateTurnText();
  
    $('input[name="player1Symbol"][value="' + symbol1 + '"]').prop("checked", true);
    $('input[name="player2Symbol"][value="' + symbol2 + '"]').prop("disabled", true);
    $('input[name="player2Symbol"][value="' + symbol1 + '"]').prop("disabled", false);
  
    $btns.on("click", function () {
      if ($(this).val() === "") {
        $(this).val(currentPlayer);
        $(this).addClass(currentPlayer === symbol1 ? "player-x" : "player-o");
        if (checkWinner()) {
          if (currentPlayer === symbol1) {
            winsPlayer1++;
          } else {
            winsPlayer2++;
          }
          handleRoundEnd();
          return;
        } else if (checkDraw()) {
          $result.text("It's a draw!");
          resetGame();
        } else {
          currentPlayer = currentPlayer === symbol1 ? symbol2 : symbol1;
          updateTurnText();
        }
      }
    });
  }
  
  function handleRoundEnd() {
    rounds++;
  
    if (winsPlayer1 >= 2 || winsPlayer2 >= 2) {
    
      if (winsPlayer1 >= 2) {
        $result.text(`${player1} wins the series!`);
        $btns.off("click");
        updateGameInfo(player1, player2, winsPlayer1, winsPlayer2, roomId);
        updateSeriesWinner(roomId, player1);
      } else if (winsPlayer2 >= 2) {
        $result.text(`${player2} wins the series!`);
        $btns.off("click");
        updateGameInfo(player1, player2, winsPlayer1, winsPlayer2, roomId);
        updateSeriesWinner(roomId, player2);
      } else {
        $btns.removeClass("player-x player-o");
        $btns.removeClass("winning-btn");
        
        updateGameInfo(player1, player2, winsPlayer1, winsPlayer2, roomId);
        resetGame();
        $result.text(`Round ${rounds + 1}`);
      }
    } else {
      $btns.removeClass("player-x player-o");
      $btns.removeClass("winning-btn");
      
      updateGameInfo(player1, player2, winsPlayer1, winsPlayer2, roomId);
      resetGame();
      $result.text(`Round ${rounds + 1}`);
    }
  }
  
  // Start the first round
  $result.text(`Round ${rounds + 1}`);
  
  // Event listeners for player input
  $("#player1").change(function () {
    player1 = $(this).val();
    updateTurnText();
  });
  
  $("#player2").change(function () {
    player2 = $(this).val();
    updateTurnText();
  });
  
  $('input[name="player1Symbol"]').change(function () {
    symbol1 = $(this).val();
    updateSymbolChoices();
  });
  
  $('input[name="player2Symbol"]').change(function () {
    symbol2 = $(this).val();
    updateSymbolChoices();
  });
  
  function updateSymbolChoices() {
    $('input[name="player1Symbol"]').prop("disabled", false);
    $('input[name="player2Symbol"]').prop("disabled", false);
  
    if (symbol1 === "X") {
      $('input[name="player2Symbol"][value="X"]').prop("disabled", true);
    } else if (symbol1 === "O") {
      $('input[name="player2Symbol"][value="O"]').prop("disabled", true);
    }
  }
  
  // Event listener for clicking on cells
  $btns.on("click", function () {
    if ($(this).val() === "") {
      $(this).val(currentPlayer);
      $(this).addClass(currentPlayer === symbol1 ? "player-x" : "player-o");
      if (checkWinner()) {
        if (currentPlayer === symbol1) {
          winsPlayer1++;
        } else {
          winsPlayer2++;
        }
        handleRoundEnd();
      } else if (checkDraw()) {
        $result.text("It's a draw!");
        resetGame();
      } else {
        currentPlayer = currentPlayer === symbol1 ? symbol2 : symbol1;
        updateTurnText();
      }
    }
  });
  
  // Event listener for resetting the game
  $resetBtn.on("click", function () {
    $btns.removeClass("player-x player-o");
    $btns.removeClass("winning-btn");
    winsPlayer1 = 0;
    winsPlayer2 = 0;
    rounds = 0;
    handleRoundEnd();
  });
});