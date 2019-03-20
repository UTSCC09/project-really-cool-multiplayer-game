import React from 'react';
import Game from './game';
import io from 'socket.io-client';

class Lobby extends React.Component {
  constructor(props) {
    super(props);
    this.joinGame = this.joinGame.bind(this);
    this.state = {otherPlayers: [], roomOwner: false, phase: 'lobby'};
    this.state.lobbyState = window.localStorage.getItem('nickname') ? 'lobby' : 'no nickname';
    this.startGame = this.startGame.bind(this);
    // this.selectWhiteCard = this.selectWhiteCard.bind(this);
    // this.selectWinner = this.selectWinner.bind(this);
    let params = new URLSearchParams(window.location.search);
    let roomId = params.get('id');

    // TODO: read this from some config file so when we deploy on heroku we don't have to change it each time
    this.lobby = io.connect(process.env.URL?process.env.URL+roomId:`http://localhost:5000/${roomId}`);
    this.lobby.on('room full', () => {
      // TODO: room is full
    });
    this.lobby.on('player list', (players) => {
      console.log("list of players")
      console.log(players)
      if (players.length === 0) {
        // first to join
        this.setState({roomOwner: true});
      } else {
        this.setState({otherPlayers: players});
      }
    });
    this.lobby.on('player joined', (username) => {
      console.log("player joined your channel")
      console.log(username)
      let otherPlayers = this.state.otherPlayers;
      otherPlayers.push(username);
      this.setState({otherPlayers: otherPlayers});
    });
    this.lobby.on('start game', (gameState) => {
      // this.setState({gameStarted: true});
      this.setState({lobbyState: "game started"});
      console.log(`start game, initial cards: ${gameState.private.cards}`)
      // this.setState({gameState: gameState});
      // this.lobby.on('black card', (gameState) => {
      //   let phase = gameState.public.cardCsar === this.state.username ? 'waiting' : 'picking'
      //   this.setState({gameState: gameState, phase: phase});
      // });
      // this.lobby.on('reveal white cards', (gameState) => {
      //   let phase = gameState.public.cardCsar === this.state.username ? 'judging' : 'waiting'
      //   this.setState({gameState:  gameState, phase: phase});
      // });
      // this.lobby.on('game over', (gameState) => {
      //   this.setState({gameState: gameState, phase: 'game over'});
      // });
    });
    // TODO: Give a default username on connect if none
    let username = window.localStorage.getItem('nickname');
    if (username) {
      this.state.username = username;
      this.lobby.emit('join', username);
    }
  }

  startGame() {
    this.lobby.emit('start game');
  }

  joinGame() {
    let nickname = document.getElementById('nickname').value;
    nickname = nickname || Math.random().toString(36).slice(2);; //TODO real random name
    window.localStorage.setItem('nickname', nickname);
    this.setState({lobbyState: "lobby", username: nickname});
    this.lobby.emit('join', nickname);
  }

  // selectWhiteCard(card) {
  //   console.log(`${this.state.gameState.private.username} selects ${card}`);
  //   this.lobby.emit('white card submit', card);
  // }

  // selectWinner(card) {
  //   this.lobby.emit('card selected', card);
  // }

  render() {
    // TODO: change this display to be actually good
    let players = this.state.otherPlayers.map((username) => {
      return (
        <li>{username}</li>
      )
    });
    // let cards = [];
    // if (this.state.gameState.private.cards) {
    //   cards = this.state.gameState.private.cards.map((card) => {
    //     return (
    //       <Card onCardClick={this.selectWhiteCard} card={card}/>
    //       )
    //     });
    // }
    let game;
    let lobby;
    // if (this.state.gameStarted) {
    //   game = (<Game lobby={this.lobby} username={this.state.username}></Game>)
    // } else {
    //   lobby = (
    //     <div>
    //       <ul>PLAYERS: {players}</ul>
    //       {this.state.roomOwner &&
    //         <button onClick={this.startGame}>Start Game</button>
    //       }
    //     </div>
    //   )
    // }
    switch (this.state.lobbyState) {
      case "no nickname": lobby = (
        <div id="main-container" className="d-flex flex-column justify-content-center align-items-center p-2">
          <h1> Shuffle With Friends </h1>
          <span>
            Nickname:
            <input id="nickname" className="ml-2"></input>
          </span>
          If you don't choose one we'll make one for you
          <span>
            <button type="button" className="btn btn-primary m-3" onClick={this.joinGame}>Join Game</button>
          </span>
        </div>);
        break;

      case "lobby": lobby = (
          <div>
            <ul>PLAYERS: {players}</ul>
            {this.state.roomOwner &&
              <button onClick={this.startGame}>Start Game</button>
            }
          </div>
        );
        break;
      case "game started":
        game = (<Game lobby={this.lobby} username={this.state.username}></Game>);
        break;
      default: break;
    }


    return(
      <div className="w-100 h-100">
        {lobby}
        <canvas id="gameCanvas"></canvas>
        {game}
      </div>
    )
  }
}

// class Card extends React.Component {
//   handleClick = () => {
//     this.props.onCardClick(this.props.card);
//   }

//   render() {
//     return (
//       <li onClick={this.handleClick}>
//         card: {this.props.card}
//       </li>
//     );
//   }
// }

export default Lobby;
