import { Game } from "./game.js";

const ctx = document.getElementById("app") as HTMLDivElement;
const game = new Game(ctx);
game.run();