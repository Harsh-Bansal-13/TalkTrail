import { Button } from "@chakra-ui/button";
import { Route, Routes } from "react-router-dom";
import HomePage from "./components/HomePage";
import ChatPage from "./components/ChatPage";
import "./App.css";
import axios from "axios";
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage></HomePage>}></Route>
        <Route path="/chats" element={<ChatPage></ChatPage>}></Route>
      </Routes>
    </div>
  );
}

export default App;
