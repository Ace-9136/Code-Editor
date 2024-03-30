import React, { useEffect, useState, useRef } from 'react';
import Avatar from 'react-avatar';
import IconButton from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import ACTIONS from '../../Actions';


export const Chat = ({ socketRef, roomId, username }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const chatMessagesRef = useRef(null); // Ref for the chat messages container


  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  useEffect(() => {
    // Fetch historical messages when the component mounts
      if(socketRef.current){
        socketRef.current.on(ACTIONS.HISTORICALMESSAGE, function(data) {
          setMessages(data);
      });
    };
  }, [socketRef.current]);
  
useEffect( ()=>{
  if(socketRef.current){
    socketRef.current.on(ACTIONS.MESSAGE, function(data) {
      setMessages(prevMessages => [...prevMessages, data]);
      
  });
  }  
},[socketRef.current])

useEffect(() => {
  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };
  const scrollTimeout = setTimeout(scrollToBottom, 50); // Adjust the delay as needed
  return () => clearTimeout(scrollTimeout);
}, [messages]);

  const handleSubmit = () => {
    
    if (message!==''){
      console.log("Message submitted:", message);
      socketRef.current.emit(ACTIONS.MESSAGE, {
        roomId,
        username,
        message,
        timestamp: new Date()
    });
    }
    setMessage('');
  };

  const handleKeyPress = (event) => {
    // If Enter key is pressed and the message is not empty, submit it
    if (event.key === 'Enter' && message.trim() !== '') {
      handleSubmit();
    }
  };
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  };
  return date.toLocaleString('en-US', options);
  };

  return (
    <div>
      <div className='heading'>
        Messages
      </div>
      
      <div className='chat-messages' ref={chatMessagesRef}>
        {/* Render messages from state */}
        {messages.map((msg, index) => (
          <div key={index} className='message'>
            <div className='msgheader'>
            <Avatar name={msg.username} size="30" round={true} />
            <div >{msg.username}</div>
            </div>
            <div className='message-content'>
              <div className='text'>{msg.message}</div>
              <div className='timestamp'>{formatTimestamp(msg.timestamp)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className='chatBottom'>
        <input
          type='text'
          value={message}
          onChange={handleMessageChange}    
          onKeyPress={handleKeyPress}
          placeholder='Type your message...'
          className='textbox' 
        />
        <IconButton  onClick={handleSubmit} color="success" aria-label="delete" size="50">
        <SendIcon fontSize="large" />
      </IconButton>
        
      </div>
    </div>
  );
};
