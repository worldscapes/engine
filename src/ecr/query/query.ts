import {Structure} from "../../structure/structure";

export type ECRQuery<RequestType extends ECRRequest> = Record<string, RequestType>;

export class ECRRequest extends Structure {}