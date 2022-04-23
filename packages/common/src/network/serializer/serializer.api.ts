export abstract class NetworkSerializerApi {

    abstract stringify<T>(data: T): string;
    abstract parse<T>(text: string): T;

}