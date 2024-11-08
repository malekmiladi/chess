
export type Sprite = {
    SVG: string
}

export const SPRITES = {
    KING: {
        B: {
            SVG: "./assets/sprites/bK.svg"
        } as Sprite,
        W: {
            SVG: "./assets/sprites/wK.svg"
        } as Sprite
    },
    QUEEN: {
        B: {
            SVG: "./assets/sprites/bQ.svg"
        } as Sprite,
        W: {
            SVG: "./assets/sprites/wQ.svg"
        } as Sprite
    },
    BISHOP: {
        B: {
            SVG: "./assets/sprites/bB.svg"
        } as Sprite,
        W: {
            SVG: "./assets/sprites/wB.svg"
        } as Sprite
    },
    KNIGHT: {
        B: {
            SVG: "./assets/sprites/bN.svg"
            
        } as Sprite,
        W: {
            SVG: "./assets/sprites/wN.svg"
            
        } as Sprite
    },
    ROOK: {
        B: {
            SVG: "./assets/sprites/bR.svg"
            
        } as Sprite,
        W: {
            SVG: "./assets/sprites/wR.svg"
            
        } as Sprite
    },
    PAWN: {
        B: {
            SVG: "./assets/sprites/bP.svg"

        } as Sprite,
        W: {
            SVG: "./assets/sprites/wP.svg"
        } as Sprite
    }
};