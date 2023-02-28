/// <reference types="node" />
export declare class HLEncoder {
    constructor(password: any);
    private kd;
    private ke;
    private tk;
    private bKeyInit;
    private iROUNDS;
    createArray(length: any, max_length: any): any[];
    getEncryptedPassword(cls: string): Buffer;
    makeKey(sChallengeStr: any): void;
    makeBlock(str: any, byFill: any): any[];
    makeKeyFromBlock(block: any): void;
    encryptBlock(block: any): number[];
    encrypt(source: any): Buffer;
    encryptData(data: any): Buffer;
}
