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
    this.roomId = params.get('id');

    // TODO: read this from some config file so when we deploy on heroku we don't have to change it each time
    console.log("env:", process.env, "URL:", process.env.URL)
    this.lobby = io.connect(process.env.REACT_APP_URL+this.roomId);
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

  // https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
  copyLink() {
    var textArea = document.createElement("textarea");

    //
    // *** This styling is an extra step which is likely not required. ***
    //
    // Why is it here? To ensure:
    // 1. the element is able to have focus and selection.
    // 2. if element was to flash render it has minimal visual impact.
    // 3. less flakyness with selection and copying which **might** occur if
    //    the textarea element is not visible.
    //
    // The likelihood is the element won't even render, not even a
    // flash, so some of these are just precautions. However in
    // Internet Explorer the element is visible whilst the popup
    // box asking the user for permission for the web page to
    // copy to the clipboard.
    //

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;

    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';


    textArea.value = window.location;

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Copying text command was ' + msg);
    } catch (err) {
      console.log('Oops, unable to copy');
    }

    document.body.removeChild(textArea);
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
              <button type="button" className="btn btn-success" onClick={this.startGame} disabled={this.state.players.length < 3}>Start Game</button>
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
