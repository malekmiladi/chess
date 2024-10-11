import { GameEvent } from "./GameEvents"

interface Subscriber {
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