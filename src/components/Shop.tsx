import React, { useState } from "react";
import { Pawn, Piece, position, positionExists, President } from "../types/pieces.ts";
import { Position } from "./Board";
import { TileModifier } from "./Tile.tsx";

enum ItemType {
    UPGRADE = "upgrade",
    ACTION = "action"
}


export abstract class ShopItem {
    name: string;
    cost: number;
    type: ItemType;
    description: string;
    constructor(name: string, cost: number, description: string, type: ItemType) {
        this.name = name;
        this.cost = cost;
        this.description = description;
        this.type = type;
    }
    buy(piece: Piece): void {
        piece.board.game.finances(piece.color).bank -= this.cost;
        piece.board.game.endTurn();
    };
}

export abstract class UpgradeItem extends ShopItem {
    piece: Piece;
    constructor(name: string, cost: number, description: string) {
        super(name, cost, description, ItemType.UPGRADE);
    }
    abstract whenAttached(): void;
    abstract clickActionModify(): void;
    abstract onDeath(): void;
    buy(piece: Piece): void {
        this.piece = piece;
        piece.upgrades.push(this);
        this.whenAttached();
        super.buy(piece);
    }
}

export abstract class ActionItem extends ShopItem {
    constructor(name: string, cost: number, description: string) {
        super(name, cost, description, ItemType.ACTION);
    }
    abstract doAction(piece: Piece): void;
    buy(piece: Piece) {
        this.doAction(piece);
        super.buy(piece);
    }
}

export class WalkingStick extends UpgradeItem {
    constructor() {
        super("walkingStick", 100, "Allows piece to move forwards one more tile than usually permitted. This includes immobile pieces.");
    }
    whenAttached(): void {
    }
    onDeath(): void {
    }

    clickActionModify(): void {
        let direction = this.piece.color === "red" ? 1 : -1;
        let inFront: Position = position(this.piece.position.row + direction, this.piece.position.column)
        while (positionExists(inFront, this.piece.board) && this.piece.board.data[inFront.row][inFront.column].tileModifier === TileModifier.CIRCLED) {
            inFront.row = inFront.row + direction;
        }
        if (!positionExists(inFront, this.piece.board)) return;

        if (this.piece.board.data[inFront.row][inFront.column].piece) return;

        this.piece.board.showCircle(inFront);
    }
}

export class Bomb extends UpgradeItem {
    constructor() {
        super("Bomb", 500, "When this piece dies, it will blow up all pieces adjacent to it (1-tile square). They will not go to the underworld. The attacking piece survives. (See: atomic chess)");
    }
    whenAttached(): void {
    }
    clickActionModify(): void {
    }

    onDeath(): void {
        let adjacent: number[][] = [];
        for (let a of [-1,0,1]) for (let b of [-1,0,1]) if (a !== 0 || b !== 0) adjacent.push([a,b]);

        for (let i of adjacent) {
            let check = position(this.piece.position.row + i[0], this.piece.position.column + i[1]);
            if (positionExists(check, this.piece.board) && this.piece.board.data[check.row][check.column].piece) {
                this.piece.board.data[check.row][check.column].piece = null;
            }
        }
        this.piece.upgrades = [];
    }
    
}

export class FinancialEducation extends UpgradeItem {
    constructor() {
        super("financialEducation", 6666, "Allows the piece to be used like the finance minister. You will need to leave the shop before using it.");
    }
    whenAttached(): void {
    }
    clickActionModify(): void {
        this.piece.board.showFinance(this.piece.position);
    }
    onDeath(): void {
        this.piece.board.game.finances(this.piece.color).decreasePopularOpinion(0.1);
    }
}

export class Shield extends UpgradeItem {
    constructor() {
        super("shield", 250, "Protects the wearer from 2 archer shots.");
    }
    whenAttached(): void {
        this.piece.shield += 2;
    }
    clickActionModify(): void {
    }
    onDeath(): void {
    }
}

