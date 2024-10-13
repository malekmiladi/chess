import { Game } from "./Game.js";

const chess = document.getElementById("chess") as HTMLDivElement;
const game = new Game(chess);
game.run();