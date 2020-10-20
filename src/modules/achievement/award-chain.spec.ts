import AwardChain from "./award-chain.class";
import Award from "./award.class";
import Storage from "../storage/storage.dumb";

export async function generateMockChain(): Promise<AwardChain> {
  let chain = new AwardChain("v1", Storage);
  await chain.open();
  await chain.add(
    new Award({
      name: "Test Award",
      reason: "Need to Test!",
    })
  );
  return chain;
}

describe("AwardChain", () => {
  it("should create a new one", async () => {
    const chain = await generateMockChain();
    console.log({ chain: chain.chain });
    expect(chain.chain.length).toEqual(2);
    expect(chain.valid).toBe(true);
  });
});
