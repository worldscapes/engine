import {AuthServerApi, PlayerId, PlayerInfo, SimpleAuthInfo} from "@worldscapes/common";

export class SimpleServerAuth extends AuthServerApi {

    constructor(
        protected players: PlayerInfo[]
    ) {
        super();
    }

    checkPlayer(authInfoString: string): { playerId: PlayerId } | { rejectReason: string } {

        const authInfo: SimpleAuthInfo = JSON.parse(authInfoString);

        return this.players.find(playerInfo => playerInfo.id === authInfo.id) ?
            { playerId: authInfo.id }
            :
            { rejectReason: "Unknown PlayerId" };
    }

}