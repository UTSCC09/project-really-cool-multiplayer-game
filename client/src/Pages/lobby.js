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
    this.kickPlayer = this.kickPlayer.bind(this);
    this.copyLink = this.copyLink.bind(this);
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
      this.setState({lobbyState: "game started"});
      console.log(`start game, initial cards: ${gameState.private.cards}`)
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

  kickPlayer(username) {
    // Disconnect player with given username
  }

  copyLink() {
    // copy link to clipboard
  }

  joinGame() {
    let nickname = document.getElementById('nickname').value;
    nickname = nickname || Math.random().toString(36).slice(2);; //TODO real random name
    window.localStorage.setItem('nickname', nickname);
    this.setState({lobbyState: "lobby", username: nickname});
    this.lobby.emit('join', nickname);
  }
  render() {
    let players = this.state.otherPlayers.map((username) => {
      return (
          <div className="w-75">
            <li className="list-group-item ml-3">
            {this.state.roomOwner && <button type="button" className="btn btn-danger mr-3" onClick={this.kickPlayer(username)}> X </button>}
            {username}
            </li>
          </div>
      )
    });
    let host = this.state.roomOwner ? "You" : this.state.otherPlayers[0];
    let game;
    let lobby;
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
        // Copy link
        // Kick (for host)
        // Settings
      case "lobby": lobby = (
          <div>
            <h1> Shuffle With Friends </h1>
            <h2> Players: </h2>
            <div className="w-25"> <ul className="list-group"> {players} </ul> </div>
            <br/>
            <h3> Host: {host} </h3>
            <br/>
            <button type="button" className="btn btn-primary mr-3" onClick={this.copyLink}>Copy Link</button>
            {
              this.state.roomOwner &&
              <button type="button" className="btn btn-success" onClick={this.startGame}>Start Game</button>
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

export default Lobby;
