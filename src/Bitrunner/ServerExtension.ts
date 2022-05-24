import { serverMetadata } from "../Server/data/servers";
import { ServerExtension } from "../Server/ServerExtension";
import { IMinMaxRange } from "../types";
import { BitrunnerConstants } from "./data/Constants";

function minValue(x: number | IMinMaxRange | undefined): number {
  if (typeof x === "number") return x;
  if (typeof x === "undefined") return 1;
  if (x.min) return x.min;

  throw Error(`Bitrunner: minValue of a metadata value could not be determined.`);
}

export class BitrunnerServerExtension extends ServerExtension {
  readonly threat: number;
  readonly damageType: number;
  readonly maxHealth: number;
  public health: number;
  public target: string;
  readonly maxCooldown: number;
  public cooldown: number;

  constructor(serverName: string) {
    super();

    const metadata = serverMetadata.find((entry) => (entry.hostname = serverName));
    if (!metadata) throw Error(`Bitrunner: server name non-existent in metadata.`);

    this.threat = minValue(metadata.networkLayer) * BitrunnerConstants.threatMult;
    this.damageType = minValue(metadata.networkLayer) * BitrunnerConstants.damageMult;
    this.maxHealth =
      minValue(metadata.networkLayer) * minValue(metadata.maxRamExponent) * BitrunnerConstants.healthMult;
    this.health = this.maxHealth;
    this.target = "home";
    this.maxCooldown =
      minValue(metadata.requiredHackingSkill) * BitrunnerConstants.cooldownMult + BitrunnerConstants.cooldownBase;
    this.cooldown = this.maxCooldown;
  }
}
