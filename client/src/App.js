import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Home from './Pages/home.js';
import Lobby from './Pages/lobby.js';

class App extends Component {
  render() {

    return (
      <BrowserRouter>
        <div>big boys here to bungalo ;)
          <Route exact path="/" component={Home} />
          <Route path="/lobby" component={Lobby} />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;