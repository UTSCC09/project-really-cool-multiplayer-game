import React from 'react';
import PaperScope from 'paper';
import PaperCards from '../gameScripts/card';

class Game extends React.Component {
  constructor(props) {
    super(props);

    PaperScope.install(this)
  }

  render() {
    return(
      <div>
        <canvas id="gameCanvas" resize></canvas>
      </div>
    )
  }
  componentDidMount() {
    window.onload = function() {
      paper.setup('gameCanvas');
      var path = new Path.Rectangle([75, 75], [100, 100]);
      path.strokeColor = 'black';
  
      view.onFrame = function(event) {
        // On each frame, rotate the path by 3 degrees:
        path.rotate(3);
      }
    }
  }
}

export default Game;