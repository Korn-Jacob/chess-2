import React, { useState } from "react"
import Board, { BoardInstance, Position, TileData } from "./components/Board.tsx"
import { Archer, Elephant, FinanceMinister, Pawn, Piece, Pope, position, President, Queen, Rook, Wizard } from "./types/pieces.ts";
import { TileType } from "./components/Tile.tsx";
import Shop, { ShopInstance } from "./components/Shop.tsx";

export class GameInstance {
    turn: string;
    boards: BoardInstance[];
    selectedPiece: Piece | null;
    winner: string | null;
    blueFinances = new FinancialSituation(110, 5, 0.75);
    redFinances = new FinancialSituation(100, 5, 1);
    constructor() {
        this.turn = Math.random() < 0.5 ? "red" : "blue";
        this.boards = [];
        this.selectedPiece = null;
        this.winner = null;
    }
    clearSelected(): void {
        this.selectedPiece = null;
        for (let board of this.boards) {
            board.clearSelected();
        }
    }
    endTurn(): void {
        this.clearSelected();
        this.turn = this.turn === "red" ? "blue" : "red";

        // upkeep stuff
        this.finances(this.turn).bank += Math.floor(this.finances(this.turn).popularOpinion * this.finances(this.turn).tax);

        let redWins: boolean = false;
        for (let board of this.boards) {
            if (board.hasQueens()) {
                redWins = false;
                break;
            }
            redWins = true;
        }
        if (redWins) {
            this.winner = "red";
        }
        
        // blue wins if red loses popular opinion
        if (this.redFinances.popularOpinion < 0.25) {
            this.winner = "blue";
        }

        // if in debt, lose popular opinion
        if (this.redFinances.bank <= 0) {
            this.redFinances.decreasePopularOpinion(0.1);
        }
        if (this.blueFinances.bank <= 0) {
            this.blueFinances.decreasePopularOpinion(0.1);
        }

        // if blue is in debt and has no popular opinion, they lose
        if (this.blueFinances.bank < 0 && this.blueFinances.popularOpinion <= 0) {
            this.winner = "red";
        }
    }
    addBoard(board: BoardInstance): void {
        this.boards.push(board);
    }
    getBoard(name: string): BoardInstance {
        return this.boards.filter(board => board.name === name)[0];
    }
    interdimensionalTravel(boardFrom: BoardInstance, boardTo: BoardInstance, position: Position) {
        if (boardTo.data[position.row][position.column].piece)
            boardTo.killPiece(position);
        boardTo.data[position.row][position.column].piece = boardFrom.data[position.row][position.column].piece;
        boardFrom.data[position.row][position.column].piece = null;
        boardTo.data[position.row][position.column].piece!.board = boardTo;
        this.endTurn();
    }
    finances(color: string): FinancialSituation {
        if (color === "red") return this.redFinances;
        if (color === "blue") return this.blueFinances;
        throw new Error("finances must be of a team");
    }
}

export class FinancialSituation {
    bank: number;
    tax: number;
    popularOpinion: number;
    constructor(bank: number, tax: number, popularOpinion: number) {
        this.bank = bank;
        this.tax = tax;
        this.popularOpinion = popularOpinion;
    }
    increasePopularOpinion(popularOpinion: number): void {
        this.popularOpinion = Math.min(this.popularOpinion + popularOpinion, 1);
    }
    decreasePopularOpinion(popularOpinion: number): void {
        this.popularOpinion = Math.max(this.popularOpinion - popularOpinion, 0);
    }
    changePopularOpinion(popularOpinion: number): void {
        if (popularOpinion < 0) this.decreasePopularOpinion(popularOpinion);
        else this.increasePopularOpinion(popularOpinion);
    }
}

let boardData: TileData[][] = [];

