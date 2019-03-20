import React from 'react';
import Game from './game';
import io from 'socket.io-client';

class Lobby extends React.Component {
  constructor(props) {
    super(props);
    this.state = {otherPlayers: [], roomOwner: false, phase: 'lobby'};
    this.startGame = this.startGame.bind(this);
    let params = new URLSearchParams(window.location.search);
    let roomId = params.get('id');

    // TODO: read this from some config file so when we deploy on heroku we don't have to change it each time
    console.log("env:", process.env, "URL:", process.env.URL)
    this.lobby = io.connect(process.env.REACT_APP_URL+roomId);
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
      this.setState({gameStarted: true});
    });
    // TODO: replace with username
    let username = Math.random().toString(36).slice(2);
    this.state.username = username;
    this.lobby.emit('join', username);
  }

  startGame() {
    this.lobby.emit('start game');
  }

  render() {
    let players = this.state.otherPlayers.map((username) => {
      return (
        <li>{username}</li>
      )
    });
    let game;
    let lobby;
    if (this.state.gameStarted) {
      game = (<Game lobby={this.lobby} username={this.state.username}></Game>)
    } else {
      lobby = (
        <div>
          <ul>PLAYERS: {players}</ul>
          {this.state.roomOwner &&
            <button onClick={this.startGame}>Start Game</button>
          }
        </div>
      )
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

export default Lobby;
