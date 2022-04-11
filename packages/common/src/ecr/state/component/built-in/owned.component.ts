import {ECRComponent} from "../component";

export class OwnedComponent extends ECRComponent {
    constructor(
        readonly ownerId: string
    ) {
        super();
    }
}