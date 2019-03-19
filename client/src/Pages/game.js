import React from 'react';
import PaperScope from 'paper';
import blackDeck from './blackDeck';
import whiteDeck from './whiteDeck';

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
// test event
let waitingState = {
  phase: "waiting",
  public: {
    blackCard: "Put your funni Joke here: _____",
    cardCsar: "You",
    setting: {winningScore: 5},
    players: [{username:"Jimbo", score: 1},
              {username:"Craig", score: 2},
              {username:"Mike", score: 3},
              {username:"Dungus", score: 4},
              {username:"Bongo", score: 1},
              {username:"Current Csar Man", score: 2},
              {username:"Yo Moma", score: 3},
              {username:"You", score: 4}],
    whiteCards: [],
    winner: ""
  },
  private: {
    cards: ["Peen", "BIG Peen", "CHUNGUS Peen", "I'm in love with my cosplay girlfriend. She's a manchild and better than you.", "Eating Out at Denny's", "Mispelling Words", "Funni Scream"],
    username: "You",
    socketId: "78iurf3"
}};
let pickingState = {
  phase: "picking",
  public: {
    blackCard: "Put your funni Joke here: _____",
    cardCsar: "Current Csar Man",
    setting: {winningScore: 5},
    players: [{username:"Jimbo", score: 1},
              {username:"Craig", score: 2},
              {username:"Mike", score: 3},
              {username:"Dungus", score: 4},
              {username:"Bongo", score: 1},
              {username:"Current Csar Man", score: 2},
              {username:"Yo Moma", score: 3},
              {username:"You", score: 4}],
    whiteCards: [],
    winner: ""
  },
  private: {
    cards: ["Peen", "BIG Peen", "CHUNGUS Peen", "I'm in love with my cosplay girlfriend. She's a manchild and better than you.", "Eating Out at Denny's", "Mispelling Words", "Funni Scream"],
    username: "You",
    socketId: "78iurf3"
}};
let judgingState = {
  phase: "judging",
  public: {
    blackCard: "Put your funni Joke here: _____",
    cardCsar: "Current Csar Man",
    setting: {winningScore: 5},
    players: [{username:"Jimbo", score: 1},
              {username:"Craig", score: 2},
              {username:"Mike", score: 3},
              {username:"Dungus", score: 4},
              {username:"Bongo", score: 1},
              {username:"Current Csar Man", score: 2},
              {username:"Yo Moma", score: 3},
              {username:"You", score: 4}],
    whiteCards: ["Did you know? video games make your weenus big", "Smashing Pumpkins", "M&M is also a candy", "Lobotomy", "Afghanistan", "Grey's Anatomy", "Fortnite Skins", "Drake Like's Them Young"],
    winner: ""
  },
  private: {
    cards: ["Peen", "BIG Peen", "CHUNGUS Peen", "I'm in love with my cosplay girlfriend. She's a manchild and better than you.", "Eating Out at Denny's", "Mispelling Words", "Funni Scream"],
    username: "You",
    socketId: "78iurf3"
}};
let gameoverState = {
  phase: "game over",
  public: {
    blackCard: "Put your funni Joke here: _____",
    cardCsar: "Current Csar Man",
    setting: {winningScore: 5},
    players: [{username:"Jimbo", score: 1},
              {username:"Craig", score: 2},
              {username:"Mike", score: 3},
              {username:"Dungus", score: 4},
              {username:"Bongo", score: 1},
              {username:"Current Csar Man", score: 2},
              {username:"Yo Moma", score: 3},
              {username:"You", score: 4}],
    whiteCards: ["Did you know? video games make your weenus big", "Smashing Pumpkins", "M&M is also a candy", "Lobotomy", "Afghanistan", "Grey's Anatomy", "Fortnite Skins", "Drake Like's Them Young"],
    winner: "Jimbo"
  },
  private: {
    cards: ["Peen", "BIG Peen", "CHUNGUS Peen", "I'm in love with my cosplay girlfriend. She's a manchild and better than you.", "Eating Out at Denny's", "Mispelling Words", "Funni Scream"],
    username: "You",
    socketId: "78iurf3"
}};
let lobbyState = {phase: "lobby"};


