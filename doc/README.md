# ShuffleWithFriends REST API Documentation

## Deck API

### Create

- Description: Create a new deck
- Request: 'POST /api/deck/'
  - content-type: 'application/json'
  - body: object
    - content: ([String]) List of the text of each card of new deck
    - name: (String) The name of the deck
    - type: ("WHITE" or "BLACK") Is this a white or black deck?
- Response: 200
  - content-type: 'application/json'
  - body: (String) the database object id of the new object
- Response: 400
  - body: object
    - error: (String) "Deck type must be either WHITE or BLACK"
- Response: 400
  - body: object
    - error: (String) "Not enough unique cards in deck, WHITE decks must have at least 60"
- Response: 400
  - body: object
    - error: (String) "Not enough unique cards in deck, BLACK decks must have at least 10"    
- Response: 401
  - body: object
    - error: (String) "Access denied"
- Response: 500
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

- Description: Get a specific deck form database
- Request: 'GET /api/deck/:id/'
  - params:
    - id: Database id of desired deck
- Response: 200
  - content-type: 'application/json'
  - body: object
    - \_id: Database id of the returned deck
    - name: (String) Name of the deck
    - type: (String) The type of the deck ("WHITE" OR "BLACK")
    - cards: ([String]) Text content of each card in the deck
    - ownerId (String) Database id of the creator of the deck
- Response: 404
  - body: object
    - error: (String) "Deck not found"
- Response: 500
  - body: object
    - error: (String) Server error

```
$ curl https://shufflewithfriends.herokuapp.com/api/deck/5ca0848e898f5f29e5fa4625/
```

### Update

- Description: Update a specific deck in database
- Request: 'PUT /api/deck/:id/'
  - params:
    - id: Database id of desired deck
  - body: object
    - content: ([String]) List of the text of each card of new deck
    - name: (String) The name of the deck
    - type: ("WHITE" or "BLACK") Is this a white or black deck?
- Response: 200
  - content-type: 'application/json'
  - body: object
    - \_id: Database id of the returned deck
    - name: (String) Name of the deck
    - type: (String) The type of the deck ("WHITE" OR "BLACK")
    - cards: ([String]) Text content of each card in the deck
    - ownerId (String) Database id of the creator of the deck
- Response: 400
  - body: object
    - error: (String) "Deck type must be either WHITE or BLACK"
- Response: 400
  - body: object
    - error: (String) "Not enough unique cards in deck, WHITE decks must have at least 60"
- Response: 400
  - body: object
    - error: (String) "Not enough unique cards in deck, BLACK decks must have at least 10"    
- Response: 401
  - body: object
    - error: (String) "Access denied"
- Response: 500
  - body: object
    - error: (String) Server error

```
$ curl -X PUT
       -H "Content-Type: `application/json`"
       -d '{"content":["new","deck","1","2","3","4","5","6","7","8"]],"name":"new deck","type":"BLACK"}
       https://shufflewithfriends.herokuapp.com/api/deck/5ca0848e898f5f29e5fa4625/'
```

### Delete

- Description: Delete a specific deck from the database
- Request: 'DELETE /api/deck/:id/'
- Response: 200
  - content-type: 'application/json'
  - body: object
    - \_id: Database id of the returned deck
    - name: (String) Name of the deck
    - type: (String) The type of the deck ("WHITE" OR "BLACK")
    - cards: ([String]) Text content of each card in the deck
    - ownerId (String) Database id of the creator of the deck
- Response: 404
  - body: object
    - error: (String) "Deck not found"
- Response: 500
  - body: object
    - error: (String) Server error

```
$ curl -X DELETE
          https://shufflewithfriends.herokuapp.com/api/deck/5ca0848e898f5f29e5fa4625/
```

## Users API

### Read

- Description: Get a specific user from database
- Request: 'GET /api/user/:id/'
  - params:
    - id: Database id of desired user
  - headers:
    - token: Auth token of the user being requested, detailed user info returned if correct token is present
- Response: 200
  - content-type: 'application/json'
  - body: object
    - givenName: (String) Given name of the user
    - familyName: (String) Family name of the user
    - friends: ([String]) Database ids of each of the users friends
    - photo: (String) Link to user's profile photo
- Response: 200
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
- Response: 404
  - body: object
    - error: (String) "User not found"
- Response: 500
  - body: object
    - error: (String) Server error

```
$ curl https://shufflewithfriends.herokuapp.com/api/user/5c8a02a89f0f3cbb9a5b75f6/
```

