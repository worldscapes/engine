import {Constructor} from "../../utility/types/constructor";
import {ComponentPurposes, ComponentSelector, EntityRequest} from "../ecr/request/request";
import {ECRComponent} from "../state/component/component";
import {PlayerComponent} from "../state/component/built-in/player.component";
import {OwnedComponent} from "../state/component/built-in/owned.component";

export abstract class PlayerAction extends ECRComponent {}

type ActionRequest<T extends PlayerAction> = EntityRequest<{
    player: ComponentSelector<PlayerComponent, typeof ComponentPurposes.HAS>,
    owner: ComponentSelector<OwnedComponent, typeof ComponentPurposes.READ>,
    action: ComponentSelector<T, typeof ComponentPurposes.READ>,
}>;

export namespace UserActionTools {

    export function CreateRequest<T extends PlayerAction>(action: Constructor<T>): ActionRequest<T> {

        return new EntityRequest({
            player: new ComponentSelector(ComponentPurposes.HAS, PlayerComponent),
            owner: new ComponentSelector(ComponentPurposes.READ, OwnedComponent),
            action: new ComponentSelector(ComponentPurposes.READ, action)
        });
    }
}

