/// <reference types="node" />
export declare class HLEncoder {
    constructor(password: string);
    private kd;
    private ke;
    private tk;
    private bKeyInit;
    private iROUNDS;
    createArray(length: number, max_length: number): any[];
    getEncryptedPassword(cls: string): Buffer;
    makeKey(sChallengeStr: string[]): void;
    makeBlock(str: string[], byFill: number): any[];
    makeKeyFromBlock(block: number[]): void;
    encryptBlock(block: number[]): number[];
    encrypt(source: string[]): Buffer;
    encryptData(data: number[]): Buffer;
}
