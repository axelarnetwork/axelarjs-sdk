import { ethers, Wallet } from "ethers";
export declare function createWallet(): ethers.Wallet;
export declare function signOtc(wallet: Wallet, message: string): Promise<string>;
declare const _exports: {
    createWallet: typeof createWallet;
    signOtc: typeof signOtc;
};
export default _exports;
//# sourceMappingURL=wallet.d.ts.map