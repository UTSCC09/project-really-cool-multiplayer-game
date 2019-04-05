# ShuffleWithFriends REST API Documentation

## Deck API

### Create

- description: Create a new deck
- request: 'POST /api/deck/'
  - content-type: 'application/json'
  - body: object
    - content: ([String]) List of the text of each card of new deck
    - name: (String) The name of the deck
    - type: ("WHITE" or "BLACK") Is this a white or black deck?
- response: 200
  - content-type: 'application/json'
  - body: (String) the database object id of the new object
- response: 400
  - body: object
    - error: (String) "Deck type must be either WHITE or BLACK"
- response: 400
  - body: object
    - error: (String) "Not enough unique cards in deck, WHITE decks must have at least 60"
- response: 400
  - body: object
    - error: (String) "Not enough unique cards in deck, BLACK decks must have at least 10"    
- response: 401
  - body: object
    - error: (String) "Access denied"
- response: 500
  - body: object
    - error: (String) Server error
```
$ curl -X POST
       -H "Content-Type: `application/json`"
       -d '{"content":["new","deck","1","2","3","4","5","6","7","8"]],"name":"new deck","type":"BLACK"}
       https://shufflewithfriends.herokuapp.com/api/deck/'
```
- note: You must be logged into the website and have a valid token saved in session

### Read

- description: Get a specific deck form database
- request: 'GET /api/deck/:id/'
  - params:
    - id: Database id of desired deck
- response: 200
  - content-type: 'application/json'
  - body: object
    - \_id: Database id of the returned deck
    - name: (String) Name of the deck
    - type: (String) The type of the deck ("WHITE" OR "BLACK")
    - cards: ([String]) Text content of each card in the deck
    - ownerId (String) Database id of the creator of the deck
- response: 404
  - body: object
    - error: (String) "Deck not found"
- response: 500
  - body: object
    - error: (String) Server error

```
$ curl https://shufflewithfriends.herokuapp.com/api/deck/5ca0848e898f5f29e5fa4625/
```

### Update

- description: Update a specific deck in database
- request: 'PUT /api/deck/:id/'
  - params:
    - id: Database id of desired deck
  - body: object
    - content: ([String]) List of the text of each card of new deck
    - name: (String) The name of the deck
    - type: ("WHITE" or "BLACK") Is this a white or black deck?
- response: 200
  - content-type: 'application/json'
  - body: object
    - \_id: Database id of the returned deck
    - name: (String) Name of the deck
    - type: (String) The type of the deck ("WHITE" OR "BLACK")
    - cards: ([String]) Text content of each card in the deck
    - ownerId (String) Database id of the creator of the deck
- response: 400
  - body: object
    - error: (String) "Deck type must be either WHITE or BLACK"
- response: 400
  - body: object
    - error: (String) "Not enough unique cards in deck, WHITE decks must have at least 60"
- response: 400
  - body: object
    - error: (String) "Not enough unique cards in deck, BLACK decks must have at least 10"    
- response: 401
  - body: object
    - error: (String) "Access denied"
- response: 500
  - body: object
    - error: (String) Server error

```
$ curl -X PUT
       -H "Content-Type: `application/json`"
       -d '{"content":["new","deck","1","2","3","4","5","6","7","8"]],"name":"new deck","type":"BLACK"}
       https://shufflewithfriends.herokuapp.com/api/deck/5ca0848e898f5f29e5fa4625/'
```

### Delete

- description: Delete a specific deck from the database
- request: 'DELETE /api/deck/:id/'
- response: 200
  - content-type: 'application/json'
  - body: object
    - \_id: Database id of the returned deck
    - name: (String) Name of the deck
    - type: (String) The type of the deck ("WHITE" OR "BLACK")
    - cards: ([String]) Text content of each card in the deck
    - ownerId (String) Database id of the creator of the deck
- response: 404
  - body: object
    - error: (String) "Deck not found"
- response: 500
  - body: object
    - error: (String) Server error

```
$ curl -X DELETE
          https://shufflewithfriends.herokuapp.com/api/deck/5ca0848e898f5f29e5fa4625/
```

## Users API

### Read

- description: Get a specific user from database
- request: 'GET /api/user/:id/'
  - params:
    - id: Database id of desired user
  - headers:
    - token: Auth token of the user being requested, detailed user info returned if correct token is present
- response: 200
  - content-type: 'application/json'
  - body: object
    - givenName: (String) Given name of the user
    - familyName: (String) Family name of the user
    - friends: ([String]) Database ids of each of the users friends
    - photo: (String) Link to user's profile photo
- response: 200
  - content-type: 'application/json'
  - body: object
    - \_id: (String) Database id of user
    - googleIdL (String) GoogleId of user
    - email (String) email of user
    - token (String) current token of logged in user
    - givenName: (String) Given name of the user
    - familyName: (String) Family name of the user
    - friends: ([String]) Database ids of each of the users friends
    - photo: (String) Link to user's profile photo    
    - incomingRequests: ([String]) Database ids of users that want to add user as a friend
    - pendingRequests: ([String]) Database ids of users that user wants to add as a friend
