import React from 'react';

class User extends React.Component {
  constructor(props) {
    super(props);
    this.getUser = this.getUser.bind(this);
    this.getFriends = this.getFriends.bind(this);
    this.friendRequestResponse = this.friendRequestResponse.bind(this);
    this.getIncomingFriendRequests = this.getIncomingFriendRequests.bind(this);
    this.toUserPage = this.toUserPage.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    let userId = props.match.params.id;
    let id = document.cookie.match('(^|;) ?' + 'id' + '=([^;]*)(;|$)');
    id = id ? id[2] : null
    this.state =
    { userId: userId,
      user: null,
      friends: null,
      decks: null,
      newDeckToggle: true,
      submitState: null,
      deckListIndex: -1,
      formNameInput: null,
      formTypeInput: null,
      formContentInput: null,
      clientUserId: id};
    this.formInput = {name: React.createRef(), type: React.createRef(), content: React.createRef()};
    this.getUser();
    if (this.state.userId === this.state.clientUserId) {
      this.getIncomingFriendRequests();
    }
    this.getDecks();
  }

  getUser() {
    // https://plainjs.com/javascript/utilities/set-cookie-get-cookie-and-delete-cookie-5/
    let token = document.cookie.match('(^|;) ?' + 'token' + '=([^;]*)(;|$)');
    token = token ? token[2] : null;
    fetch('/api/user/' + this.state.userId + '/', {
      method: "GET",
      headers: {
        "token": this.clientUserId === this.state.userId ? token : ""
      }
    }).then(response => {
      if (!response.ok) throw Error(response);
      return response
    }).then(response => {
      return response.json();
    }).then(user => {
      console.log("user from last call, ", user);
      this.setState({ user: user });
      this.getFriends();
    }).catch(err => console.log("err fetching user", err));
  }

  getFriends() {
    fetch('/api/user/' + this.state.userId + '/friend/', {
      method: "GET"
    }).then(response => {
      if (!response.ok) throw Error(response);
      return response
    }).then(response => {
      return response.json();
    }).then (friends => {
      console.log("friends from call: ", friends);
      this.setState({friends: friends});
    }).catch(err => console.log("err fetching friends", err));
  }

  getIncomingFriendRequests() {
    let token = document.cookie.match('(^|;) ?' + 'token' + '=([^;]*)(;|$)');
    token = token ? token[2] : null;
    if (token && (this.state.clientUserId === this.state.userId)) {
      fetch('/api/user/' + this.state.userId + '/friend/requests?type=incoming', {
        method: "GET",
        headers: {
          "token": token
        }
      }).then(response => {
        if (!response.ok) throw Error(response);
        return response;
      }).then(response => {
        return response.json();
      }).then(incomingRequests => {
        console.log("incoming friend requests", incomingRequests);
        this.setState({ incomingRequests: incomingRequests });
      }).catch(err => console.log("err fetching incoming friend requests", err));
    }
  }

  getDecks() {
    fetch('/api/user/' + this.state.userId + '/decks/', {
      method: "GET"
    }).then(response => {
      if (!response.ok) throw Error(response);
      return response
    }).then(response => {
      return response.json();
    }).then (decks => {
      console.log("decks from call: ", decks);
      this.setState({decks: decks});
    }).catch(err => console.log("err fetching friends", err));
  }

  friendRequestResponse(type, id) {
    let token = document.cookie.match('(^|;) ?' + 'token' + '=([^;]*)(;|$)');
    token = token ? token[2] : null;
    let senderId = this.state.clientUserId;
    let recipientId = id || this.state.userId;


    if (token && this.state.clientUserId) {
      fetch('/api/user/' + recipientId + '/friend/', {
        method: "PUT",
        body: JSON.stringify({
          id: senderId,
          requestType: type
        }),
        headers: {
          "token": token,
          "Content-Type": "application/json"
        },
      }).then(response => {
        if (!response.ok) throw Error(response);
        return response;
      }).then(response => {
        return response.json();
      }).then(response => {
        console.log("Final response: ", response); // get user?
        this.getFriends();
        this.getIncomingFriendRequests();
      }).catch(err => console.log("err sending friend request", err));
    }
  }

