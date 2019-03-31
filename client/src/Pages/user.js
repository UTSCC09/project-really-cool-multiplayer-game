import React from 'react';

class User extends React.Component {
  constructor(props) {
    super(props);
    this.getUser = this.getUser.bind(this);
    this.getFriends = this.getFriends.bind(this);
    this.friendRequestResponse = this.friendRequestResponse.bind(this);
    this.getIncomingFriendRequests = this.getIncomingFriendRequests.bind(this);
    this.toUserPage = this.toUserPage.bind(this);
    let userId = props.match.params.id;
    let id = document.cookie.match('(^|;) ?' + 'id' + '=([^;]*)(;|$)');
    id = id ? id[2] : null
    this.state = { userId: userId, user: null, friends: null, clientUserId: id}
    this.getUser();
    if (this.state.userId === this.state.clientUserId) {
      this.getIncomingFriendRequests();
    }
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
      friendsInfo = (this.state.friends.indexOf(clientUserId) !== 0 && this.state.friends) ? this.state.friends.map((user) => {
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

    return(
      <div>
        <h1> <a href={url} className="text-dark"> Shuffle With Friends </a> </h1>
        {userInfo}
      </div>
    );
  }



}
export default User;
