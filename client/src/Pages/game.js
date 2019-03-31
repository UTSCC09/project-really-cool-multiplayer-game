import React from 'react';
import PaperScope from 'paper';

// Table Constants
const TABLE_PADDING_X = 200;
const TABLE_PADDING_Y = 100;
const TABLE_PLAYER_SPACE = 300;
const TABLE_FILL_COLOR = '#fff3e6';
const TABLE_STROKE_COLOR = 'ffdab3';
// Card Constants
const CARD_WIDTH = 150;
const CARD_HEIGHT = 175;
const CARD_DEFAULT_COLOR = '#e9e9ff'
const CARD_DEFAULT_TEXT_COLOR = 'black'
const CARD_MAX_CONTENT_SIZE = 25;
// Hand Constants
const HAND_PADDING_X = 200;
// PlayerHUD Constants
const PLAYERHUD_WIDTH = 150;
const PLAYERHUD_HEIGHT = 100;
const PLAYERHUD_FILL_COLOR = '#f2f2f2';
const PLAYERHUD_STROKE_COLOR = 'black';
// temporary variables
var curChosenCard = null;
var lobby;
var curGameState = null;


function drawCard(x, y, card, cardColor, textColor, emit, isSelectable) {
  return () => {
    let paper = window.paper;
    var cardCorner = new paper.Point(x, y);
      
    var cardRect = new paper.Path.Rectangle(cardCorner, CARD_WIDTH, CARD_HEIGHT);
    cardRect.fillColor = cardColor || CARD_DEFAULT_COLOR;
    // TODO: set these at global vars
    cardRect.strokeColor = 'black';
    cardRect.shadowColor = 'black';
    cardRect.shadowBlur = '12';
    cardRect.shadowOffset = new paper.Point(5,5);
    
    if (isSelectable) {
      cardRect.onMouseEnter = () => {
        if (curChosenCard === null) {
          cardRect.shadowColor = 'blue';
        }
      };
      cardRect.onMouseLeave = () => {
        if (curChosenCard === null) {
          cardRect.shadowColor = 'black';
        }
      }
    }
    var pointTextLocation = cardCorner.add(new paper.Point(5,20));
    
    var myText = new paper.PointText(pointTextLocation);
    myText.fillColor = textColor || CARD_DEFAULT_TEXT_COLOR;
    myText.wordwrap(card.content, CARD_MAX_CONTENT_SIZE);
    
        if (emit) {
          cardRect.onMouseUp = () => {
            curChosenCard = {card: cardRect, text: myText};
            console.log(lobby, emit, card);
            lobby.emit(emit, card);
          };
        }
      
  };
}

function drawTable(){
  return () => {
    let paper = window.paper;
    let TLCorner = new paper.Point(TABLE_PADDING_X, TABLE_PADDING_Y)
    let BRCorner = new paper.Point(
        (paper.view.size.width)-TABLE_PADDING_X, 
        (paper.view.size.height)-TABLE_PLAYER_SPACE)
        let table = new paper.Path.Rectangle(TLCorner, BRCorner);
    table.fillColor = TABLE_FILL_COLOR;
    table.strokeColor = TABLE_STROKE_COLOR;
    table.sendToBack();
  }
}

function drawCardRow(x, y, width, cards, cardColor, textColor, emit, isSelectable) {
  return() => {
    let cellWidth = width / cards.length;
    let cardPaddingX = (cellWidth/2) - (CARD_WIDTH/2)
    var i;
    for (i = 0; i < cards.length; i++) {
      let curCard = cards[i];
      let curX = x + (i*cellWidth) + cardPaddingX
      drawCard(curX, y, curCard, cardColor, textColor, emit, isSelectable).call();
    }
  }
}

function drawPlayerHUD(x, y, name, score, isCsar, HUDColor) {
  return () => {
      let paper = window.paper;
      // draw playHUD
      var playerHUDPoint = new paper.Point(x,y);
      var playerHUD = new paper.Path.Rectangle(playerHUDPoint,PLAYERHUD_WIDTH, PLAYERHUD_HEIGHT);
      playerHUD.fillColor = HUDColor?HUDColor:PLAYERHUD_FILL_COLOR;
      playerHUD.strokeColor = PLAYERHUD_STROKE_COLOR;
      // draw play names
      var playerNameText = new paper.PointText(playerHUDPoint.add(10,20));
      playerNameText.content = name;
      var scoreText = new paper.PointText(playerNameText.point.add(0,20));
      scoreText.content = "score: "+score;
      var isCsarText = new paper.PointText(scoreText.point.add(0,20));
      if(isCsar) {
          isCsarText.content = 'Current Csar';
          isCsarText.fillColor = "blue";
    };
  }
}

