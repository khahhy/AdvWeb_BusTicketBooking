import { Bus } from "./busType";

export interface Trip {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  bus: Bus;
}
