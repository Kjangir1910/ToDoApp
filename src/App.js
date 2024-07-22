import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import TodoList from "./components/TodoList";

const App = () => {
  return (
    <div className="w-[100vh] flex justify-center items-center">
      <Router>
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/todolist" element={<TodoList />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
