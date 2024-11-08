

export class AudioManager {
    private _sounds: { [key: string]: HTMLAudioElement } = {
        move: new Audio("./assets/audio/move.mp3"),
        capture: new Audio("./assets/audio/capture.mp3"),
        castle: new Audio("./assets/audio/castle.mp3"),
        check: new Audio("./assets/audio/check.mp3"),
        promote: new Audio("./assets/audio/promote.mp3")
    }

    playAudio(sound: string): void {
        this._sounds[sound].play();
    }
}