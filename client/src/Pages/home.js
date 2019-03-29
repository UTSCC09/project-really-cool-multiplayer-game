import React from 'react';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.getUser = this.getUser.bind(this);
    this.createGame = this.createGame.bind(this);
    this.getDecks = this.getDecks.bind(this);
    this.tabSwitch = this.tabSwitch.bind(this);
    this.curActive = null;
    this.playerDecks = null;
    this.toggleNewDeck = true;
    this.logOut = this.logOut.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.state = { user: null }
    this.getUser();
  }

  getUser() {
    // https://plainjs.com/javascript/utilities/set-cookie-get-cookie-and-delete-cookie-5/
    let token = document.cookie.match('(^|;) ?' + 'token' + '=([^;]*)(;|$)');
    token = token ? token[2] : null;
    let id = document.cookie.match('(^|;) ?' + 'id' + '=([^;]*)(;|$)');
    id = id ? id[2] : null

    if (token && id) {
      fetch('/api/user/' + id + '/', {
        method: "GET",
        headers: { "token": token }
      }).then(response => {
        if (!response.ok) throw Error(response);
        return response
      }).then(response => {
        return response.json();
      }).then(user => {
        console.log("user from last call, ", user); this.setState({ user: user })
      }).catch(err => console.log("err fetching user", err));
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

  getDecks() {
    // reder user deck interface
    let deckForm = document.getElementById('deck-form-container');
    deckForm.innerHTML = `
    <div class='row'>
      <div class="col-4">
        <label for="deck-list-tab">My Decks</label>
        <div class="list-group" id="deck-list-tab" role="tablist">
          <a class="list-group-item list-group-item-action active" id="list-add-new-deck">Add New Deck...</a>
        </div>
      </div>
      <div class="col-8">
        <form>
          <div class="form-group">
          <label for="deck-name-input">Deck Name</label>
          <input type="text" class="form-control" id="deck-name-input">
          </div>
          <div class="form-group">
            <label for="deck-type-select">Deck Type</label>
            <select class="custom-select mr-sm-2" id="deck-type-select">
              <option selected>Choose...</option>
              <option value="Black">Black Deck</option>
              <option value="White">White Deck</option>
            </select>
          </div>
          <div class="form-group">
            <label for="cards-text-area">Cards</label>
            <textarea class="form-control" id="cards-text-area" rows="4" placeholder="Enter your custom cards seperated by comma's."></textarea>
          </div>
          <div class="form-group d-flex justify-content-end" id="submit-buttons-container">
            <button class="btn btn-primary m-3" type="submit">Add</button>
          </div>
        </form>
      </div>
    </div>
    `;
    // set curActive
    this.curActive = document.getElementById('list-add-new-deck');
    // attatch listener to new deck list
    document.getElementById('list-add-new-deck').onclick = this.tabSwitch;

    // temp payload
    var testPayload = [
      {name:'test deck 2' ,whiteDeck:['lol', 'these', 'are', 'tests', 'for', 'white'], blackDeck:['black', 'deck', 'test']},
      {name:'test deck 1' ,whiteDeck:['lol', 'these', 'are', 'tests', 'for', 'white'], blackDeck:['black', 'deck', 'test']},
      {name:'test deck 3' ,whiteDeck:['lol', 'these', 'are', 'tests', 'for', 'white'], blackDeck:['black', 'deck', 'test']},
      {name:'test deck 4' ,whiteDeck:['lol', 'these', 'are', 'tests', 'for', 'white'], blackDeck:['black', 'deck', 'test']},
      {name:'test deck 5' ,whiteDeck:['lol', 'these', 'are', 'tests', 'for', 'white'], blackDeck:['black', 'deck', 'test']}
    ]
    // call api for list of user decks and populate playerDecks
    this.playerDecks = testPayload;
    // generate list with decks
    this.playerDecks.forEach((deck) => {
      let a = document.createElement('a')
      a.onclick = this.tabSwitch;
      a.setAttribute('class', 'list-group-item list-group-item-action');
      a.innerHTML = deck.name;
      let newDeckNode = document.getElementById('list-add-new-deck');
      document.getElementById('deck-list-tab').insertBefore(a, newDeckNode.nextSibling);
    });
  }

  tabSwitch (e) {
    // update active list element
    e.target.classList.add('active');
    if (this.curActive && this.curActive !== e.target) {
      this.curActive.classList.remove('active');
    }
    this.curActive = e.target;
    this.toggleNewDeck = e.target.id==='list-add-new-deck'?true:false;
    // update buttons
    var buttonsDiv = document.getElementById('submit-buttons-container');
    buttonsDiv.innerHTML = this.toggleNewDeck?
    `<button class="btn btn-primary m-3" type="submit">Add</button>`:
    `<button class="btn btn-primary m-3" type="submit">Save</button>
    <button class="btn btn-danger m-3" type="submit">Delete</button>`
    // if not new deck, populate textarea
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
    var submitButtons;
    if(this.toggleNewDeck) {
      submitButtons = 
      <div className="form-group d-flex justify-content-end">
        <button className="btn btn-primary m-3" type="submit">Add</button>
      </div>
    } else {
      submitButtons = 
      <div className="form-group d-flex justify-content-end">
        <button className="btn btn-primary m-3" type="submit">Save</button>
        <button className="btn btn-danger m-3" type="submit">Delete</button>
      </div>
    }
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
      <div>
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
              <button onClick={this.getDecks} type="button" className="btn btn-info m-3">My Decks</button>
            </span>
          </div>

          <div className="d-flex flex-column justify-content-end align-items-start p-2 invisible">
            <button type="button" className="btn btn-primary m-1"> Log in</button>
          </div>
        </div>
        <div className="px-5 py-2">
          <span className='container' id='deck-form-container'>
          </span>
        </div>
      </div>
    )
  }
}

export default Home;