function drawWinOverlay(isWinner, winner, players, curPlayerSocket) {
  return () => {
    let paper = window.paper;
    // draw win text
    var winText = new paper.PointText(300, paper.view.size.height/2 - 100)
    winText.content = isWinner?"congratulations! You Win!":"You Lost..."
    winText.fontSize = 50;

    let back_x = 300;
    let back_y = paper.view.size.height/2;

    var backText = new paper.PointText(back_x+25, back_y+25)
    backText.content = "Back to Home Screen";
    backText.fontSize = 20;

    var backBox = new paper.Path.Rectangle(back_x, back_y, 250, 50);
    backBox.strokeColor = "black";
    backBox.fillColor = new paper.Color(0.5, 0.1);
    backBox.onMouseUp = () => {
      window.location.href = '/';
    };
    
    drawPlayerInfo(players, curPlayerSocket, null, winner).call();
  };
}

function drawPlayerInfo(players, curPlayerSocket, curCardCsar, winner) {
  return() => {
    let paper = window.paper;
    let maxWidth = paper.view.size.width;
    let maxHeight = paper.view.size.height;
    let tableHeight = maxHeight - TABLE_PLAYER_SPACE - TABLE_PADDING_Y;
    let tableWidth = maxWidth - 2*TABLE_PADDING_X;
    let player37_y = TABLE_PADDING_Y + (tableHeight/4) - (PLAYERHUD_HEIGHT/2);
    let player23_x = 0;
    let player28_y = TABLE_PADDING_Y + (tableHeight*3/4) - (PLAYERHUD_HEIGHT/2);
    let player78_x = maxWidth - PLAYERHUD_WIDTH;
    let player4_x = TABLE_PADDING_X + (tableWidth/4) - (PLAYERHUD_WIDTH/2);
    let player4_y = 0;
    let player5_x = TABLE_PADDING_X + (tableWidth/2) - (PLAYERHUD_WIDTH/2);
    let player5_y = 0;
    let player6_x = TABLE_PADDING_X + (tableWidth*3/4) - (PLAYERHUD_WIDTH/2);
    let player6_y = 0;
    let player1_x = maxWidth - HAND_PADDING_X/2 - PLAYERHUD_WIDTH/2;
    let player1_y = maxHeight - PLAYERHUD_HEIGHT;
    let playerPoints = [
      {x: player1_x, y: player1_y},
      {x: player23_x, y: player28_y},
      {x: player23_x, y: player37_y},
      {x: player4_x, y: player4_y},
      {x: player5_x, y: player5_y},
      {x: player6_x, y: player6_y},
      {x: player78_x, y: player37_y},
      {x: player78_x, y: player28_y}]
    var i;
    let y = 0;
    let player1 = null;
    for (i=0; i < players.length; i++) {
      let player = players[i];
      if (player.socketId === curPlayerSocket) {
        player1 = player;
      } else {
        y+=1
        drawPlayerHUD(playerPoints[y].x, playerPoints[y].y, player.username, player.score, player.socketId === curCardCsar, player.socketId === winner?"green":null).call();
      }
    }
    drawPlayerHUD(playerPoints[0].x, playerPoints[0].y, player1.username, player1.score, player1.socketId === curCardCsar, player1.socketId === winner?"green":null).call();
  }
}

function drawPlayerPrompt(prompt) {
  return () => {
    let paper = window.paper;
    let maxHeight = paper.view.size.height;
    let prompt_point_y = maxHeight - TABLE_PLAYER_SPACE + (TABLE_PLAYER_SPACE - CARD_HEIGHT)/2
    let prompt_point_x = HAND_PADDING_X;
    var promptText = new paper.PointText(prompt_point_x, prompt_point_y)
    promptText.content = prompt;
    promptText.fillColor = 'green';
  };
}

