import React from 'react';
import PaperScope from 'paper'

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.paper = PaperScope
  }

  render() {
    return(
      <div>
        <canvas id="gameCanvas" resize></canvas>
      </div>
    )
  }
  componentDidMount() {
    this.paper.install(window);
    window.onload = function() {
      this.paper.setup('gameCanvas');
      var path = new this.paper.Path.Rectangle([75, 75], [100, 100]);
      path.strokeColor = 'black';
  
      this.paper.view.onFrame = function(event) {
        // On each frame, rotate the path by 3 degrees:
        path.rotate(3);
      }
    }
  }
}

export default Game;