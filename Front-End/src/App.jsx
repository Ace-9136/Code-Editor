import './App.css';
import Home from "./pages/Home";
import {Routes,Route} from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import EditorPage from './pages/EditorPage';
function App() {

  return (
    <>
    <div><Toaster
    position="top-right"
    reverseOrder={false}
  /></div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor/:roomId" element={<EditorPage />} />
        </Routes>
    </>
  )
}

export default App;
