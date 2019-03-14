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

  render() {
    return(
      <div className="mx-auto">
        WE'RE ALL GONNA DIE
        <button type="button" className="btn btn-primary mt-3" onClick={this.createGame}>Host Game</button>
      </div>
    )
  }
}

export default Home;