  toUserPage(user) {
    if (user && user._id) {
      window.location.href = '/user/' + user._id + '/';
    }
  }
  setAddDeckState(bool, deckListIndex) {
    let res = {};
    if (this.state.newDeckToggle !== bool) {
      res.newDeckToggle = bool
    }
    if (this.state.deckListIndex !== deckListIndex) {
      res.deckListIndex = deckListIndex;
      console.log(this.state.decks[deckListIndex]);
      res.formNameInput = deckListIndex!==-1?this.state.decks[deckListIndex].name:"";
      res.formTypeInput = deckListIndex!==-1?this.state.decks[deckListIndex].type:"";
      res.formContentInput= deckListIndex!==-1?this.state.decks[deckListIndex].cards.toString():"";
    }
    this.setState(res);
  }

  handleForm() {
    if (this.state.submitState === 'add') {
      let contentArray = this.formInput.content.current.value.split(",").map(str => str.trim());
      fetch('/api/deck/', {
        method: 'POST',
        body: JSON.stringify({  content: contentArray,
                                name: this.formInput.name.current.value,
                                type: this.formInput.type.current.value}),
        headers:{
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        console.log('Deck Added Successfully:', JSON.stringify(response))
        this.getDecks();
        this.forceUpdate();
      })
      .catch(error => console.error('Error:', error));
    } else if (this.state.submitState === 'delete') {
      this.setState({deckListIndex: -1});
      fetch('/api/deck/'+this.state.decks[this.state.deckListIndex]._id, {
        method: 'DELETE'
      })
      .then(response => {
        console.log('Deck Deleted Successfully:', JSON.stringify(response))
        this.getDecks();
        this.forceUpdate();
      })
      .catch(error => console.error('Error:', error));
    } else if (this.state.submitState === 'update') {
      let contentArray = this.formInput.content.current.value.split(",").map(str => str.trim());
      fetch('/api/deck/'+this.state.decks[this.state.deckListIndex]._id, {
        method: 'PUT',
        body: JSON.stringify({  content: contentArray,
                                name: this.formInput.name.current.value,
                                type: this.formInput.type.current.value}),
        headers:{
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        console.log('Deck Updated Successfully:', JSON.stringify(response))
        this.getDecks();
        this.forceUpdate();
      })
      .catch(error => console.error('Error:', error));
    }
    this.forceUpdate();
  }

  addDeckSubmit(e) {
    this.setState({submitState: 'add'}, this.handleForm)
  }

  deleteDeckSubmit(e) {
    this.setState({submitState: 'delete'}, this.handleForm)
  }

  updateDeckSubmit(e) {
    this.setState({submitState: 'update'}, this.handleForm)
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  render() {
    console.log(this.state);
    let clientPage = this.state.userId === this.state.clientUserId;
    let clientUserId = this.state.clientUserId;
    let friendsInfo;
    let friendButton;
    let friendRequests;
    let friendRequestsInfo;

    if (this.state.friends) {
      if (!(this.state.friends.find((user) => {return user._id === clientUserId})) && clientUserId && !clientPage) {
        friendButton = (<button type="button" className="btn btn-primary m-1" onClick={() => {this.friendRequestResponse("SEND")}}> Add Friend </button>)
      }
      friendsInfo = (this.state.friends && this.state.friends.length !== 0) ? this.state.friends.map((user) => {
        return (
          <div className="w-50">
            <li className="list-group-item ml-3">
              <span onClick={() => {this.toUserPage(user)}} className="clickable">
                <img src={user.photo} className="profileImgSm d-inline-block m-2"/>
                {user.givenName + " " + user.familyName}
              </span>
            </li>
          </div>
        )
      }) : (
        <span> {clientPage ? "You have" : this.state.user.givenName + " has"} no friends! </span>
      );
    }
    if (clientPage && this.state.incomingRequests) {
      friendRequests = (this.state.incomingRequests && (this.state.incomingRequests.length !== 0)) ? this.state.incomingRequests.map((user) => {
        return (
          <div className="w-50">
            <li className="list-group-item ml-3">
              <span>
                <img src={user.photo} className="profileImgSm d-inline-block m-2"/>
                {user.givenName + " " + user.familyName}
                <button type="button" className="btn btn-success m-2" onClick={() => {this.friendRequestResponse("ACCEPT", user._id)}}> Accept </button>
                <button type="button" className="btn btn-danger m-2" onClick={() => {this.friendRequestResponse("DECLINE", user._id)}}> Decline </button>
              </span>
            </li>
          </div>
        )
      }) : (
        <span> You have no friend requests! </span>
      );
      if (friendRequests) {
        friendRequestsInfo =  (
          <div>
            <h3> Friend Requests: </h3>
            {friendRequests}
          </div>
        )
      }
    }

    let url = "/";
    let userInfo = this.state.user ? (
      <div>
        <h2>
          <img src={this.state.user.photo} className="profileImg d-inline-block"/>
          <span> {this.state.user.givenName + " " + this.state.user.familyName} </span>
          {friendButton}
        </h2>
        <div>
          <h3> Friends: </h3>
          {friendsInfo}
        </div>
        <br/>
        <div>
          {friendRequestsInfo}
        </div>
      </div>
    ) : (
      <div>
        <h2> This user does not exist! </h2>
      </div>
    );

    let addNewDeckEntry = this.state.clientUserId === this.state.userId ?
    (<a className={"list-group-item list-group-item-action" + (this.state.deckListIndex === -1?" active":"")} id="list-add-new-deck" onClick={(e) => this.setAddDeckState(true, -1)}>Add New Deck...</a>):
    null;

    let deckListEntries = this.state.decks?
    this.state.decks.map((deck) => {
      return(<a className={"list-group-item list-group-item-action" + (this.state.deckListIndex === this.state.decks.indexOf(deck)?" active":"")} onClick={(e) => this.setAddDeckState(false, this.state.decks.indexOf(deck))}>{deck.name}</a>)
    }):null;

    let deckSubmit = this.state.newDeckToggle?
    (<div className="form-group d-flex justify-content-end" id="submit-buttons-container">
      <button className="btn btn-primary m-3" type='button' onClick={this.addDeckSubmit.bind(this)}>Add</button>
    </div>):
    (<div className="form-group d-flex justify-content-end" id="submit-buttons-container">
      <button class="btn btn-primary m-3" type='button' onClick={this.updateDeckSubmit.bind(this)}>Save</button>
      <button class="btn btn-danger m-3" type='button' onClick={this.deleteDeckSubmit.bind(this)}>Delete</button>
    </div>)

    let deckSubmitCond = this.state.userId === this.state.clientUserId?deckSubmit:null;

    let deckForm = (
  <div className='row'>
    <div className="col-4">
      <label for="deck-list-tab">Deck List</label>
      <div className="list-group" id="deck-list-tab" role="tablist">
        {addNewDeckEntry}
        {deckListEntries}
      </div>
    </div>
    <div className="col-8">
      <form>
        <div className="form-group">
        <label for="deck-name-input">Deck Name</label>
        <input name="formNameInput" type="text" ref={this.formInput.name} className="form-control" id="deck-name-input" disabled={this.state.clientUserId !== this.state.userId} value={this.state.formNameInput} onChange={this.handleInputChange}></input>
        </div>
        <div className="form-group">
          <label for="deck-type-select">Deck Type</label>
          <select name="formTypeInput" ref={this.formInput.type} className="custom-select mr-sm-2" id="deck-type-select" disabled={this.state.clientUserId !== this.state.userId} value={this.state.formTypeInput} onChange={this.handleInputChange}>
            <option>Choose...</option>
            <option value="BLACK" selected={this.state.deckListIndex!==-1?this.state.decks[this.state.deckListIndex].type==='BLACK':false}>Black Deck</option>
            <option value="WHITE" selected={this.state.deckListIndex!==-1?this.state.decks[this.state.deckListIndex].type==='WHITE':false}>White Deck</option>
          </select>
        </div>
        <div className="form-group">
          <label for="cards-text-area">Cards</label>
          <textarea name="formContentInput" rows="4" ref={this.formInput.content} className="form-control" id="cards-text-area" placeholder="Enter your custom cards seperated by comma's." disabled={this.state.clientUserId !== this.state.userId} value={this.state.formContentInput} onChange={this.handleInputChange}></textarea>
        </div>
        {deckSubmitCond}
      </form>
    </div>
  </div>
);

    return(
      <div>
        <h1> <a href={url} className="text-dark"> Shuffle With Friends </a> </h1>
        {userInfo}
        <br/>
        <h3> Custom Decks: </h3>
        <div className="px-5 py-2">
          <span className='container' id='deck-form-container'>
            {deckForm}
          </span>
        </div>
      </div>
    );
  }



}
export default User;