- response: 404
  - body: object
    - error: (String) "User not found"
- response: 500
  - body: object
    - error: (String) Server error

```
$ curl https://shufflewithfriends.herokuapp.com/api/user/5c8a02a89f0f3cbb9a5b75f6/
```

- description: Get a user's friends from database
- request: 'GET /api/user/:id/friend/'
  - params:
    - id: Database id of user
- response: 200
  - content-type: 'application/json'
  - body: [object]
    - givenName: (String) Given name of the user
    - familyName: (String) Family name of the user
    - friends: ([String]) Database ids of each of the users friends
    - photo: (String) Link to user's profile photo    
- response: 404
  - body: object
    - error: (String) "User not found"
- response: 500
  - body: object
    - error: (String) Server error

```
$ curl https://shufflewithfriends.herokuapp.com/api/user/5c8a02a89f0f3cbb9a5b75f6/friend/
```

- description: Get a user's friends from database
- request: 'GET /api/user/:id/friend/requests/'
  - params:
    - id: Database id of user
  - query:
    - type: "Incoming" or "Pending". Retrieve incoming or pending friend requests
  - headers:
    - token: Auth token of user whose friend requests are to be queried
- response: 200
  - content-type: 'application/json'
  - body: [object]
    - givenName: (String) Given name of the user
    - familyName: (String) Family name of the user
    - friends: ([String]) Database ids of each of the users friends
    - photo: (String) Link to user's profile photo
- response: 400
  - body: object
    - error: (String) "Incorrect request type: '{type}'. Must be either 'incoming' or 'pending'."          
- response: 401
  - body: object
    - error: (String) "No auth token"
- response: 401
  - body: object
    - error: (String) "User not authorized"    
- response: 404
  - body: object
    - error: (String) "User not found"
- response: 500
  - body: object
    - error: (String) Server error

```
$ curl -H "token: `valid auth token`"
        https://shufflewithfriends.herokuapp.com/api/user/5c8a02a89f0f3cbb9a5b75f6/friend/requests?type="incoming"
```

- description: Get a user's decks from database
- request: 'GET /api/user/:id/decks/'
  - params:
    - id: Database id of user
- response: 200
  - content-type: 'application/json'
  - body: [object]
    - givenName: (String) Given name of the user
    - familyName: (String) Family name of the user
    - friends: ([String]) Database ids of each of the users friends
    - photo: (String) Link to user's profile photo
- response: 500
  - body: object
    - error: (String) Server error

```
$ curl https://shufflewithfriends.herokuapp.com/api/user/5c8a02a89f0f3cbb9a5b75f6/decks/
```

### Update

- description: Send, accept or decline a friend request to a user
- request: 'PUT /api/user/:id/friend/requests/'
  - params:
    - id: Database id of user who will be sent friend request or user whose friend request will be accepted/declined
  - body:
    - id: Database id of user who is sending friend request or user who is accepting/declining friend request
    - requestType: "SEND" or "ACCEPT" or "DECLINE", action to be taken in this request
  - headers:
    - token: auth token of user making request
- response: 200
  - content-type: 'application/json'
  - body: {}
- response: 400
  - body: object
    - error: (String) "Incorrect request type: '{requestType}'. Must be either 'SEND', 'ACCEPT', or 'DECLINE'."
- response: 400
  - body: object
    - error: (String) "Identical Ids"
- response: 404
  - body: object
    - error: (String) "User: {recipientId} has not sent a request to user: {senderId}"  
- response: 401
  - body: object
    - error: (String) "No auth token"
- response: 401
  - body: object
    - error: (String) "User not authorized"    
- response: 404
  - body: object
    - error: (String) "Sending user: {sendId} not found"
- response: 404
  - body: object
    - error: (String) "Recipient user: {recipientId} not found"    
- response: 500
  - body: object
    - error: (String) Server error

```
$ curl -X PUT
       -H "Content-Type: `application/json`, token: `valid auth token`"
       -d '{"id":"5ca1058e8b26cc3d22d76cc8", "requestType": "SEND"}
       https://shufflewithfriends.herokuapp.com/api/user/5c8a02a89f0f3cbb9a5b75f6/friend/'
```

## Lobby API

### Read

- description: Get data on a given lobby
- request: 'GET /api/lobby/3f10b0a40d/status'
  - params:
    - id: Id of the lobby queried
- response: 200
  - content-type: 'application/json'
  - body: (String) "game is already in progress"
- response: 200
  - content-type: 'application/json'
  - body: (String) "game lobby is full"
- response: 404

- description: Returns id of first available open lobby
- request: 'GET /api/lobby/join'
- response: 200
  - content-type: 'application/json'
  - body: (String) "{lobbyId}"
- response: 200
  - content-type: 'application/json'
  - body: (undefined)

- description: Creates a lobby and returns the id
- request: 'GET /api/create-room/'
- response: 200
  - content-type: 'application/json'
  - body: (String) "{lobbyId}"
