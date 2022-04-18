import {NetworkSerializerApi} from "../serializer.api";

export class SimpleSerializer extends NetworkSerializerApi {

    stringify<T>(data: T): string {
        return JSON.stringify(data);
    }

    parse<T>(text: string): T {
        return JSON.parse(text);
    }

}