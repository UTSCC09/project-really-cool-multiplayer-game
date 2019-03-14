import React from 'react';

class Lobby extends React.Component {
  constructor(props) {
    super(props);
    this.state = {otherPlayers: [], roomOwner: false};
    this.startGame = this.startGame.bind(this);
    let params = new URLSearchParams(window.location.search);
    let roomId = params.get('id');
    fetch(`/api/game/${roomId}`).then((response) => {
      return response.text();
    }).then((result) => {
      if (result === "false") {
        // TODO: room doesn't exist
        return;
      }
      // eslint-disable-next-line no-undef
      this.lobby = io.connect(`http://localhost:5000/${roomId}`, {path: '/swf/socket.io'});
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
      this.lobby.on('start game', () => {
        // TODO: prepare for game
      });
      // TODO: replace with username
      this.lobby.emit('join', Math.random().toString(36).slice(2));
    });
  }

  startGame() {
    this.lobby.emit('start game');
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