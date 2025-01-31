import React from "react"
import { useNavigate } from "react-router-dom"
import "./Main.css"

export default function Main() {
    const navigate = useNavigate();
    return (
    <div className="main-background">
        <h1 className="title">Chess 2: The Long-Awaited Sequel to Chess</h1>
        <div className="startbuttons">
            <button onClick={() => navigate("/play")}>Play Game!</button>
            <button onClick={() => navigate("/howtoplay")}>How to play</button>
        </div>
    </div>
   )
}