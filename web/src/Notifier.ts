import { GameEvent } from "./GameEvents.js"

export interface Subscriber {
    update(event: GameEvent): void;
}

export class Notifier {

    subscriber: Subscriber;

    constructor(subscriber: Subscriber) {
        this.subscriber = subscriber;
    } 

    notify(event: GameEvent): void {
        this.subscriber.update(event);
    }

}