import { BoardInstance, Position } from "../components/Board";
import { UpgradeItem } from "../components/Shop.tsx";
import { TileModifier, TileType } from "../components/Tile.tsx";

// helper methods
export const position = (r: number, c: number) => {return {row: r, column: c}};
export const positionExists = (position: Position, board: BoardInstance) => position.row <= 9 && position.row >= 0 && position.column <= 9 && position.column >= 0 && !board.data[position.row][position.column].isRemoved;

export abstract class Piece {
    position: Position;
    name: string;
    color: string;
    board: BoardInstance;
    shield: number;
    upgrades: UpgradeItem[];
    constructor(name: string, board: BoardInstance, position: Position, color: string) {
        this.name = name;
        this.board = board;
        this.position = position;
        this.color = color;
        this.shield = 0;
        this.upgrades = [];
    }
    abstract getValidMoves(): Position[];

    clickAction(): void {
        if (this === this.board.game.selectedPiece) {
            this.board.game.clearSelected();
            return;
        }
        if (this.board.game.turn !== this.color) return;

        this.board.game.clearSelected()
        this.board.game.selectedPiece = this;
        for (let i of this.getValidMoves()) {
            this.board.showCircle(i);
        }
        for (let upgrade of this.upgrades) {
            upgrade.clickActionModify();
        }
        if (this.board.data[this.position.row][this.position.column].tileType === TileType.SHOP) {
            this.board.showBuy(this.position);
        }

        if (this.upgrades.length > 0) {
            let a: number[][] = [];

            for (let i of [-1,0,1]) for (let j of [-1,0,1]) if (!(i === j && j === 0)) a.push([i,j]);
            
            for (let i of a) {
                let check = position(this.position.row+i[0], this.position.column+i[1]);
                if (positionExists(check, this.board) && this.board.data[check.row][check.column].piece?.color === this.color) {
                    this.board.showGive(check);
                }
            }
        }
    }

    move(position: Position): void {
        this.position = position;
    }

    onDeath(): void {
        for (let upgrade of this.upgrades) {
            upgrade.onDeath();
        }
    }

    onTurnPass(): void {}
}

export abstract class ImmovablePiece extends Piece {
    getValidMoves(): Position[] {
        return [];
    }
}

export class Rook extends Piece {
    constructor(board: BoardInstance, position: Position, color: string) {
        super("Rook", board, position, color);
    }
    getValidMoves(): Position[] {
        // move like rook from chess 1
        let out: Position[] = [];

        for (let i of [-1,1]) {
            let check = position(this.position.row, this.position.column+i);
            while (positionExists(check, this.board) && !this.board.data[check.row][check.column].piece) {
                out.push(check);
                check = position(check.row, check.column+i);
            }
            if (positionExists(check, this.board) && this.board.data[check.row][check.column].piece?.color !== this.color) {
                out.push(check);
            }

            check = position(this.position.row+i, this.position.column);
            while (positionExists(check, this.board) && !this.board.data[check.row][check.column].piece) {
                out.push(check);
                check = position(check.row+i, check.column);
            }
            if (positionExists(check, this.board) && this.board.data[check.row][check.column].piece?.color !== this.color) {
                out.push(check);
            }
        }

        return out;
    }
}

export class Elephant extends Piece {
    constructor(board: BoardInstance, position: Position, color: string) {
        super("Elephant", board, position, color);
    }
    getValidMoves(): Position[] {
        let out: Position[] = [];
        // move like horse from chess 1 but can take pieces ajacent to it

        // adjacent
        let a: number[][] = [];
        for (let i of [-1,0,1]) for (let j of [-1,0,1]) if (!(i === j && j === 0)) a.push([i,j]);

        for (let i of a) {
            let check = position(this.position.row+i[0], this.position.column+i[1]);
            if (positionExists(check, this.board) && this.board.data[check.row][check.column].piece !== null && this.board.data[check.row][check.column].piece?.color !== this.color) {
                out.push(check);
            }
        }

        // horse from chess 1
        let b: number[][] = [];
        for (let i of [-1,1]) for (let j of [-1,1]) b.push([i,j]);
        
        for (let i of b) {
            let check = position(this.position.row+(i[0]*2), this.position.column+(i[1]));
            if (positionExists(check, this.board) && this.board.data[check.row][check.column].piece?.color !== this.color) {
                out.push(check);
            }

            check = position(this.position.row+(i[0]), this.position.column+(i[1]*2));
            if (positionExists(check, this.board) && this.board.data[check.row][check.column].piece?.color !== this.color) {
                out.push(check);
            }
        }

        return out;
    }
}

