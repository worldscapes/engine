import {PlayerId} from "../../identity/player-info";

export type AuthResult = AuthResultSuccess | AuthResultReject;
export type AuthResultSuccess = { playerId: PlayerId };
export type AuthResultReject = { rejectReason: string };

export function isAuthResultSuccess(authResult: AuthResult): authResult is AuthResultSuccess {
    return !!authResult['playerId'];
}

export function isAuthResultReject(authResult: AuthResult): authResult is AuthResultReject {
    return !!authResult['rejectReason'];
}

export abstract class AuthServerApi {
    abstract checkPlayer(authInfo: string): AuthResult;
}
