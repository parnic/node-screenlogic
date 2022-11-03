'use strict';

import { Inbound, Outbound, SLMessage } from './SLMessage';

const _MSG_ID = 18003;

export class SLReceiveGatewayDataMessage extends Inbound {
  // static MSG_ID = _MSG_ID;
  private data: SLGateWayData;
  constructor(buf: Buffer) {
    super(0, 0);
    this.readFromBuffer(buf);
    this.decode();
  }


  decode() {
    super.decode();

    let gatewayFound = this._smartBuffer.readUInt8() !== 0;
    let licenseOK = this._smartBuffer.readUInt8() !== 0;
    let ipAddr = this.readSLString();
    let port = this._smartBuffer.readUInt16LE();
    let portOpen = this._smartBuffer.readUInt8() !== 0;
    let relayOn = this._smartBuffer.readUInt8() !== 0;
    this.data = {
      gatewayFound,
      licenseOK,
      ipAddr,
      port,
      portOpen,
      relayOn
    }

  }
  get() {
    return this.data;
  }
};


// export class SLSendGatewayDataMessage extends Outbound {
//   // static MSG_ID = _MSG_ID;
//   constructor(systemName: string) {
//     super(0, 0);
//     this.systemName = systemName;
//     this.writeMessage();
//   }
//   private systemName: string;

//   public writeMessage(): void {

//     this.messageId = 18003; // SLSendGatewayDataMessage.MSG_ID;
//     this.createBaseMessage();
//     this.writeSLString(this.systemName);
//     this.writeSLString(this.systemName);
//   }
// };

export interface SLGateWayData {
  gatewayFound: boolean,
  licenseOK: boolean,
  ipAddr: string,
  port: number,
  portOpen: boolean,
  relayOn: boolean
}