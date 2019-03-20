import React from 'react';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.createGame = this.createGame.bind(this);
  }

  createGame() {
    let nickname = document.getElementById('nickname').value;
    nickname = nickname || Math.random().toString(36).slice(2);; //TODO real random name
    window.localStorage.setItem('nickname', nickname);
    fetch('/api/create-room/').then((response) => {
      return  response.text();
    }).then((roomId) => {
      window.location.href = `/lobby?id=${roomId}`;
    });
  }

  render() {
    return(
      <div id="main-container" className="d-flex flex-column justify-content-center align-items-center p-2">
          <h1> Shuffle With Friends </h1>
          <span>
            Nickname:
            <input id="nickname" className="ml-2"></input>
          </span>
          If you don't choose one we'll make one for you
          <span>
            <button type="button" className="btn btn-primary m-3" onClick={this.createGame}>Host Game</button>
            <button type="button" className="btn btn-primary m-3">Join a Game</button>
          </span>
      </div>
    )
  }
}

export default Home;
