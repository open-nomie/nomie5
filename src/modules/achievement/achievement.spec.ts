import dayjs from "dayjs";
import NLog from "../nomie-log/nomie-log";
import Achievement from "./achievement.class";
import { checkGlobalAwards } from "./achievement-helpers";
import Award from "./award.class";
import { generateMockChain } from "./award-chain.spec";

describe("Achievement", () => {
  it("should create a new one", () => {
    let achievement = new Achievement();
    expect(achievement.id).toBeTruthy();
  });

  it("should check against global awards", async () => {
    let records = [
      new NLog({ note: "This is a note!", end: dayjs().subtract(3, "year").toDate().getTime() }),
      new NLog({ note: "This is a note!", end: dayjs().hour(20).toDate().getTime() }),
      new NLog({ note: "This is a note!", end: dayjs().subtract(1, "hour").toDate().getTime() }),
    ];
    let chain = await generateMockChain();
    let check = checkGlobalAwards({ launchCount: 100 }, chain);
    expect(check.length).toBe(0);

    let check1001 = checkGlobalAwards({ launchCount: 1001 }, chain);
    expect(check1001[0]).toBeInstanceOf(Award);
    expect(check1001[0].id).toBe("1000-opens");

    check1001.forEach((award) => {
      chain.add(award);
    });

    // Check again - to make sure it doesn't give us the same award now that the user has it.

    let check1001Again = checkGlobalAwards({ launchCount: 1002 }, chain);
    expect(check1001Again.length).toBe(0);

    console.log("Check", check1001, check1001Again);
  });
});
