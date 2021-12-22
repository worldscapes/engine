import {ECR} from "../simulation/ecr.api";

export class WorldscapesServer {

    constructor(
        readonly ecr: ECR = new ECR()
    ) {}

    public run() {
        setTimeout(
            () => {

            },
            32,
        );
    }

}