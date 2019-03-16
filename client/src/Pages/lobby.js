import React from 'react';
import io from 'socket.io-client';

class Lobby extends React.Component {
  constructor(props) {
    super(props);
    this.state = {otherPlayers: [], roomOwner: false, gameState: {}, phase: 'lobby'};
    this.startGame = this.startGame.bind(this);
    this.selectWhiteCard = this.selectWhiteCard.bind(this);
    this.selectWinner = this.selectWinner.bind(this);
    let params = new URLSearchParams(window.location.search);
    let roomId = params.get('id');
    fetch(`/api/game/${roomId}`).then((response) => {
      return response.text();
    }).then((result) => {
      if (result === "false") {
        // TODO: room doesn't exist
        return;
      }
      // TODO: read this from some config file so when we deploy on heroku we don't have to change it each time
      this.lobby = io.connect(`http://localhost:5000/${roomId}`);
      this.lobby.on('room full', () => {
        // TODO: room is full
      });
      this.lobby.on('player list', (players) => {
        if (players.length === 0) {
          // first to join
          this.setState({roomOwner: true});
        } else {
          this.setState({otherPlayers: players});
        }
      });
      this.lobby.on('player joined', (username) => {
        let otherPlayers = this.state.otherPlayers;
        otherPlayers.push(username);
        this.setState({otherPlayers: otherPlayers});
      });
      this.lobby.on('start game', (gameState) => {
        // TODO: prepare for game
        this.setState({gameState: gameState});
        this.on('black card', (gameState) => {
          let phase = gameState.public.cardCsar === this.state.username ? 'waiting' : 'picking'
          this.setState({gameState: gameState, phase: phase});
        });
        this.on('reveal white cards', (gameState) => {
          let phase = gameState.public.cardCsar === this.state.username ? 'judging' : 'waiting'
          this.setState({gameState:  gameState, phase: phase});
        });
        this.on('game over', (gameState) => {
          this.setState({gameState: gameState, phase: 'game over'});
        });
      });
      // TODO: replace with username
      this.lobby.emit('join', Math.random().toString(36).slice(2));
    });
  }

  startGame() {
    this.lobby.emit('start game');
  }

  selectWhiteCard(card) {
    this.lobby.emit('white card submit', card);
  }

  selectWinner(card) {
    this.lobby.emit('card selected', card);
  }

  render() {
    // TODO: change this display to be actually good
    let players = this.state.otherPlayers.map((username) => {
      return (
        <li>{username}</li>
      )
    });
    return(
      <div>
        <ul>{players}</ul>
        {this.state.roomOwner &&
          <button onClick={this.startGame}>Start Game</button>
        }
      </div>
    )
  }
}

export default Lobby;
