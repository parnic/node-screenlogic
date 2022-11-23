import { Inbound } from "../SLMessage";


export class ScheduleMessage {
  public static decodeGetScheduleMessage(msg: Inbound) {
    let eventCount = msg.readUInt32LE();
    let data: SLScheduleData[] = [];
    for (var i = 0; i < eventCount; i++) {
      let scheduleId = msg.readUInt32LE() - 699;
      let circuitId = msg.readUInt32LE() - 499;
      let startTime = msg.decodeTime(msg.readUInt32LE());
      let stopTime = msg.decodeTime(msg.readUInt32LE());
      let dayMask = msg.readUInt32LE();
      let flags = msg.readUInt32LE();
      let heatCmd = msg.readUInt32LE();
      let heatSetPoint = msg.readUInt32LE();
      let days = msg.decodeDayMask(dayMask);
      let event: SLScheduleData = {
        scheduleId,
        circuitId,
        startTime,
        stopTime,
        dayMask,
        flags,
        heatCmd,
        heatSetPoint,
        days
      }
      data.push(event);
    }
    return data;
  }
  public static decodeAddSchedule(msg: Inbound):number{
    return msg.readUInt32LE();
  }
  public static decodeDeleteSchedule(msg: Inbound){
    // ack
    return true;
  }
  public static decodeSetSchedule(msg: Inbound){
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