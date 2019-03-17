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
// 


function drawCard(x, y, cardContent, cardColor, textColor) {
  return () => {
    let paper = window.paper;
    var cardCorner = new paper.Point(x, y);
      
    var card = new paper.Path.Rectangle(cardCorner, CARD_WIDTH, CARD_HEIGHT);
    card.fillColor = cardColor || CARD_DEFAULT_COLOR;
    card.strokeColor = 'black';
  
    var pointTextLocation = new paper.Point(5,20);
  
    var myText = new paper.PointText(cardCorner.add(pointTextLocation));
    myText.fillColor = textColor || CARD_DEFAULT_TEXT_COLOR;
    myText.wordwrap(cardContent, CARD_MAX_CONTENT_SIZE);
  };
}

// function render


class Game extends React.Component {
  constructor(props) {
    super(props);
    // this.pc = new PaperCards(PaperScope, window);
    let paper = PaperScope;
    paper.install(window);
    window.onload = function() {
      paper.setup('gameCanvas');
      // add text wrapping
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
        <button onClick={drawCard(200, 200, "hello")}>click</button>
      </div>
    )
  }
  componentDidMount() {
  }
}

export default Game;