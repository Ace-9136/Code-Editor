import React, { useState,useRef, useEffect } from 'react'
import { Client } from '../components/Client';
import "../App.css";
import Editor from "../components/Editor";
import { initSocket } from '../socket';
import { useLocation, useNavigate, Navigate,useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ACTIONS from '../../Actions'; // Import all bindings


const EditorPage = () => {
  const socketRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const {roomId}= useParams();


  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      console.log("Socket initialized:", socketRef.current);
  
      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));
  
      function handleErrors(e) {
        console.log("Error: ", e);
        toast.error('Socket connection failed, try again later.');
        reactNavigator('/');
      }
  
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });
    };
  
    init();
  }, []); // Empty dependency array to run the effect only once on mount
  
  const [clients,setClients]=useState([{sockedId:1,username:"sahil"},{sockedId:2,username:"patil"},{sockedId:3,username:"new User"}]);
  
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
                                key={client.sockedId}
                                username={client.username}
                            />
                        ))}
                    </div>
                </div>
                <button className="btn copyBtn" >
                    Copy ROOM ID
                </button>
                <button className="btn leaveBtn" >
                    Leave
                </button>
            </div>
      <div className='rightSide'>
        <Editor></Editor>
      </div>
    </div>
  )
}

export default EditorPage