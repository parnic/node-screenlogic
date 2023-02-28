import { Inbound } from '../SLMessage';
export declare class ChemMessage {
    static decodeChemDataMessage(msg: Inbound): SLChemData;
    static decodecChemHistoryMessage(msg: Inbound): SLChemHistory;
}
export interface SLChemData {
    isValid: boolean;
    pH: number;
    orp: number;
    pHSetPoint: number;
    orpSetPoint: number;
    pHTankLevel: number;
    orpTankLevel: number;
    saturation: number;
    calcium: number;
    cyanuricAcid: number;
    alkalinity: number;
    saltPPM: number;
    temperature: number;
    balance: number;
    corrosive: boolean;
    scaling: boolean;
    error: boolean;
}
export interface TimePHPointsPairs {
    time: Date;
    pH: number;
}
export interface TimeORPPointsPairs {
    time: Date;
    orp: number;
}
export interface TimeTimePointsPairs {
    on: Date;
    off: Date;
}
export interface SLChemHistory {
    phPoints: TimePHPointsPairs[];
    orpPoints: TimeORPPointsPairs[];
    phRuns: TimeTimePointsPairs[];
    orpRuns: TimeTimePointsPairs[];
}
