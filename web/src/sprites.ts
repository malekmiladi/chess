
export type Sprite = {
    SVG: string
}

export const Sprites = {
    KING: {
        B: {
            SVG: "./assets/bK.svg"
        } as Sprite,
        W: {
            SVG: "./assets/wK.svg"
        } as Sprite
    },
    QUEEN: {
        B: {
            SVG: "./assets/bQ.svg"
        } as Sprite,
        W: {
            SVG: "./assets/wQ.svg"
        } as Sprite
    },
    BISHOP: {
        B: {
            SVG: "./assets/bB.svg"
        } as Sprite,
        W: {
            SVG: "./assets/wB.svg"
        } as Sprite
    },
    KNIGHT: {
        B: {
            SVG: "./assets/bN.svg"
            
        } as Sprite,
        W: {
            SVG: "./assets/wN.svg"
            
        } as Sprite
    },
    ROOK: {
        B: {
            SVG: "./assets/bR.svg"
            
        } as Sprite,
        W: {
            SVG: "./assets/wR.svg"
            
        } as Sprite
    },
    PAWN: {
        B: {
            SVG: "./assets/bP.svg"

        } as Sprite,
        W: {
            SVG: "./assets/wP.svg"
        } as Sprite
    }
};