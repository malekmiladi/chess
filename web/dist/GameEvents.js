export var GameEventType;
(function (GameEventType) {
    GameEventType[GameEventType["NEW_GAME"] = 0] = "NEW_GAME";
    GameEventType[GameEventType["START_GAME"] = 1] = "START_GAME";
    GameEventType[GameEventType["MOVE_PIECE"] = 2] = "MOVE_PIECE";
    GameEventType[GameEventType["TAKE_PIECE"] = 3] = "TAKE_PIECE";
    GameEventType[GameEventType["CHECK"] = 4] = "CHECK";
})(GameEventType || (GameEventType = {}));
