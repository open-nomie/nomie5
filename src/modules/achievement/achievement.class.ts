import nid from "../nid/nid";
import TrackableElement from "../trackable-element/trackable-element";
import type { IConditionIsUnit } from "../../modules/scoring/score-tracker";

export type AchTimeframe = "day" | "week" | "month";
export interface AchConditionConfig {
  element?:TrackableElement;
  condition?: IConditionIsUnit;
  value?: number;
}

export class AchCondition {
  element?: TrackableElement;
  condition?: IConditionIsUnit;
  value?: number;
  constructor(starter: AchConditionConfig) {
    this.value = starter.value;
    this.condition = starter.condition
    this.element = starter.element;
  }
}

export interface AchievementConfig {
  id?: string;
  timeframe?: AchTimeframe,
  conditions?: Array<AchCondition>
}

export default class Achievement {
  id?: string;
  timeframe?: AchTimeframe,
  conditions?: Array<AchCondition>
  constructor(starter: AchievementConfig = {}) {
    this.id = starter.id || `ach-${nid(6)}`;
    this.timeframe = starter.timeframe || "day";
    this.conditions = (starter.conditions ? starter.conditions : []).map((cond)=>{
      return new AchCondition(cond)
    })
  }
}
