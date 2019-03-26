import React from 'react';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.createGame = this.createGame.bind(this);
    this.authenticate = this.authenticate.bind(this);
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

  authenticate() {
    console.log("wahoo");
    window.location.href = '/auth/google/';
  }

  render() {
    return(
        <div id="main-container" className="d-flex justify-content-between">

          <div className="d-flex flex-column justify-content-start align-items-start p-2">
            <button type="button" className="btn btn-primary m-1" onClick={this.authenticate}> Log in</button>
          </div>

          <div className="d-flex flex-column justify-content-center align-items-center p-2">
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

          <div className="d-flex flex-column justify-content-end align-items-start p-2 invisible">
            <button type="button" className="btn btn-primary m-1"> Log in</button>
          </div>

        </div>
    )
  }
}

export default Home;
