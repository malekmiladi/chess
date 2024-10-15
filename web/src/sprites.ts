
export type Sprite = {
    svg: string
}

export const sprites = {
    king: {
        black: {
            svg: "./assets/bK.svg"
        } as Sprite,
        white: {
            svg: "./assets/wK.svg"
        } as Sprite
    },
    queen: {
        black: {
            svg: "./assets/bQ.svg"
        } as Sprite,
        white: {
            svg: "./assets/wQ.svg"
        } as Sprite
    },
    bishop: {
        black: {
            svg: "./assets/bB.svg"
        } as Sprite,
        white: {
            svg: "./assets/wB.svg"
        } as Sprite
    },
    knight: {
        black: {
            svg: "./assets/bN.svg"
            
        } as Sprite,
        white: {
            svg: "./assets/wN.svg"
            
        } as Sprite
    },
    rook: {
        black: {
            svg: "./assets/bR.svg"
            
        } as Sprite,
        white: {
            svg: "./assets/wR.svg"
            
        } as Sprite
    },
    pawn: {
        black: {
            svg: "./assets/bP.svg"

        } as Sprite,
        white: {
            svg: "./assets/wP.svg"
        } as Sprite
    }
};