export class Archer extends ImmovablePiece {
    cooldown: number;
    constructor(board: BoardInstance, position: Position, color: string) {
        super("Archer", board, position, color);
        this.cooldown = 0;
    }
    clickAction(): void {
        if (this.color !== this.board.game.turn) return;
        if (this.board.game.selectedPiece === this) {
            this.board.game.clearSelected();
            return;
        }
        super.clickAction();
        if (this.cooldown !== 0) {
            this.board.showArcherReloading(this.position);
            return;
        }
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (Math.abs(this.position.row - i) + Math.abs(this.position.column - j) < 4 && (i !== this.position.row || j !== this.position.column) && this.board.data[i][j].tileModifier !== TileModifier.CIRCLED && this.board.data[i][j].tileModifier !== TileModifier.GIVE) {
                    this.board.showArcherTile(position(i,j), this.color);
                }
            }
        }
    }
    onTurnPass(): void {
        this.cooldown = Math.max(0, this.cooldown - 1);
    }
}

export class Wizard extends Piece {
    constructor(board: BoardInstance, position: Position, color: string) {
        super("Wizard", board, position, color);
    }
    getValidMoves(): Position[] {
        let out: Position[] = [];
        // like bishop from chess 1, but can also move interdimensionally 
        let a: number[][] = [];
        for (let i of [-1,1]) for (let j of [-1,1]) a.push([i,j]);

        for (let i of a) {
            let check = position(this.position.row+i[0], this.position.column+i[1]);
            while (positionExists(check, this.board) && !this.board.data[check.row][check.column].piece) {
                out.push(check);
                check = position(check.row+i[0], check.column+i[1]);
            }
            if (positionExists(check, this.board) && this.board.data[check.row][check.column].piece?.color !== this.color) {
                out.push(check);
            }
        }
        return out;
    }
    clickAction(): void {
        super.clickAction();
        if (this.board.game.turn !== this.color) return;
        // interdimensional travel
        for (let b of this.board.game.boards) {
            if (b === this.board) continue;
            b.showCircle(this.position);
        }
    }
}

export class Queen extends ImmovablePiece {
    constructor(board: BoardInstance, position: Position) {
        super("Queen", board, position, "blue");
    }
}

export class Pope extends Piece {
    constructor(board: BoardInstance, position: Position, color: string) {
        super("Pope", board, position, color);
    }
    getValidMoves(): Position[] {
        // moves like queen from chess 1
        let out: Position[] = [];

        let rook = new Rook(this.board, this.position, this.color);
        for (let i of rook.getValidMoves()) {
            out.push(i);
        }
        let wizard = new Wizard(this.board, this.position, this.color);
        for (let i of wizard.getValidMoves()) {
            out.push(i);
        }
        return out;
    }
}

export class President extends Piece {
    constructor(board: BoardInstance, position: Position) {
        super("President", board, position, "red");
    }

    getValidMoves(): Position[] {
        let out: Position[] = [];
        // move like king from chess 1
        let a: number[][] = [];

        for (let i of [-1,0,1]) for (let j of [-1,0,1]) if (!(i === j && j === 0)) a.push([i,j]);

        for (let i of a) {
            let check = position(this.position.row+i[0], this.position.column+i[1]);
            if (positionExists(check, this.board) && (!this.board.data[check.row][check.column].piece || (this.board.data[check.row][check.column].piece && this.board.data[check.row][check.column].piece?.color !== this.color))) {
                out.push(check);
            }
        }
        return out;
    }
}

export class FinanceMinister extends ImmovablePiece {
    constructor(board: BoardInstance, position: Position) {
        super("FinanceMinister", board, position, "red");
    }

    clickAction(): void {
        if (this.board.game.turn !== this.color) return;
        super.clickAction();
        this.board.showFinance(this.position);

    }
}

export class Pawn extends Piece {
    constructor(board: BoardInstance, position: Position, color: string) {
        super("Pawn", board, position, color);
    }
    getValidMoves(): Position[] {
        // just like chess 1
        let out: Position[] = [];
        let direction = this.color === "red" ? 1 : -1;
        let startRow = this.color === "red" ? 1 : 8;

        let inFront = position(this.position.row + direction, this.position.column);
        if (positionExists(inFront, this.board) && !this.board.data[inFront.row][inFront.column].piece) {
            out.push(inFront);
        
            if (this.position.row === startRow) {
                let twoInFront = position(this.position.row + (2 * direction), this.position.column);
                if (positionExists(twoInFront, this.board) && !this.board.data[twoInFront.row][twoInFront.column].piece) {
                    out.push(twoInFront);
                }
            }
        }
        for (let i of [-1,1]) {
            let check = position(inFront.row, inFront.column + i);
            if (positionExists(check, this.board) && this.board.data[check.row][check.column].piece && this.board.data[check.row][check.column].piece?.color !== this.color) {
                out.push(check);
            }
        }
        return out;
    }
}