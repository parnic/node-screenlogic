/// <reference types="node" />
import { Inbound } from './SLMessage';
export declare class SLReceiveGatewayDataMessage extends Inbound {
    private data;
    constructor(buf: Buffer);
    decode(): void;
    get(): SLGateWayData;
}
export interface SLGateWayData {
    gatewayFound: boolean;
    licenseOK: boolean;
    ipAddr: string;
    port: number;
    portOpen: boolean;
    relayOn: boolean;
}