- Description: Get a user's friends from database
- Request: 'GET /api/user/:id/friend/'
  - params:
    - id: Database id of user
- Response: 200
  - content-type: 'application/json'
  - body: [object]
    - givenName: (String) Given name of the user
    - familyName: (String) Family name of the user
    - friends: ([String]) Database ids of each of the users friends
    - photo: (String) Link to user's profile photo    
- Response: 404
  - body: object
    - error: (String) "User not found"
- Response: 500
  - body: object
    - error: (String) Server error

```
$ curl https://shufflewithfriends.herokuapp.com/api/user/5c8a02a89f0f3cbb9a5b75f6/friend/
```

- Description: Get a user's friends from database
- Request: 'GET /api/user/:id/friend/requests/'
  - params:
    - id: Database id of user
  - query:
    - type: "Incoming" or "Pending". Retrieve incoming or pending friend requests
  - headers:
    - token: Auth token of user whose friend requests are to be queried
- Response: 200
  - content-type: 'application/json'
  - body: [object]
    - givenName: (String) Given name of the user
    - familyName: (String) Family name of the user
    - friends: ([String]) Database ids of each of the users friends
    - photo: (String) Link to user's profile photo
- Response: 400
  - body: object
    - error: (String) "Incorrect request type: '{type}'. Must be either 'incoming' or 'pending'."          
- Response: 401
  - body: object
    - error: (String) "No auth token"
- Response: 401
  - body: object
    - error: (String) "User not authorized"    
- Response: 404
  - body: object
    - error: (String) "User not found"
- Response: 500
  - body: object
    - error: (String) Server error

```
$ curl -H "token: `valid auth token`"
        https://shufflewithfriends.herokuapp.com/api/user/5c8a02a89f0f3cbb9a5b75f6/friend/requests?type="incoming"
```

- Description: Get a user's decks from database
- Request: 'GET /api/user/:id/decks/'
  - params:
    - id: Database id of user
- Response: 200
  - content-type: 'application/json'
  - body: [object]
    - givenName: (String) Given name of the user
    - familyName: (String) Family name of the user
    - friends: ([String]) Database ids of each of the users friends
    - photo: (String) Link to user's profile photo
- Response: 500
  - body: object
    - error: (String) Server error

```
$ curl https://shufflewithfriends.herokuapp.com/api/user/5c8a02a89f0f3cbb9a5b75f6/decks/
```

### Update

- Description: Send, accept or decline a friend request to a user
- Request: 'PUT /api/user/:id/friend/requests/'
  - params:
    - id: Database id of user who will be sent friend request or user whose friend request will be accepted/declined
  - body:
    - id: Database id of user who is sending friend request or user who is accepting/declining friend request
    - requestType: "SEND" or "ACCEPT" or "DECLINE", action to be taken in this request
  - headers:
    - token: auth token of user making request
- Response: 200
  - content-type: 'application/json'
  - body: {}
- Response: 400
  - body: object
    - error: (String) "Incorrect request type: '{requestType}'. Must be either 'SEND', 'ACCEPT', or 'DECLINE'."
- Response: 400
  - body: object
    - error: (String) "Identical Ids"
- Response: 404
  - body: object
    - error: (String) "User: {recipientId} has not sent a request to user: {senderId}"  
- Response: 401
  - body: object
    - error: (String) "No auth token"
- Response: 401
  - body: object
    - error: (String) "User not authorized"    
- Response: 404
  - body: object
    - error: (String) "Sending user: {sendId} not found"
- Response: 404
  - body: object
    - error: (String) "Recipient user: {recipientId} not found"    
- Response: 500
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

- Description: Get data on a given lobby
- Request: 'GET /api/lobby/3f10b0a40d/status'
  - params:
    - id: Id of the lobby queried
- Response: 200
  - content-type: 'application/json'
  - body: (String) "game is already in progress"
- Response: 200
  - content-type: 'application/json'
  - body: (String) "game lobby is full"
- Response: 404

- Description: Returns id of first available open lobby
- Request: 'GET /api/lobby/join'
- Response: 200
  - content-type: 'application/json'
  - body: (String) "{lobbyId}"
- Response: 200
  - content-type: 'application/json'
  - body: (undefined)

- Description: Creates a lobby and returns the id
- Request: 'GET /api/create-room/'
- Response: 200
  - content-type: 'application/json'
  - body: (String) "{lobbyId}"
