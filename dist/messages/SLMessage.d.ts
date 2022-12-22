/// <reference types="node" />
import { SmartBuffer } from 'smart-buffer';
export declare class SLMessage {
    static MSG_ID: number;
    constructor(controllerId: number, senderId: number);
    protected _wroteSize: boolean;
    action: number;
    senderId: number;
    controllerId: number;
    protected dataLength: number;
    protected _smartBuffer: SmartBuffer;
    get readOffset(): number;
    get length(): number;
    static slackForAlignment(val: any): number;
    getDayValue(dayName: any): number;
    toBuffer(): Buffer;
}
export declare class Inbound extends SLMessage {
    readFromBuffer(buf: Buffer): void;
    readMessage(buf: Buffer): void;
    readSLString(): string;
    readSLArray(): any[];
    decode(): void;
    isBitSet(value: any, bit: any): boolean;
    decodeTime(rawTime: any): any;
    decodeDayMask(dayMask: number): number[];
    readSLDateTime(): Date;
    readUInt8(): number;
    readUInt16BE(): number;
    readUInt16LE(): number;
    readInt32LE(): number;
    readUInt32LE(): number;
    incrementReadOffset(val: number): void;
    toString(): string;
}
export declare class Outbound extends SLMessage {
    createBaseMessage(): void;
    addHeader(): void;
    encodeDayMask(daysArray: any): number;
    writeSLDateTime(date: any): void;
    writeInt32LE(val: any): void;
    encode(): void;
    static getResponseId(): number;
    toBuffer(): Buffer;
    writeSLString(str: any): void;
    writeSLBuffer(buf: any): void;
    writeSLArray(arr: any): void;
    skipWrite(num: any): void;
    encodeTime(stringTime: any): number;
}