export class Conscription extends ActionItem {
    constructor() {
        super("conscription", 1000, "Summons a pawn on the row where your pawns started. Warning: if no empty spaces are there, this will do nothing. Hurts popular opinion.");
    }
    doAction(piece: Piece): void {
        let color = piece.color;
        let addRow = color === "red" ? 1 : 8;

        piece.board.game.finances(color).decreasePopularOpinion(0.15);

        for (let i = 0; i < 10; i++) {
            if (!piece.board.data[addRow][i].piece) {
                piece.board.data[addRow][i].piece = new Pawn(piece.board, position(addRow,i), piece.color);
                break;
            }
        }
    }
}

export class Revive extends ActionItem {
    constructor() {
        super("revive", 666, "Brings the piece back to life in the position it was in. If that position has a piece in it, that piece will die. Presidents will lose their jobs since they have been replaced.");
    }

    doAction(piece: Piece): void {
        let mainBoard = piece.board.game.getBoard("mainBoard");
        piece.board.data[piece.position.row][piece.position.column].piece = null;
        if (mainBoard.data[piece.position.row][piece.position.column].piece) {
            mainBoard.killPiece(piece.position);
        }
        mainBoard.data[piece.position.row][piece.position.column].piece = piece;
        piece.board = mainBoard;

        if (piece instanceof President) {
            piece.board.data[piece.position.row][piece.position.column].piece = new Pawn(piece.board, piece.position, "red");
        }
    }
} 

export class Gamble extends ActionItem {
    constructor() {
        super("gamble", 1000, "Double or nothing!");
    }
    doAction(piece: Piece): void {
        let add = Math.random() < 0.5 ? 2000 : 0;
        alert(add === 0 ? "loss :(" : "win :)");
        piece.board.game.finances(piece.color).bank += add;
    }
}

export class MassRevive extends ActionItem {
    constructor() {
        super("massRevive", 66666, "Revive all pieces of your color.");
    }
    doAction(piece: Piece): void {
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (piece.board.data[i][j].piece?.color === piece.color) {
                    console.log(i + " " + j + " " + piece.board.name)
                    new Revive().doAction(piece.board.data[i][j].piece!);
                }
            }
        }
    }
}

const items = {
    mainBoard: [WalkingStick, Shield, Bomb, Conscription],
    underworld: [Revive, Gamble, FinancialEducation, MassRevive]
}

type ShopProps = {name: string, buyer: Piece, exit: Function};
export type ShopInstance = ShopProps | null;
type SaleItemProps = {item: { new(): ShopItem }, buyer: Piece};

function SaleItem({item, buyer}: SaleItemProps) {
    const forSale = new item();

    // awful code
    let name = forSale.name.charAt(0).toUpperCase();
    let theRest = [...forSale.name.substring(1)];
    while (theRest.findIndex((str) => /[A-Z]/.test(str)) !== -1) {
        theRest[theRest.findIndex((str) => /[A-Z]/.test(str))] = " " + theRest[theRest.findIndex((str) => /[A-Z]/.test(str))].toLowerCase();
    }
    for (let char of theRest) name += char;
    name += ":";


    return (
        <div className="shop-item">
            <p>{name}</p>
            <img src={"/images/" + forSale.type + "_" + forSale.name + ".png"} onClick={() => forSale.buy(buyer)} alt={forSale.name}/>
            <p>{forSale.description}</p>
            <p>Cost: {forSale.cost}</p>
        </div>
    )
}

export default function Shop({name, buyer, exit}: ShopProps) {
    useState(() => {
        window.addEventListener("keydown", (e) => e.key === "Escape" ? exit() : (() => {})());
    });
    return (
        <div className="shop-background" onClick={() => exit()}>
            <div className="shop">
                <h1>Shop! (click on an item's image to buy)</h1>
                <div className="shop-item-container">
                    {items[name].map((item: { new(): ShopItem }) => <SaleItem item={item} buyer={buyer} />)}
                </div>
            </div>
        </div>
    )
}