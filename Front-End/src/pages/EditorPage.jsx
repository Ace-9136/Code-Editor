import React, { useState,useRef, useEffect } from 'react'
import { Client } from '../components/Client';
import { Chat } from '../components/Chat'
import "../App.css";
import Editor from "../components/Editor";
import { initSocket } from '../socket';
import { useLocation, useNavigate, Navigate,useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ACTIONS from '../../Actions'; // Import all bindings
import { HiMiniChatBubbleBottomCenter } from "react-icons/hi2";



const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const {roomId}= useParams();
  const [clients,setClients]=useState([]);
  const [showChat, setShowChat] = useState(false);
  

  useEffect(() => {
    const init = async () => {
        socketRef.current = await initSocket();
        socketRef.current.on('connect_error', (err) => handleErrors(err));
        socketRef.current.on('connect_failed', (err) => handleErrors(err));

        function handleErrors(e) {
            console.log('socket error', e);
            toast.error('Socket connection failed, try again later.');
            reactNavigator('/');
        }

        socketRef.current.emit(ACTIONS.JOIN, {
            roomId,
            username: location.state?.username,
        });

        // Listening for joined event
        socketRef.current.on(
            ACTIONS.JOINED,
            ({ clients, username, socketId }) => {
                if (username !== location.state?.username) {
                    toast.success(`${username} joined the room.`);
                    console.log(`${username} joined`);
                }
                setClients(clients);
                socketRef.current.emit(ACTIONS.SYNC_CODE, {
                    code: codeRef.current,
                    socketId,
                });
            }
        );

        // Listening for disconnected
        socketRef.current.on(
            ACTIONS.DISCONNECTED,
            ({ socketId, username }) => {
                toast.success(`${username} left the room.`);
                setClients((prev) => {
                    return prev.filter(
                        (client) => client.socketId !== socketId
                    );
                });
            }
        );
    };
    init();
    return () => {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
    };
}, []); 

function toggleChat() {
  setShowChat(!showChat);
}

async function copyRoomId() {
  try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID has been copied to your clipboard');
  } catch (err) {
      toast.error('Could not copy the Room ID');
      console.error(err);
  }
}

function leaveRoom() {
  reactNavigator('/');
}

  
  if (!location.state){
    return <Navigate to="/"></Navigate>
  }

  return (
    <div className='mainWrap'>
      
      <div className="aside">
                <div className="asideInner">
                <div className='header'>
          <h1>
            Doc-Editor
          </h1>
        </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
  {clients.map((client) => (
    <Client
      key={client.socketId}
      username={client.username}
    />
  ))}
</div>

                </div>
                <button className="btn chatbtn" onClick={toggleChat} >Chat <HiMiniChatBubbleBottomCenter/></button>
                <button className="btn copyBtn" onClick={copyRoomId} >
                    Copy ROOM ID
                </button>
                <button className="btn leaveBtn" onClick={leaveRoom}>
                    Leave
                </button>
            </div>
      <div className='rightSide'>
        <Editor socketRef = {socketRef} roomId={roomId} onCodeChange={(code) => {
                        codeRef.current = code;
                    }}></Editor>
      
      <div className={`chatside ${showChat ? 'active' : ''}`}>
      <Chat key= {location.state?.socketId} socketRef = {socketRef} roomId={roomId} username={location.state.username}/>
    </div>
    </div>
    </div>
  )
}

export default EditorPage