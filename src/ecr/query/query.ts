import {WSCStructure} from "../../typing/WSCStructure";

export type ECRQuery<RequestType extends ECRRequest> = Record<string, RequestType>;

export class ECRRequest extends WSCStructure {}