import React, { useState } from "react";
import Tile, { TileModifier, TileType } from "./Tile.tsx";
import { FinanceMinister, Pawn, Piece, President, Queen, Wizard } from "../types/pieces.ts";
import { GameInstance } from "../Main.tsx";

export interface Position {
    row: number,
    column: number
}

export type TileData = { position: Position, piece: Piece | null, isRemoved: boolean, tileModifier: TileModifier | null, tileType: TileType };

export class BoardInstance {
    game: GameInstance;
    name: string;
    data: TileData[][];
    setTurn: Function;
    constructor(game: GameInstance, name: string, data: TileData[][]) {
        this.game = game;
        this.name = name;
        this.data = data;
    }
    hasPieces(): boolean {
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (this.data[i][j].piece) {
                    return true;
                }
            }
        }
        return false;
    }
    hasQueens(): boolean {
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (this.data[i][j].piece instanceof Queen) {
                    return true;
                }
            }
        }
        return false;
    }
    promoteRandomPawn(): void {
        let pawns: Pawn[] = [];
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (this.data[i][j].piece instanceof Pawn && this.data[i][j].piece?.color === "red") {
                    pawns.push(this.data[i][j].piece as Pawn);
                }
            }
        }
        if (pawns.length === 0) {
            this.game.winner = "blue";
            return;
        }
        let prespos: Position = pawns[Math.floor(Math.random() * pawns.length)].position;
        this.data[prespos.row][prespos.column].piece = new President(this, prespos);
    }
    
    showCircle(position: Position): void {
        this.data[position.row][position.column].tileModifier = this.data[position.row][position.column].piece ? TileModifier.X_ED : TileModifier.CIRCLED;
    }
    showArcherTile(position: Position, color: string): void {
        this.data[position.row][position.column].tileModifier = (this.data[position.row][position.column].piece && this.data[position.row][position.column].piece?.color !== color ? TileModifier.ARCHER_X_ED : TileModifier.ARCHER_EMPTY);
    }
    showBuy(position: Position): void {
        this.data[position.row][position.column].tileModifier = TileModifier.BUY;
    }
    showFinance(position: Position): void {
        this.data[position.row][position.column].tileModifier = TileModifier.FINANCE;
    }
    showGive(position: Position): void {
        this.data[position.row][position.column].tileModifier = TileModifier.GIVE;
    }
    clearSelected(): void {
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                this.data[i][j].tileModifier = null;
            }
        }
    }
    move(from: Position, to: Position): void {
        if (!this.data[from.row][from.column].piece) {
            throw new Error("there is no piece there??");
        }
        let piece = this.data[from.row][from.column].piece;
        if (this.data[to.row][to.column].piece) {
            this.killPiece(to);
        }
        this.data[to.row][to.column].piece = piece;
        piece!.position = to;
        this.data[from.row][from.column].piece = null;
        this.game.endTurn();
    }
    killPiece(position: Position): void {
        this.data[position.row][position.column].piece?.onDeath();
        if (!(this.data[position.row][position.column].piece instanceof Wizard)) {
            if (this.name === "mainBoard") {
                let underworld = this.game.getBoard("underworld");
                if (!(underworld.data[position.row][position.column].piece instanceof Queen)) {
                    underworld.data[position.row][position.column].piece = this.data[position.row][position.column].piece;
                    this.data[position.row][position.column].piece!.board = underworld;
                }
            }
        }
        let killedPiece = this.data[position.row][position.column].piece;
        if (this.name === "mainBoard") {
            if (killedPiece?.color === "blue") {
                if (killedPiece instanceof Queen) {
                    this.game.finances("blue").decreasePopularOpinion(0.2);
                    this.game.finances("red").increasePopularOpinion(0.2);
                } else if (!(killedPiece instanceof Pawn)) {
                    this.game.finances("blue").decreasePopularOpinion(0.05);
                }
            } else {
                if (killedPiece instanceof President) {
                    this.promoteRandomPawn();
                    this.game.finances("red").decreasePopularOpinion(0.35);
                } else if (killedPiece instanceof FinanceMinister) {
                    this.game.finances("red").decreasePopularOpinion(0.15);
                } else {
                    this.game.finances("red").decreasePopularOpinion(0.07)
                }
            }
            this.data[position.row][position.column].piece = null;
        }

    }
    archerShoot(position: Position): void {
        if (this.data[position.row][position.column].piece!.shield === 0)
            this.killPiece(position);
        else this.data[position.row][position.column].piece!.shield--;

        this.game.endTurn()
    }
}

type BoardProps = { board: BoardInstance, shop: Function };

export default function Board({board, shop}: BoardProps) {
    const [refresh, setRefresh] = useState(0);
    
    let key = 0;
    return (
        <div className="board" onClick={() => {setRefresh(refresh+1)}}>
            {board.data.map(row => row.map(tile => <Tile board={board} position={tile.position} key={key++} shop={shop}/>))}
        </div>
    )
    
}