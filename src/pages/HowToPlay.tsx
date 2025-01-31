import React from "react";
import "../HowToPlay.css";
import { useNavigate } from "react-router-dom";

type LongBreakProps = {length: number}
function LongBreak({ length }: LongBreakProps) {
    return (
        <>
            {new Array(length).map(() => <br />)}
        </>
    )
}

export default function HowToPlay() {
    const navigate = useNavigate();
    return (
        <div className="howtoplay-background">
            <h1>How to play Chess 2: The Long-Awated Sequel to Chess</h1>
            <h2>To get the abridged version, click <a href="https://github.com/Korn-Jacob/chess-2/blob/302eb2f90eced02dbc111a264bc6554b74d82c37/README.md">here</a>.</h2>
            <LongBreak length={10} />
            <h1>Changes from Chess 1:</h1>
            <h2>Patch notes:</h2>
            <h3>Chess 2 Comes with a variety of bug fixes to fix the various issues present in chess 1. Here they are:</h3>
            <ul>
                <li>Fixed a bug where pawns will suddenly become another piece when they reach the end of the board</li>
                <li>Fixed the famous 'Castling' bug where the king can teleport behind a rook (why did the devs not patch this one?)</li>
                <li>Fixed a strange obscure bug wherein a pawn could capture another pawn next to it "in passing" if it moved two squares the previous move (or this one? this is why we needed a sequel)</li>
                <li>And, the most important one: removed the h5 square. It was a menace to society and needed to die. The fact that it has lived here this long has been a disgrace.</li>
            </ul>
            <h2>New Features:</h2>
            <ul>
                <li>Board Expansion: the Board is 10x10 instead of 8x8. Canonically, this implies that the pieces now have 10 fingers instead of 8.</li>
                <li>There are no longer white and black teams. They have been replaced with the Red Republic and Blue Empire</li>
                <li>The game's starting player is randomized. No team is superior to another.</li>
                <li>There are no more Kings.</li>
                <ul>
                    <li>The Blue Empire has two Queens instead. (diversity win)</li>
                    <li>The Red Republic overthrew their monarchy and replaced them with a President and a Finance Minister</li>
                </ul>
                <li>There's an economy system now. Both players can see their finances on the left of the board(s).</li>
                <ul>
                    <li>The economy system consists of three values:</li>
                    <ul>
                        <li><b>Bank:</b> How much money the player has. This can be spent in shops. Debt is possible but will decrease popular opinion.</li>
                        <li><b>Tax:</b> How much money the player makes each turn. This is multiplied by the popular opinion. There is a button to force the increase of this, but it reduces popular opinion and costs 1 turn.</li>
                        <li><b>Popular opinion:</b> The populace's opinion of the war. If this falls below 25% for Red, they lose. If it falls below 0% for Blue while they are in debt, they lose.</li>
                    </ul>
                </ul>
                <li>There's a shop in the middle of the board. Shop tiles are marked with a yellow tint. </li>
                <li>Items are in two types, upgrades and actions. Upgrades upgrade a piece, actions do immediate things</li>
                <ul>
                    <li>The Walking Stick (Upgrade): Allows the upgraded piece to move one more tile forward as a pawn would. Costs 100</li>
                    <li>The Shield (Upgrade): Protects the upgraded piece from two Archer shots. Costs 250</li>
                    <li>The Bomb (Upgrade): When the piece dies, it will perminantly kill all other pieces in a 1-tile radius (just like atomic chess). Costs 500</li>
                    <li>Conscription (Action): Costs 1000. Summons a new pawn into your army. Harms popular opinion.</li>
                </ul>
                <li>When pieces die, they get banished to the afterlife in the underworld. The underworld is a new board that dead pieces live in. If they die there, they die forever.</li>
                <li>The underworld has its own shop, with these items:</li>
                <ul>
                    <li>Revive (Action): The piece buying this immediately revives into the main board. Costs 666</li>
                    <li>Gamble (Action): Spend 1000. 50/50 chance you double that thousand or lose it. Great in a pinch.</li>
                    <li>Financial Education (Upgrade): Allows the piece to be used like a light version of the Red Republic's finance minister. Costs 1000</li>
                    <li>Mass Revive (Action): Revives all pieces. Costs 6666</li>
                </ul>
            </ul>
            <h2>New Pieces:</h2>
            <ul>
                <li><b>The Elephant:</b></li>
                <img src="/images/red_Elephant.png" alt="ELEPHANT"/>
                <p>The Elephant works just like the Horse from Chess 1, but has the ability to capture pieces adjacent to it as well.</p>
                <li><b>The Archer:</b></li>
                <img src="/images/red_Archer.png" alt="ARCHER"/>
                <p>The Archer is immobile, but has the ability to shoot any piece within 3 tiles away from it. The shot piece will die unless protected by a shield. The tiles that can be shot by the Archer are revealed when clicked on.</p>
                <li><b>The Wizard and the Pope:</b></li>
                <img src="/images/red_Wizard.png" alt="WIZARD"/> <img src="/images/red_Pope.png" alt="POPE"/>
                <p>
                    Since the religious tension between the two factions has increased, the bishops got replaced with rival popes. The remaining Bishop learned Wizardry.<br />
                    The Wizard doesn't do much more than the Bishop does, but can travel to the underworld and back. When it dies once, it dies forever.<br />
                    The Pope moves like the queen from Chess 1
                </p>
                <li><b>The President:</b></li>
                <img src="/images/red_President.png" alt="PRESIDENT"/>
                <p>The President is the leader of the Red Empire. It moves like the king from Chess 1. If it dies, Red's popular opinion will lower significantly and another pawn will be elected to the presidency. If there are no pawns availible, Red loses.</p>
                <li><b>The Finance Minister:</b></li>
                <img src="/images/red_FinanceMinister.png" alt="FINANCE MINISTER" />
                <p>The Finance Minister cannot move. When you click on it, you can click on the dollar sign symbol above it to use your turn to increase taxes without risk of losing popular opinion.</p>
                <li><b>The Queens:</b></li>
                <img src="/images/blue_Queen.png" alt="QUEEN" />
                <p>The Queens cannot move. If they all die and then die again in the underworld, Blue loses.</p>
            </ul>
            <button onClick={() => navigate("/")} className="back-button">Back</button>
        </div>
    )
}
