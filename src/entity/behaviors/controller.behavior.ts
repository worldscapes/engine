import {Observable} from "rxjs";
import {Entity} from "../entity";

export function FollowEntityBehavior(entity: Entity, positionUpdateObservable: Observable<{ x: number, y: number }>): BABYLON.Behavior<BABYLON.Node> {
    return {
        name: 'follow-entity',
        init: () => {

        },
        attach: (target) => {

        },
        detach: () => {

        },
    };
}