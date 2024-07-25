import { useEffect, useState } from 'react';
import './Chat.css'

export enum MessageCode {
    NEW_USER_JOINED,
	USER_LEFT,
	MESSAGE_SENT,
}

export enum MessageType {
    SENT,
    RECEIVED,
    // USER_JOINED,
    // USER_LEFT
}

interface ISocketMessage<T> {
    code: MessageCode,
    data: T
}

interface IMessageProp {
    message: Message;
}

export class Message {
    from: string;
    text: string;
    type: MessageType

    constructor(from: string, text: string, type: MessageType) {
        this.from = from;
        this.text = text;
        this.type = type;
    }
}

function SentMessage({ message }: IMessageProp) {
    return (
        <div className="message sent-message">
            <p className='text'>{message.text}</p>
        </div>
    )
}

function RecvMessage({ message }: IMessageProp) {
    return (
        <div className="message recv-message">
            <p className='username'>{message.from}</p>
            <p className='text'>{message.text}</p>
        </div>
    )
}

function MessageComponent({ message }: IMessageProp) {
    switch(message.type) {
        case MessageType.SENT: return SentMessage({ message });
        case MessageType.RECEIVED: return RecvMessage({ message });
    }
}


interface IChatInputProp {
    addMessage: (message: Message) => void
}

interface IChatBoxProp extends IChatInputProp {
    messages: Message[]
}

function ChatInput({ addMessage }: IChatInputProp) {

    const [message, setMessage] = useState("")

    function handleButtonClick(e: any) {
        e.preventDefault();

        
        const newMessage = new Message(
            "",
            message,
            MessageType.SENT
        )

        addMessage(newMessage)

        console.log(message)
        setMessage("")
    }

    return (
        <form className="chat-input">
            <input type="text" name="message-text" id="message-text" value={message} onChange={e => setMessage(e.target.value)}/>
            <button onClick={handleButtonClick}>Send</button>
        </form>
    )
}

export function ChatBox({ messages, addMessage }: IChatBoxProp) {
    return (
        <div className="chat-box">
            <div className="messages-container">
                {
                    messages.map((msg, index) => <MessageComponent key={index} message={msg}/>)
                }
            </div>
            <div className="input-container">
                <ChatInput addMessage={addMessage}/>
            </div>
        </div>
    )
}