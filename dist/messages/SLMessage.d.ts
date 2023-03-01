/// <reference types="node" />
import { SmartBuffer } from 'smart-buffer';
export interface SLData {
    senderId: number;
}
export interface SLSimpleBoolData extends SLData {
    val: boolean;
}
export interface SLSimpleNumberData extends SLData {
    val: number;
}
export declare class SLMessage {
    static MSG_ID: number;
    constructor(controllerId?: number, senderId?: number);
    protected _wroteSize: boolean;
    action: number;
    senderId: number;
    controllerId: number;
    protected dataLength: number;
    protected _smartBuffer: SmartBuffer;
    get readOffset(): number;
    get length(): number;
    static slackForAlignment(val: number): number;
    getDayValue(dayName: string): number;
    toBuffer(): Buffer;
}
export declare class Inbound extends SLMessage {
    readFromBuffer(buf: Buffer): void;
    readMessage(buf: Buffer): void;
    readSLString(): string;
    readSLArray(): Array<number>;
    decode(): void;
    isBitSet(value: number, bit: number): boolean;
    decodeTime(rawTime: number): string;
    decodeDayMask(dayMask: number): string[];
    readSLDateTime(): Date;
    readUInt8(): number;
    readUInt16BE(): number;
    readUInt16LE(): number;
    readInt32LE(): number;
    readUInt32LE(): number;
    incrementReadOffset(val: number): void;
    toString(): string;
    toHexStream(): string;
}
export declare class Outbound extends SLMessage {
    constructor(controllerId?: number, senderId?: number, messageId?: number);
    createBaseMessage(senderId?: number): void;
    addHeader(senderId?: number): void;
    encodeDayMask(daysArray: string[]): number;
    writeSLDateTime(date: Date): void;
    writeInt32LE(val: number): void;
    encode(): void;
    static getResponseId(): number;
    toBuffer(): Buffer;
    writeSLString(str: string): void;
    writeSLBuffer(buf: Buffer): void;
    writeSLArray(arr: Buffer): void;
    skipWrite(num: number): void;
    encodeTime(stringTime: string): number;
}
