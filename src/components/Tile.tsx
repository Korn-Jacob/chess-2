import React from "react";
import { BoardInstance, Position, TileData } from "./Board.tsx";
import { FinanceMinister, Piece } from "../types/pieces.ts";
import { ShopInstance } from "./Shop.tsx";

export enum TileModifier {
    CIRCLED,
    X_ED,
    BUY,
    FINANCE,
    GIVE,
    ARCHER_EMPTY,
    ARCHER_X_ED
}

export enum TileType {
    NORMAL,
    SHOP
}

type TileProps = { board: BoardInstance, position: Position, shop: Function };

export default function Tile({board, position, shop}: TileProps) {
    const data: TileData = board.data[position.row][position.column];
    const color = data.isRemoved ? "white" : (position.row + position.column) % 2 === 0 ? (board.name === "mainBoard" ? "#779556" : "#821724") : (board.name === "mainBoard" ? "#ebecd0" : "#7d6568");
    
    const onClick = data.piece ? () => data.piece?.clickAction() : () => {if (data.tileModifier === null || data.tileModifier === TileModifier.ARCHER_EMPTY) board.game.clearSelected()};
    const moveSelectedHere = () => {
        if (board.game.selectedPiece?.board === board) 
            board.move(board.game.selectedPiece.position, position)
        else if (board.game.selectedPiece && board.game.selectedPiece.board !== board) {
            board.game.interdimensionalTravel(board.game.selectedPiece!.board, board, position);
        }
    };
    const shoot = () => {board.archerShoot(data.position)};
    const doFinances = () => {
        if (!data) {
            return;
        }

        board.game.finances(data.piece!.color).increasePopularOpinion(Math.random() < 0.5 ? 0.1 : 0);
        board.game.finances(data.piece!.color).tax += (data.piece instanceof FinanceMinister ? 20 : 10);
        board.game.endTurn();
    }
    const openShop = () => {
        let toOpen: ShopInstance = {name: board.name, buyer: data.piece as Piece, exit: shop};
        shop(toOpen);
    }
    const give = () => {
        let upgrades = board.game.selectedPiece!.upgrades;
        for (let upgrade of upgrades) {
            data.piece!.upgrades.push(upgrade);
            upgrade.piece = data.piece!;
        }
        board.game.selectedPiece!.upgrades = [];
        board.game.endTurn();
    }

    let upgradeZIndex = 4;
    return (
        <div className="board-tile" style={{backgroundColor: color, gridRow: position.row + 1, gridColumn: position.column + 1}} onClick={onClick}>
            {data.piece ?
                <>
                    <img className="immovable" draggable="false" src={"/images/" + data.piece.color + "_" + data.piece.name + ".png"} alt={data.piece.name} />
                    {data.piece.upgrades.map(upgrade => <img className="immovable" style={{zIndex: upgradeZIndex++, position: "absolute"}} draggable="false" src={"/images/upgrade_" + upgrade.name + ".png"} alt={upgrade.name} />)}
                </>
            : <></>}
            {data.tileType === TileType.SHOP ? 
                <div className="shop-tile"></div>
            : <></>}
            {data.tileModifier === null ? <></>
            : data.tileModifier === TileModifier.CIRCLED ? <div className="tile-modifier-circle" onClick={moveSelectedHere}></div>
            : data.tileModifier === TileModifier.X_ED ? <div className="tile-modifier-circle" onClick={moveSelectedHere}>X</div>
            : data.tileModifier === TileModifier.BUY ? <div className="tile-modifier-circle" title="Buy" onClick={openShop}>B</div>
            : data.tileModifier === TileModifier.FINANCE ? <div className="tile-modifier-circle" title="Increase Taxes" onClick={doFinances}>$</div>
            : data.tileModifier === TileModifier.GIVE ? <div className="tile-modifier-circle" title="Give" onClick={give}>G</div>
            : data.tileModifier === TileModifier.ARCHER_EMPTY ? <div className="tile-modifier-archer" onClick={onClick}></div>
            : data.tileModifier === TileModifier.ARCHER_X_ED ? <div className="tile-modifier-archer" onClick={shoot}><p>X</p></div>
            : <></>}
        </div>
    )
}