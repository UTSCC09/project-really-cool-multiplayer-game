import React from 'react';

class ChatWindow extends React.Component {
  constructor(props) {
    super(props);
    this.sendMessage = this.sendMessage.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.socket = props.socket
    this.state = { messages: []}; // message = {user: blah, content: blah}
    this.socket.on('chat message', (message) => {
      console.log(`received message: ${message}`)
      let messages = this.state.messages.slice();
      messages.push(message)
      this.setState({messages});
    });
  }

  sendMessage(message) {
    if (message !== '') {
      console.log(`sending message: ${message}`)
      this.socket.emit('chat message', message);
    }
  }

  scrollToBottom() {
    // https://stackoverflow.com/questions/42670121/scroll-to-bottom-after-componentdidupdate
    var el = this.refs.chatMessages;
    el.scrollTop = el.scrollHeight;
  }

  // https://www.pubnub.com/tutorials/react/chat-message-history-and-infinite-scroll/#scroll-bottom
  componentWillUpdate(nextProps, nextState) {
    this.newMessage = nextState.messages.length !== this.state.messages.length;
    if (this.newMessage) {
      const { chatMessages } = this.refs;
      const scrollPos = chatMessages.scrollTop;
      const scrollBottom = (chatMessages.scrollHeight - chatMessages.clientHeight);
      this.scrollAtBottom = (scrollBottom <= 0) || (scrollPos === scrollBottom);
    }
  }
  componentDidUpdate() {
    if (this.scrollAtBottom) {
      this.scrollToBottom();
    }
  }
  
  render() {
    let messages = this.state.messages.map((message) => {
      console.log(`user: ${message.user}, content: ${message.content}`)
      return (<ChatMessage user={message.user} content={message.content} />)
    });
    return (
      <div className="position-fixed" style={{bottom: 0, left: "10px"}}>
        <div id="chat" ref="chatMessages">
          {messages}
        </div>
        <ChatForm onSubmit={this.sendMessage}/>
      </div>
    )
  }
}

function ChatMessage(props) {
  return (
    <div>
      <span className="text-primary">{props.user}:</span><span className="text-black-50 ml-2">{props.content}</span>
    </div>
  );
}

class ChatForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { message: '' };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ message: event.target.value });
  }

  handleSubmit(event) {
    this.props.onSubmit(this.state.message);
    this.setState({message: ''});
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} className="form-inline">
        <input type="text" placeholder="Enter a message" value={this.state.message} onChange={this.handleChange} className="form-control mb-2 mr-sm-2"/>
        {/* <button className="btn btn-primary mb-2">Send Message</button> */}
      </form>
    );
  }
}

export default ChatWindow;
