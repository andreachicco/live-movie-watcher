import { createContext, useEffect, useRef, useState } from 'react';
import './App.css'
import { ChatBox, Message, MessageCode, MessageType } from './chat/ChatBox';

export const WebSocketCtx = createContext<WebSocket | null>(null) 

function App() {
  const WS_URL = "ws://localhost/rooms";
  const connection: React.MutableRefObject<any> = useRef(null);
  const [connectionState, setConnectionState] = useState(null)

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
        
        if(code === MessageCode.NEW_USER_JOINED) { console.log(`${parsed.data} joined the room`) }
        if(code === MessageCode.USER_LEFT) { console.log(`${parsed.data} left the room`) }
        
        if(code === MessageCode.MESSAGE_SENT) {
          const newMessage = new Message(parsed.data.username, parsed.data.text, MessageType.RECEIVED);
          addMessage(newMessage)
        }
      }
      
      connection.current = ws;
      setConnectionState(connection.current)
    }
  }, [messages])

  return (
    <>
    <WebSocketCtx.Provider value={connectionState}>
      <div className="container">
        <div className="video-container"></div>
        <div className="chat-container">
          <ChatBox messages={messages} addMessage={addMessage}/>
        </div>
      </div>
    </WebSocketCtx.Provider>
    </>
  )
}

export default App
