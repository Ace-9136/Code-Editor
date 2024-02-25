import React from 'react';
import { useState } from 'react';
import {Card,Typography,Button, TextField}from '@mui/material';
import "../App.css";
import {v4 as uuidV4} from 'uuid';
import toast from "react-hot-toast";
import {useNavigate} from 'react-router-dom'

const Home = () => {
  const [roomId, setRoomId] = useState("")
  const [username, setUsername] = useState("")
  const navigate= useNavigate();

  const createNewRoom = (e)=>{
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success("Created a new room");
  }

  const joinRoom =()=>{
    if (!roomId || !username){
      toast.error("Room Id and username is required");
      return;
    }
    navigate(`/editor/${roomId}`,{
      state:{
        username,
      },
    });
  }

  const handleInputEnter=(e)=>{
    if (e.code==='Enter'){
      joinRoom();
    }
  }
  
  return (
    <div className='HomePageWrapper'>
      <div>
        <Typography variant={"h4"} style={{display:"flex",justifyContent:'center'}} color={"#4aee88"}>
                Welcome to Doc-editor
        </Typography>
      
      <Card variant={"outlined"} style={{width: 400, padding: 20,  color: "#ffffff",backgroundColor: "#11161b",display:'flex',flexDirection:"column"}}>
          <Typography variant={"subtitle1"}>
                Paste Invitation ROOM ID
                </Typography>
                <br/>
                <input className='inputGroup'
                    onChange={(event) => {
                        setRoomId(event.target.value);
                    }}
                    placeholder="RoomId"
                    value={roomId}
                    onKeyUp={handleInputEnter}
                />
                <br/><br/>
                <input className='inputGroup'
                    onChange={(e) => {
                        setUsername(e.target.value);
                    }}
                    placeholder='Username'
                    value={username}
                    onKeyUp={handleInputEnter}
                />
                <br/><br/>

                <button className='joinbtn' onClick={joinRoom}> Join</button>
                <Typography variant={"subtitle1"} style={{marginTop:5}}>
                If you don't have a invitation then create <a onClick={createNewRoom} className='newRoomButton'>new room </a>
                </Typography>
            </Card>
          </div>
            <footer>
                <h4>
                    Built with 💛 &nbsp; by &nbsp;
                    <a href="https://github.com/Ace-9136">Ace-9136</a>
                </h4>
            </footer>
          </div>
  );
}
export default Home