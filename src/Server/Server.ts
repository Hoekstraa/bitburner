// Class representing a single hackable Server
import { BaseServer } from "./BaseServer";

import { BitNodeMultipliers } from "../BitNode/BitNodeMultipliers";

import { createRandomString } from "../utils/helpers/createRandomString";
import { createRandomIp } from "../utils/IPAddress";
import { Generic_fromJSON, Generic_toJSON, Reviver } from "../utils/JSONReviver";
import { ServerExtension } from "./ServerExtension";

export interface IConstructorParams {
  adminRights?: boolean;
  hackDifficulty?: number;
  hostname: string;
  ip?: string;
  isConnectedTo?: boolean;
  maxRam?: number;
  moneyAvailable?: number;
  numOpenPortsRequired?: number;
  organizationName?: string;
  purchasedByPlayer?: boolean;
  requiredHackingSkill?: number;
  serverGrowth?: number;
}

export class Server extends BaseServer {
  // Flag indicating whether this server has a backdoor installed by a player
  backdoorInstalled = false;

  // Initial server security level
  // (i.e. security level when the server was created)
  baseDifficulty = 1;

  // Server Security Level
  hackDifficulty = 1;

  // Minimum server security level that this server can be weakened to
  minDifficulty = 1;

  // How much money currently resides on the server and can be hacked
  moneyAvailable = 0;

  // Maximum amount of money that this server can hold
  moneyMax = 0;

  // Number of open ports required in order to gain admin/root access
  numOpenPortsRequired = 5;

  // How many ports are currently opened on the server
  openPortCount = 0;

  // Hacking level required to hack this server
  requiredHackingSkill = 1;

  // Parameter that affects how effectively this server's money can
  // be increased using the grow() Netscript function
  serverGrowth = 1;

  modules: Record<string, ServerExtension> = {};

  constructor(params: IConstructorParams = { hostname: "", ip: createRandomIp() }) {
    super(params);

    // "hacknet-node-X" hostnames are reserved for Hacknet Servers
    if (this.hostname.startsWith("hacknet-node-")) {
      this.hostname = createRandomString(10);
    }

    this.purchasedByPlayer = params.purchasedByPlayer != null ? params.purchasedByPlayer : false;

    //RAM, CPU speed and Scripts
    this.maxRam = params.maxRam != null ? params.maxRam : 0; //GB

    /* Hacking information (only valid for "foreign" aka non-purchased servers) */
    this.requiredHackingSkill = params.requiredHackingSkill != null ? params.requiredHackingSkill : 1;
    this.moneyAvailable =
      params.moneyAvailable != null ? params.moneyAvailable * BitNodeMultipliers.ServerStartingMoney : 0;
    this.moneyMax = 25 * this.moneyAvailable * BitNodeMultipliers.ServerMaxMoney;

    //Hack Difficulty is synonymous with server security. Base Difficulty = Starting difficulty
    this.hackDifficulty =
      params.hackDifficulty != null ? params.hackDifficulty * BitNodeMultipliers.ServerStartingSecurity : 1;
    this.baseDifficulty = this.hackDifficulty;
    this.minDifficulty = Math.max(1, Math.round(this.hackDifficulty / 3));
    this.serverGrowth = params.serverGrowth != null ? params.serverGrowth : 1; //Integer from 0 to 100. Affects money increase from grow()

    //Port information, required for porthacking servers to get admin rights
    this.numOpenPortsRequired = params.numOpenPortsRequired != null ? params.numOpenPortsRequired : 5;
  }

  /**
   * Ensures that the server's difficulty (server security) doesn't get too high
   */
  capDifficulty(): void {
    if (this.hackDifficulty < this.minDifficulty) {
      this.hackDifficulty = this.minDifficulty;
    }
    if (this.hackDifficulty < 1) {
      this.hackDifficulty = 1;
    }

    // Place some arbitrarily limit that realistically should never happen unless someone is
    // screwing around with the game
    if (this.hackDifficulty > 100) {
      this.hackDifficulty = 100;
    }
  }

  /**
   * Change this server's minimum security
   * @param n - Value by which to increase/decrease the server's minimum security
   * @param perc - Whether it should be changed by a percentage, or a flat value
   */
  changeMinimumSecurity(n: number, perc = false): void {
    if (perc) {
      this.minDifficulty *= n;
    } else {
      this.minDifficulty += n;
    }

    // Server security cannot go below 1
    this.minDifficulty = Math.max(1, this.minDifficulty);
  }

  /**
   * Change this server's maximum money
   * @param n - Value by which to change the server's maximum money
   */
  changeMaximumMoney(n: number): void {
    const softCap = 10e12;
    if (this.moneyMax > softCap) {
      const aboveCap = this.moneyMax - softCap;
      n = 1 + (n - 1) / Math.log(aboveCap) / Math.log(8);
    }

    this.moneyMax *= n;
  }

  /**
   * Strengthens a server's security level (difficulty) by the specified amount
   */
  fortify(amt: number): void {
    this.hackDifficulty += amt;
    this.capDifficulty();
  }

  /**
   * Lowers the server's security level (difficulty) by the specified amount)
   */
  weaken(amt: number): void {
    this.hackDifficulty -= amt * BitNodeMultipliers.ServerWeakenRate;
    this.capDifficulty();
  }

  /**
   * Serialize the current object to a JSON save state
   */
  toJSON(): any {
    return Generic_toJSON("Server", this);
  }

  // Initializes a Server Object from a JSON save state
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static fromJSON(value: any): Server {
    return Generic_fromJSON(Server, value.data);
  }
}

Reviver.constructors.Server = Server;
