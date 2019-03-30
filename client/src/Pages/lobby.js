import React from 'react';
import Game from './game';
import io from 'socket.io-client';
import ChatWindow from '../components/ChatWindow';
import { CLIENT_RENEG_LIMIT } from 'tls';

class Lobby extends React.Component {
  constructor(props) {
    super(props);
    this.joinGame = this.joinGame.bind(this);
    this.state = {players: [], roomOwner: false, phase: 'lobby', connected: false};
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
      this.setState({players: players.map((player) => {return player.username}), roomOwner: players[0].socketId === this.socketId ? true : false});
    });
    this.lobby.on('start game', (gameState) => {
      this.setState({lobbyState: "game started"});
      console.log(`start game, initial cards: ${gameState.private.cards}`)
    });
    // TODO: Give a default username on connect if none
    let username = window.localStorage.getItem('nickname');
    if (username) {
      this.state.username = username;
      this.lobby.emit('join', username, (socketId) => {
        console.log('already had a username')
        this.socketId = socketId;
        this.setState({connected: true});
      });
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
    this.lobby.emit('join', nickname, (socketId) => {
      console.log("join game")
      this.socketId = socketId;
      this.setState({ connected: true });
    });
  }

  render() {
    console.log(this.state)
    let players = this.state.players.map((username) => {
      return (
          <div className="w-75">
            <li className="list-group-item ml-3">
            {this.state.roomOwner && <button type="button" className="btn btn-danger mr-3" onClick={this.kickPlayer(username)}> X </button>}
            {username}
            </li>
          </div>
      )
    });
    let host = this.state.roomOwner ? "You" : this.state.players[0];
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
        game = (<Game lobby={this.lobby} socketId={this.socketId}></Game>);
        break;
      default: break;
    }


    return(
      <div className="w-100 h-100">
        {lobby}
        <canvas id="gameCanvas"></canvas>
        {game}
        {this.state.connected && <ChatWindow socket={this.lobby}/>}
      </div>
    )
  }
}

export default Lobby;
