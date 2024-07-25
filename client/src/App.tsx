import { useEffect, useRef, useState } from 'react';
import './App.css'
import { ChatBox, Message, MessageCode, MessageType } from './chat/ChatBox';

function App() {
  const WS_URL = "ws://localhost/rooms";
  const connection: React.MutableRefObject<any> = useRef(null);

  // const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])

  function addMessage(message: Message) {
    setMessages(prevState => [...prevState, message]);

    //scroll down to last message
    // const messagesContainer = document.querySelector('.messages-container');
    // if(messagesContainer) {
    //   messagesContainer.scrollTop = messagesContainer.scrollHeight
    // }
}

  useEffect(() => { 
    if(!connection.current) {
      const query = window.location.search;
      const ws = new WebSocket(`${WS_URL}${query}`);
      ws.onopen = _ => console.log("Connected");
      ws.onmessage = e => {

        const parsed = JSON.parse(e.data);
        const code = parsed.code;

        if(code === MessageCode.MESSAGE_SENT) {
          const newMessage = new Message(parsed.data.username, parsed.data.text, MessageType.RECEIVED);
          addMessage(newMessage)
        }
      }
  
      connection.current = ws;
    }
  }, [])

  return (
    <>
      <div className="container">
        <div className="video-container"></div>
        <div className="chat-container">
          <ChatBox messages={messages} addMessage={addMessage}/>
        </div>
      </div>
    </>
  )
}

export default App
