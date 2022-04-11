import {AuthClientApi, SimpleAuthInfo} from "@worldscapes/common";

export class SimpleClientAuth extends AuthClientApi {

    constructor(
        protected authInfo: SimpleAuthInfo
    ) {
        super();
    }

    getAuthInfoString(): string {
        return JSON.stringify(this.authInfo);
    }
}