import React from 'react';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.createGame = this.createGame.bind(this);
  }

  createGame() {
    fetch('/api/create-room/').then((response) => {
      return  response.text();
    }).then((roomId) => {
      window.location.href = `/lobby?id=${roomId}`;
    });
  }
  // Big title
  // nickname input
  // host game button
  // join random game

  render() {
    return(
      <div id="main-container" className="d-flex flex-column justify-content-center align-items-center p-2">
          <h1> Shuffle With Friends </h1>
          <span>
            Nickname:
            <input id="nickname" className="ml-2"></input>
          </span>
          <span>
            <button type="button" className="btn btn-primary m-3" onClick={this.createGame}>Host Game</button>
            <button type="button" className="btn btn-primary m-3">Join a Game</button>
          </span>
      </div>
    )
  }
}

export default Home;
