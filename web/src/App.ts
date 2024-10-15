import { Game } from "./game.js";

const ctx = document.getElementById("game") as HTMLDivElement;
const game = new Game(ctx);
game.run();