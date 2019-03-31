import React from 'react';
import Game from './game';
import io from 'socket.io-client';
import ChatWindow from '../components/ChatWindow';
import { CLIENT_RENEG_LIMIT } from 'tls';

class Lobby extends React.Component {
  constructor(props) {
    super(props);
    let params = new URLSearchParams(window.location.search);
    this.roomId = params.get('id');
    let id = document.cookie.match('(^|;) ?' + 'id' + '=([^;]*)(;|$)');
    id = id ? id[2] : null;
    this.state = {players: [], roomOwner: false, phase: 'lobby', clientUserId: id, connected: false, lobbyState: 'connecting'};
    this.joinGame = this.joinGame.bind(this);
    this.startGame = this.startGame.bind(this);
    this.kickPlayer = this.kickPlayer.bind(this);
    this.copyLink = this.copyLink.bind(this);
    this.getDecks = this.getDecks.bind(this);
    fetch(`${process.env.REACT_APP_URL}api/lobby/${this.roomId}/status`).then((response) => {
      console.log('got response')
      if (response.ok) {
        console.log('response ok')
        return response.text();
      } else if (response.status === 404) {
        console.log('response not ok');
        throw new Error('Game lobby with that id was not found.');
      }
      throw new Error('There was an error communicating with the server');
    }).then((text) => {
      if (text) {
        console.log(text);
        this.setState({lobbyState: 'error', error: text});
      } else {
        console.log('no error')
        this.setState({lobbyState: window.sessionStorage.getItem('nickname-'+this.roomId) ? 'lobby' : 'no nickname'});
        console.log(this.state.lobbyState)
        console.log("env:", process.env, "URL:", process.env.URL)
        this.lobby = io.connect(process.env.REACT_APP_URL+this.roomId);
        this.lobby.on('player list', (players) => {
          console.log("list of players")
          console.log(players)
          let roomOwner = this.state.roomOwner;
          this.setState({players: players, roomOwner: players[0].socketId === this.socketId ? true : false});
          if (!roomOwner && this.state.roomOwner) {
            this.getDecks();
          }
        });
        this.lobby.on('start game', (gameState) => {
          this.setState({lobbyState: "game started"});
          console.log(`start game, initial cards: ${gameState.private.cards}`)
        });
        // TODO: Give a default username on connect if none
        let username = window.sessionStorage.getItem('nickname-'+this.roomId);
        if (username) {
          this.state.username = username;
          this.lobby.emit('join', username, (socketId) => {
            console.log('already had a username')
            this.socketId = socketId;
            this.setState({connected: true});
          });
        }
      }
    }).catch((err) => {
      this.setState({ lobbyState: 'error', error: err.message });
    });
  }

  startGame() {
    let pointSelect = document.getElementById('pointSelect');
    let whiteDeckSelect = document.getElementById('whiteDeckSelect');
    let blackDeckSelect = document.getElementById('blackDeckSelect');
    let winningPoints = pointSelect.options[pointSelect.selectedIndex].value;
    let whiteDeckId = whiteDeckSelect.options[whiteDeckSelect.selectedIndex].value;
    let blackDeckId = blackDeckSelect.options[blackDeckSelect.selectedIndex].value;

    let settings = {
      winningPoints: winningPoints,
      whiteDeckId: whiteDeckId,
      blackDeckId: blackDeckId
    };

    this.lobby.emit('start game', settings);
  }

  kickPlayer(player) {
    // Disconnect player with given username
    if (this.state.roomOwner) {
      this.lobby.emit('kick player', player.socketId);
    }
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
    window.sessionStorage.setItem('nickname-'+this.roomId, nickname);
    this.setState({lobbyState: "lobby", username: nickname});
    this.lobby.emit('join', nickname, (socketId) => {
      console.log("join game")
      this.socketId = socketId;
      this.setState({ connected: true });
    });
  }

  getDecks() {
    if (this.state.clientUserId) {
      fetch('/api/user/' + this.state.clientUserId + '/decks/', {
        method: "GET"
      }).then(response => {
        if (!response.ok) throw Error(response);
        return response
      }).then(response => {
        return response.json();
      }).then (decks => {
        console.log("decks from call: ", decks);
        this.setState({decks: decks});
      }).catch(err => console.log("err fetching decks", err));
    }
  }

  render() {
    // if there's an error then display error screen, otherwise render a proper page
    if (this.state.lobbyState === 'error') {
      return (
        <div>
          <h1> <a href="/" className="text-dark"> Shuffle With Friends </a> </h1>
          <div class="alert alert-danger" role="alert">
            {this.state.error}
          </div>
        </div>
      );
    }
    
    let players = this.state.players.map((player) => {
      let displayKick = this.state.roomOwner && player.socketId !== this.state.players[0].socketId
      let username = player.username;
      return (
          <div className="w-75" >
            <li className="list-group-item ml-3 container">
              <div className="row">
                <span className="col-8 my-auto">{username}</span>
                <div className="text-right col-4">
                  { displayKick && <button type="button" className="btn btn-danger align-middle" onClick={this.kickPlayer(player)}> X </button>}
                </div>
              </div>
            </li>
          </div>
      );
    });
    let host = this.state.roomOwner ? "You" : (this.state.players[0] ? this.state.players[0].username : "not loaded");
    let game;
    let lobby;
    const MAXIMUM_SELECTABLE_POINTS = 9;
    const DEFAULT_POINTS = 5;
    let pointsOptions = [...Array(MAXIMUM_SELECTABLE_POINTS).keys()].map((value) => {
      if (value + 1 === DEFAULT_POINTS)
        return (<option value={value + 1} selected="selected"> {value + 1} </option>);
      else
        return (<option value={value + 1}> {value + 1} </option>);
    });
    let defaultDeck = (<option value="default"> Default Deck </option>);
    let whiteDeckOptions = [defaultDeck];
    let blackDeckOptions = [defaultDeck];
    if (this.state.decks) {
      for (let deck of this.state.decks) {
        let deckOption = <option value={deck._id}> {deck.name} </option>;
        deck.type === "WHITE" ? whiteDeckOptions.push(deckOption) : blackDeckOptions.push(deckOption);
      }
    }
    let settingsBlock
    if (this.state.roomOwner) {
      settingsBlock = (
        <div id="settings">
          <h3> Settings: </h3>
            <label for="pointSelect" className="m-1"> Points to win: </label>
            <select id="pointSelect">
              {pointsOptions}
            </select>

            <br/>

            <label for="whiteDeckSelect" className="m-1"> White deck: </label>
            <select id="whiteDeckSelect">
              {whiteDeckOptions}
            </select>

            <br/>

            <label for="blackDeckSelect" className="m-1"> Black Deck: </label>
            <select id="blackDeckSelect">
              {blackDeckOptions}
            </select>

          </div>
        )
    }


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
          <h1> <a href="/" className="text-dark"> Shuffle With Friends </a> </h1>
            <h2> Players: </h2>
            <div className="w-25"> <ul className="list-group"> {players} </ul> </div>
            <br/>
            <h3> Host: {host} </h3>
            <br/>
            {settingsBlock}
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
        game = (<Game lobby={this.lobby} socketId={this.socketId} />);
        break;
      default: break;
    }

    return (
      <div className="w-100 h-100 no-overflow">
        {lobby}
        <canvas id="gameCanvas" resize="true" />
        {game}
        {this.state.connected && <ChatWindow socket={this.lobby}/>}
      </div>
    );
  }
}

export default Lobby;