for (let i = 0; i < 10; i++) {
    let row: TileData[] = [];
    for (let j = 0; j < 10; j++) {
        let position: Position = {row: i, column: j};
        row.push({ position: position, piece: null, isRemoved: position.row === 5 && position.column === 7, tileModifier: null, tileType: position.row >= 4 && position.row <= 5 && position.column >= 3 && position.column <= 6 ? TileType.SHOP : TileType.NORMAL});
    }
    boardData.push(row);
}
const game = new GameInstance();
const board = new BoardInstance(game, "mainBoard", boardData);
board.data[0][9].piece = new Rook(board, position(0,9), "red");
board.data[0][8].piece = new Elephant(board, position(0,8), "red");
board.data[0][7].piece = new Archer(board, position(0,7), "red");
board.data[0][6].piece = new Pope(board, position(0,6), "red");
board.data[0][5].piece = new President(board, position(0,5));
board.data[0][4].piece = new FinanceMinister(board, position(0,4));
board.data[0][3].piece = new Wizard(board, position(0,3), "red");
board.data[0][2].piece = new Archer(board, position(0,2), "red");
board.data[0][1].piece = new Elephant(board, position(0,1), "red");
board.data[0][0].piece = new Rook(board, position(0,0), "red");
for (let i = 0; i < 10; i++) {
    board.data[1][i].piece = new Pawn(board, position(1,i), "red");
}
board.data[9][9].piece = new Rook(board, position(9,9), "blue");
board.data[9][8].piece = new Elephant(board, position(9,8), "blue");
board.data[9][7].piece = new Archer(board, position(9,7), "blue");
board.data[9][6].piece = new Wizard(board, position(9,6), "blue");
board.data[9][5].piece = new Queen(board, position(9,5));
board.data[9][4].piece = new Queen(board, position(9,4));
board.data[9][3].piece = new Pope(board, position(9,3), "blue");
board.data[9][2].piece = new Archer(board, position(9,2), "blue");
board.data[9][1].piece = new Elephant(board, position(9,1), "blue");
board.data[9][0].piece = new Rook(board, position(9,0), "blue");
for (let i = 0; i < 10; i++) {
    board.data[8][i].piece = new Pawn(board, position(8,i), "blue");
}
game.addBoard(board);

const underworldData: TileData[][] = [];
for (let i = 0; i < 10; i++) {
    let toAppend: TileData[] = [];
    for (let j = 0; j < 10; j++) {
        toAppend.push({position: position(i,j), piece: null, isRemoved: false, tileModifier: null, tileType: i >= 4 && i <= 5 && j >= 3 && j <= 6 ? TileType.SHOP : TileType.NORMAL});
    }
    underworldData.push(toAppend);
}
const underworld = new BoardInstance(game, "underworld", underworldData);
game.addBoard(underworld);

export default function Main() {
    const [refresh, setRefresh] = useState(0);
    const [shop, setShop] = useState<ShopInstance>(null);

    const taxIncrease = () => {
        game.finances(game.turn).tax += 10;
        game.finances(game.turn).decreasePopularOpinion(0.05);
        game.endTurn();
    }
    return (
        <div className="main" onClick={() => {setRefresh(refresh+1)}}> 
            {game.winner ? 
                <div className="winscreen"><p style={{color: game.winner}}>{game.winner.toUpperCase()} WINS!</p></div>
            :<></>}
            {shop ? 
                <Shop name={shop.name} buyer={shop.buyer} exit={shop.exit}/> 
            : <></>}
            <div className="finances">
                <p>{game.turn.charAt(0).toUpperCase() + game.turn.substring(1)}'s Finances</p>
                <p><b>Bank:</b> {game.finances(game.turn).bank}</p>
                <p><b>Tax:</b> {game.finances(game.turn).tax}/turn <button onClick={taxIncrease} title="(costs popular opinion and ends turn)">Force increase</button></p>
                <p><b>Popular Opinion:</b> {Math.round(game.finances(game.turn).popularOpinion * 100)}%</p>
            </div>
            <p style={{color: board.game.turn}}>It is {board.game.turn}'s turn!</p>
            <Board board={board} shop={(shop: ShopInstance) => setShop(shop)}/>
            <hr></hr>
            {underworld.hasPieces() ? 
            <Board board={underworld} shop={(shop: ShopInstance) => setShop(shop)}/>
            : <></>}
        </div>
    )
    
}