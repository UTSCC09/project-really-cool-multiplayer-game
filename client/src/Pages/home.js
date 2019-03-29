import React from 'react';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.createGame = this.createGame.bind(this);
    this.getDecks = this.getDecks.bind(this);
    this.tabSwitch = this.tabSwitch.bind(this);
    this.curActive = null;
    this.playerDecks = null;
    this.toggleNewDeck = true;
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
            <label class="mr-sm-2" for="deck-type-select">Deck Type</label>
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
      {name:'test deck 1' ,whiteDeck:'lol, these, are, tests, for, white',blackDeck:'black, deck, test'},
      {name:'test deck 2' ,whiteDeck:'lol, these, are, tests, for, white',blackDeck:'black, deck, test'},
      {name:'test deck 3' ,whiteDeck:'lol, these, are, tests, for, white',blackDeck:'black, deck, test'},
      {name:'test deck 4' ,whiteDeck:'lol, these, are, tests, for, white',blackDeck:'black, deck, test'},
      {name:'test deck 5' ,whiteDeck:'lol, these, are, tests, for, white',blackDeck:'black, deck, test'}
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
            <button onClick={this.getDecks} type="button" className="btn btn-info m-3">My Decks</button>
          </span>
          <span className='container' id='deck-form-container'>
              {/* <div className='row'>
                <div className="col-4">
                  <label for="deck-list-tab">My Decks</label>
                  <div className="list-group" id="deck-list-tab" role="tablist">
                    <a onClick={this.tabSwitch} className="list-group-item list-group-item-action active" id="list-add-new-deck">Add New Deck...</a>
                  </div>
                </div>
                <div className="col-8">
                  <form>
                    <div className="form-group">
                      <label for="blackCardTextArea">Black Cards</label>
                      <textarea className="form-control" id="blackCardTextArea" rows="4"></textarea>
                    </div>
                    <div className="form-group">
                      <label for="whiteCardTextArea">White Cards</label>
                      <textarea className="form-control" id="whiteCardTextArea" rows="4"></textarea>
                    </div>
                    <div className="form-group d-flex justify-content-end" id="submit-buttons-container"></div>
                  </form>
                </div>
              </div> */}
          </span>
      </div>
    )
  }
}

export default Home;