function drawCard(x, y, cardContent, cardColor, textColor) {
  return () => {
    let paper = window.paper;
    var cardCorner = new paper.Point(x, y);
      
    var card = new paper.Path.Rectangle(cardCorner, CARD_WIDTH, CARD_HEIGHT);
    card.fillColor = cardColor || CARD_DEFAULT_COLOR;
    // TODO: set these at global vars
    card.strokeColor = 'black';
    card.shadowColor = 'black';
    card.shadowBlur = '12';
    card.shadowOffset = new paper.Point(5,5);
  
    var pointTextLocation = new paper.Point(5,20);
  
    var myText = new paper.PointText(cardCorner.add(pointTextLocation));
    myText.fillColor = textColor || CARD_DEFAULT_TEXT_COLOR;
    myText.wordwrap(cardContent, CARD_MAX_CONTENT_SIZE);
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

function drawCardRow(x, y, width, cards, cardColor, textColor) {
  return() => {
    let cellWidth = width / cards.length;
    let cardPaddingX = (cellWidth/2) - (CARD_WIDTH/2)
    var i;
    for (i = 0; i < cards.length; i++) {
      let curCard = cards[i];
      let curX = x + (i*cellWidth) + cardPaddingX
      drawCard(curX, y, curCard, cardColor, textColor).call();
    }
  }
}

function drawPlayerHUD(x, y, name, score, isCsar) {
  return () => {
      let paper = window.paper;
      // draw playHUD
      var playerHUDPoint = new paper.Point(x,y);
      var playerHUD = new paper.Path.Rectangle(playerHUDPoint,PLAYERHUD_WIDTH, PLAYERHUD_HEIGHT);
      playerHUD.fillColor = PLAYERHUD_FILL_COLOR;
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

function drawWinOverlay(isWinner) {
  return () => {
    let paper = window.paper;
    // draw win text
    var winText = new paper.PointText(300, paper.view.size.height/2 - 100)
    winText.content = isWinner?"NICE! YOU DA WINNA!":"YOU LOST LMAOOO000!"
    winText.fontSize = 80;

  };
}

function drawPlayerInfo(players, curPlayerName, curCardCsar) {
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
    // TODO
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
      if (player.username == curPlayerName) {
        player1 = player;
      } else {
        y+=1
        drawPlayerHUD(playerPoints[y].x, playerPoints[y].y, player.username, player.score, player.username == curCardCsar).call();
      }
    }
    drawPlayerHUD(playerPoints[0].x, playerPoints[0].y, player1.username, player1.score, player1.username == curCardCsar).call();
  }
}

function renderScreen(gameState) {
  return () => {
    let paper = window.paper;
    paper.project.clear();
    let maxWidth = paper.view.size.width;
    let maxHeight = paper.view.size.height;
    if (gameState.phase == 'picking' || gameState.phase == 'waiting' || gameState.phase == 'judging') {
      // draw table
      drawTable().call();
      // draw playerHUD
      drawPlayerInfo(gameState.public.players, gameState.private.username, gameState.public.cardCsar).call();
      // draw cards in hand
      let myHandWidth = maxWidth - (2*HAND_PADDING_X);
      let myHandHeight = maxHeight - CARD_HEIGHT;
      drawCardRow(HAND_PADDING_X,myHandHeight,myHandWidth,gameState.private.cards).call();
      // draw black card
      // TODO reposition black card to a permanent spot
      let blackCard_x = TABLE_PADDING_X + 30;
      let blackCard_y = TABLE_PADDING_Y + 30;
      drawCard(blackCard_x, blackCard_y, gameState.public.blackCard, 'black', 'white').call();
      if (gameState.phase == 'judging') {
        drawCardRow(0, maxHeight/2 - CARD_HEIGHT/2, maxWidth, gameState.public.whiteCards).call();
      }
    } else if (gameState.phase == "game over") {
      let isWinner = gameState.public.winner == gameState.private.username;
      // draw table
      drawTable().call();
      // draw win screen
      drawWinOverlay(isWinner).call();
    }
  };
}


class Game extends React.Component {
  constructor(props) {
    super(props);
    // this.pc = new PaperCards(PaperScope, window);
    let paper = PaperScope;
    paper.install(window);
    window.onload = function() {
      paper.setup('gameCanvas');
      // add text wrapping (I STOLE THIS FROM STACK EXCHANGE)
      // TODO: find where i stole this
      paper.PointText.prototype.wordwrap=function(txt,max){
        var lines=[];
        var space=-1;
        function cut(){
            for(var i=0;i<txt.length;i++){
                (txt[i]==' ')&&(space=i);
                if(i>=max){
                    (space==-1||txt[i]==' ')&&(space=i);
                    if(space>0){lines.push(txt.slice((txt[0]==' '?1:0),space));}
                    txt=txt.slice(txt[0]==' '?(space+1):space);
                    space=-1;
                    break;
                    }}check();}
        function check(){if(txt.length<=max){lines.push(txt[0]==' '?txt.slice(1):txt);txt='';}else if(txt.length){cut();}return;}
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
      }
  }

  render() {
    return(
      <div className="game">
        <canvas id="gameCanvas"></canvas>
        <button onClick={renderScreen(waitingState)}>waiting</button>
        <button onClick={renderScreen(pickingState)}>picking</button>
        <button onClick={renderScreen(judgingState)}>judging</button>
        <button onClick={renderScreen(gameoverState)}>game over</button>
        {/* <button onClick={renderScreen(lobbyState)}>lobby</button> */}
      </div>
    )
  }
  componentDidMount() {
  }
}

export default Game;