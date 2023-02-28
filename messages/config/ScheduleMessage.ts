import { Inbound } from '../SLMessage';


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
  public static decodeAddSchedule(msg: Inbound): number{
    return msg.readUInt32LE() - 699;
  }
  public static decodeDeleteSchedule(msg: Inbound): boolean {
    // ack
    return true;
  }
  public static decodeSetSchedule(msg: Inbound): boolean {
    // ack
    return true;
  }
}


export interface SLScheduleData {
  scheduleId: number;
  circuitId: number;
  startTime: number;
  stopTime: number;
  dayMask: number;
  flags: number;
  heatCmd: number;
  heatSetPoint: number;
  days: number[];
}