import React from 'react';

class Game extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
        <canvas id="myCanvas" resize></canvas>
    )
  }
}

export default Game;