function renderScreen(gameState) {
  return () => {
    // update curGameState
    curGameState = gameState;
    let paper = window.paper;
    // clear the canvas
    paper.project.clear();
    // reset curChosenCard
    curChosenCard = null;

    let maxWidth = paper.view.size.width;
    let maxHeight = paper.view.size.height;
    let isPicking = gameState.phase==='picking';
    let isWaiting = gameState.phase === 'waiting';
    let isJudging = gameState.phase === 'judging';
    if (isPicking || isWaiting || isJudging) {
      // draw table
      drawTable().call();
      // draw playerHUD
      drawPlayerInfo(gameState.public.players, gameState.private.socketId, gameState.public.cardCsar).call();
      // draw cards in hand
      let myHandWidth = maxWidth - (2*HAND_PADDING_X);
      let myHandHeight = maxHeight - CARD_HEIGHT;
      drawCardRow(HAND_PADDING_X,myHandHeight,myHandWidth,gameState.private.cards, null, null, isPicking?'white card submit':'', isPicking?true:false).call();
      // draw black card
      // TODO reposition black card to a permanent spot
      let tableWidth = maxWidth - 2*TABLE_PADDING_X;
      let tableHeight = maxHeight - TABLE_PADDING_Y - TABLE_PLAYER_SPACE;
      let blackCard_x = TABLE_PADDING_X + tableWidth/3;
      let blackCard_y = TABLE_PADDING_Y + tableHeight/2 - CARD_HEIGHT/2;
      drawCard(blackCard_x, blackCard_y, {content: gameState.public.blackCard}, 'black', 'white').call();
      // draw public white cards
      drawCardRow(0, maxHeight/2 - CARD_HEIGHT/2, maxWidth, gameState.public.whiteCards, null, null, isJudging?'card selected':'waiting', isJudging?true:false).call();
      // draw user prompt
      let prompt;
      switch(gameState.phase) {
        case 'picking':
          prompt = 'Please Pick a Card From Your Hand.';
          break;
        case 'waiting':
          prompt = 'Please Wait...';
          break;
        case 'judging':
          prompt = 'Pick a Card! Any Card!';
          break;
      }
      drawPlayerPrompt(prompt).call();
    } else if (gameState.phase === "game over") {
      let isWinner = gameState.public.winner === gameState.private.socketId;
      // draw win screen
      drawWinOverlay(isWinner, gameState.public.winner, gameState.public.players, gameState.private.socketId).call();
    }
  };
}

function redrawState() {
  return () => {
    if (curGameState) {
      renderScreen(curGameState).call();
    }
  }
}


class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {socketId: this.props.socketId};
    lobby = this.props.lobby;
    // this.pc = new PaperCards(PaperScope, window);
    let paper = PaperScope;
    paper.install(window);
      console.log(document.getElementById('gameCanvas'));
      paper.setup('gameCanvas');
      // add text wrappinig (I STOLE THIS FROM STACK EXCHANGE)
      // TODO: find wherei i stole this
      paper.PointText.prototype.wordwrap=function(txt,max){
        var lines=[];
        var space=-1;
        function cut(){
            for(var i=0;i<txt.length;i++){
                (txt[i]===' ')&&(space=i);
                if(i>=max){
                    (space===-1||txt[i]===' ')&&(space=i);
                    if(space>0){lines.push(txt.slice((txt[0]===' '?1:0),space));}
                    txt=txt.slice(txt[0]===' '?(space+1):space);
                    space=-1;
                    break;
                    }}check();}
        function check(){if(txt.length<=max){lines.push(txt[0]===' '?txt.slice(1):txt);txt='';}else if(txt.length){cut();}return;}
        check();
        return this.content=lines.join('\n');
      }
      // draw table
      let TLCorner = new paper.Point(TABLE_PADDING_X, TABLE_PADDING_Y)
      let BRCorner = new paper.Point(
          (paper.view.size.width)-TABLE_PADDING_X, 
          (paper.view.size.height)-TABLE_PLAYER_SPACE)
          let table = new paper.Path.Rectangle(TLCorner, BRCorner);
      table.fillColor = TABLE_FILL_COLOR;
      table.strokeColor = TABLE_STROKE_COLOR;
      table.sendToBack();
      lobby.on('black card', (gameState) => {
        console.log("Got the black card");
        console.log(gameState);
        this.phase = gameState.public.cardCsar === this.state.socketId ? 'waiting' : 'picking';
        gameState.phase = this.phase;
        renderScreen(gameState).call();
      });
      lobby.on('reveal white cards', (gameState) => {
        console.log("reveal the white cards");
        console.log(gameState);
        this.phase = gameState.public.cardCsar === this.state.socketId ? 'judging' : 'waiting';
        gameState.phase = this.phase;
        renderScreen(gameState).call();
      });
      lobby.on('game state update', (gameState) => {
        gameState.phase = this.phase;
        renderScreen(gameState).call();
      });
      lobby.on('game over', (gameState) => {
        console.log("Game has ended");
        console.log(gameState);
        gameState.phase = 'game over';
        renderScreen(gameState).call();
      });
  }

  render() {
    return(
      <div className="game">
      </div>
    )
  }

  componentDidMount() {
    window.addEventListener("resize", redrawState.call());
  }

  componentWillUnmount() {
    curGameState = null;
    window.removeEventListener("resize", redrawState.call());
  }

}

export default Game;