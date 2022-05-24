
import { INetscriptHelper } from "./INetscriptHelper";
import { WorkerScript } from "../Netscript/WorkerScript";
import { IPlayer } from "../PersonObjects/IPlayer";
import { getRamCost } from "../Netscript/RamCostGenerator";
import { Bitrunner as INetscriptBitrunner, bitrunnerExtension } from "../ScriptEditor/NetscriptDefinitions";
import { GetServer } from "../Server/AllServers";
import { Server } from "../Server/Server";
import { BitrunnerServerExtension } from "../Bitrunner/ServerExtension";

export function NetscriptBitrunner(
  player: IPlayer,
  workerScript: WorkerScript,
  helper: INetscriptHelper,
): INetscriptBitrunner {

  const checkBitrunnerAccess = function (func: string): number {
    if (player.bitNodeN === 14)
      return player.bitNodeN;
    else
      throw helper.makeRuntimeErrorMsg(`bitrunner.${func}`, "You do not currently have access to the Bitrunner API. You must be in BitNode-14.");
  }

  const updateRam = (funcName: string): void =>
    helper.updateDynamicRam(funcName, getRamCost(player, "bitrunner", funcName));

  return {
    getServerExtension: function (host?: string): bitrunnerExtension {
      updateRam("getServerExtension");
      checkBitrunnerAccess("getServerExtension");
      const server = GetServer(host || workerScript.hostname);
      if (server instanceof Server && server.modules.bitrunner){
          return <BitrunnerServerExtension>server.modules.bitrunner;
      }
      throw helper.makeRuntimeErrorMsg(`bitrunner.getServerExtension`, "Bitrunner module is loaded incorrectly or there is a type mismatch.");
    }
  };
}
