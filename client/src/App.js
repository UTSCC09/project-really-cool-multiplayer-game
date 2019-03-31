import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Home from './Pages/home.js';
import Lobby from './Pages/lobby.js';
import Game from './Pages/game.js';
import User from './Pages/user.js';
import PrivacyPolicy from './Pages/privacyPolicy.js';

class App extends Component {
  render() {

    return (
      <BrowserRouter>
        <div className="h-100 w-100">
          <Route exact path="/" component={Home} />
          <Route path="/lobby" component={Lobby} />
          <Route exact path="/gameTest" component={Game} />
          <Route path="/user/:id" component={User} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
