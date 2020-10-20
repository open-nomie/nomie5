import type NLog from "../nomie-log/nomie-log";
import Award from "./award.class";
import type AwardChain from "./award-chain.class";

export interface GlobalAwardStatsConfig {
  launchCount?: number;
  firstRecord?: NLog;
  lastRecords?: Array<NLog>;
}

export function checkGlobalAwards(stats: GlobalAwardStatsConfig, awardChain: AwardChain): Array<Award> {
  let awards: Array<Award> = [];
  if (stats.launchCount && stats.launchCount > 1000) {
    if (!awardChain.getById("1000-opens")) {
      awards.push(
        new Award({
          id: "1000-opens",
          name: "1000 Opens",
          reason: "Launched Nomie 1000 times",
        })
      );
    }
  }

  return awards;
}
