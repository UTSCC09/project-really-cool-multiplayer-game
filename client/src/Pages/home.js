import React from 'react';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.getUser = this.getUser.bind(this);
    this.createGame = this.createGame.bind(this);
    this.logOut = this.logOut.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.state = { user: null }
    this.getUser();
  }

  getUser() {
    // https://plainjs.com/javascript/utilities/set-cookie-get-cookie-and-delete-cookie-5/
    let token = document.cookie.match('(^|;) ?' + 'token' + '=([^;]*)(;|$)');
    token = token ? token[2] : null;
    if (token) {
      fetch('/api/user/token/' + token + '/')
      .then(response => {if (!response.ok) throw Error(response); return response})
      .then(response => response.json())
      .then(user => {console.log(user); this.setState({user: user})})
      .catch(err => console.log("err fetching user", err));
    }
  }

  createGame() {
    let nickname = document.getElementById('nickname').value;
    nickname = nickname || Math.random().toString(36).slice(2);; //TODO real random name
    fetch('/api/create-room/').then((response) => {
      return  response.text();
    }).then((roomId) => {
      window.sessionStorage.setItem('nickname-'+roomId, nickname);
      window.location.href = `/lobby?id=${roomId}`;
    });
  }

  logOut() {
    fetch('/logout/')
    .then(this.setState({user: null}))
    .catch(err => console.log("err logging out", err));
  }

  authenticate() {
    console.log(document.cookie);
    window.location.href = '/auth/google/';
  }


  render() {
    let userPane = this.state.user ? (
      <div className="d-flex flex-column justify-content-start align-items-start p-2">
        <button type="button" className="btn btn-primary m-1" onClick={this.logOut}> Log out</button>
      </div>
    ) : (
      <div className="d-flex flex-column justify-content-start align-items-start p-2">
        <button type="button" className="btn btn-primary m-1" onClick={this.authenticate}> Log in</button>
      </div>
    );


    return(
        <div id="main-container" className="d-flex justify-content-between">
          {userPane}
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
