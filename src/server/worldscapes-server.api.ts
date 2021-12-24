import {ECR} from "../ecr/ecr.api";

export class WorldscapesServer {

    constructor(
        private ecr: ECR = new ECR()
    ) {}

    public run() {
        setInterval(
            () => {
                this.ecr.runSimulation();
            },
            1000,
        );
    }

    readonly addRule: (...args: Parameters<ECR["addRule"]>) => this = (args) => {
        this.ecr.addRule(args);
        return this;
    }

    readonly addCustomCommandHandler: (...args: Parameters<ECR["addCustomCommandHandler"]>) => this = (args) => {
        this.ecr.addCustomCommandHandler(args);
        return this;
    }


}