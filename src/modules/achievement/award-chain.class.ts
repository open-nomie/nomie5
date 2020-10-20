import Award from "./award.class";
import type Storage from "../storage/storage";
import appConfig from "../../config/appConfig";

export default class AwardChain {
  version: string;
  chain: Array<Award>;
  storage: Storage;
  private path: string;

  constructor(version: string, storage: Storage) {
    this.storage = storage;
    this.version = version;
    this.path = `${appConfig.data_root}/award-chain-${this.version}.json`;
  }

  /**
   * Open Storage
   */
  async open(): Promise<AwardChain> {
    // Get file from storage
    let chain = await this.storage.get(this.path);
    // Map to Award objects
    this.chain = (chain || []).map((award: Award) => {
      return new Award(award);
    });
    // If empty chain
    if (!this.chain.length) {
      // Get genesis award
      let genesis: Award = this.genesis;
      // Get genesis hash
      genesis.hash = genesis.getHash();
      // Push to chain
      this.chain.push(genesis);
      // Save to storage
      await this.save();
      // Return self
    }
    return this;
  }

  /**
   * Save to storage
   */
  async save(): Promise<AwardChain> {
    return await this.storage.put(this.path, this.chain);
  }

  getById(id: string): Award | undefined {
    return this.chain.find((a: Award) => a.id === id);
  }

  /**
   * Get the Last Award
   */
  latestAward(): Award {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Check if Chain is valid
   */
  get valid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      if (currentBlock.hash !== currentBlock.getHash()) {
        return false;
      }
      if (currentBlock.phash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get a Genesis Award
   */
  get genesis(): Award {
    return new Award({
      id: "nomieer",
      name: "Nomieer",
      reason: `You use Nomie`,
      level: 1,
      phash: `0`,
    });
  }

  async add(award: Award): Promise<Award> {
    // Get last in Chain
    let previous: Award = this.latestAward();
    // Get Last's Previous Hash
    award.phash = previous.hash;
    // Make this awards hash
    award.hash = award.getHash();
    // Push to the chain
    this.chain.push(award);
    // Save to storage
    await this.save();
    // return award
    return award;
  }
}
