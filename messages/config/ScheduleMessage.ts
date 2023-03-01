import { Inbound, SLData, SLSimpleBoolData, SLSimpleNumberData } from '../SLMessage';


export class ScheduleMessage {
  public static decodeGetScheduleMessage(msg: Inbound): SLScheduleData[] {
    const eventCount = msg.readUInt32LE();
    const data: SLScheduleData[] = [];
    for (let i = 0; i < eventCount; i++) {
      const scheduleId = msg.readUInt32LE() - 699;
      const circuitId = msg.readUInt32LE() - 499;
      const startTime = msg.decodeTime(msg.readUInt32LE());
      const stopTime = msg.decodeTime(msg.readUInt32LE());
      const dayMask = msg.readUInt32LE();
      const flags = msg.readUInt32LE();
      const heatCmd = msg.readUInt32LE();
      const heatSetPoint = msg.readUInt32LE();
      const days = msg.decodeDayMask(dayMask);
      const event: SLScheduleData = {
        senderId: msg.senderId,
        scheduleId,
        circuitId,
        startTime,
        stopTime,
        dayMask,
        flags,
        heatCmd,
        heatSetPoint,
        days
      };
      data.push(event);
    }
    return data;
  }
  public static decodeAddSchedule(msg: Inbound): SLSimpleNumberData {
    const response: SLSimpleNumberData = {
      senderId: msg.senderId,
      val: msg.readUInt32LE() - 699
    };
    return response;
  }
  public static decodeDeleteSchedule(msg: Inbound): SLSimpleBoolData {
    // ack
    const response: SLSimpleBoolData = {
      senderId: msg.senderId,
      val: true
    };
    return response;
  }
  public static decodeSetSchedule(msg: Inbound): SLSimpleBoolData {
    // ack
    const response: SLSimpleBoolData = {
      senderId: msg.senderId,
      val: true
    };
    return response;
  }
}


export interface SLScheduleData extends SLData {
  scheduleId: number;
  circuitId: number;
  startTime: string;
  stopTime: string;
  dayMask: number;
  flags: number;
  heatCmd: number;
  heatSetPoint: number;
  days: string[];
}
