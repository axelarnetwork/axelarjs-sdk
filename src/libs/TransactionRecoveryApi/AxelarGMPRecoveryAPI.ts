import { AxelarRecoveryAPIConfig, Environment } from "../types";
import { AxelarRecoveryApi } from "./AxelarRecoveryApi";

export class AxelarGMPRecoveryAPI extends AxelarRecoveryApi {
  
    public constructor(config: AxelarRecoveryAPIConfig) {
      super(config);
    }

    public async confirmGatewayTx(params: any) { //TODO

    }

}