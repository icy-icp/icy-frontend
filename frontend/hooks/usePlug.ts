import { useState } from "react";
export interface RequestConnectParams {
  whitelist?: string[];
  host?: "https://network-address";
}

export interface TransferArgs {
  to: string;
  amount: number;
}

export const usePlug = (params?: RequestConnectParams) => {
  let globalWindow = window as any;
  const [whitelist, setWhitelist] = useState<string[]>(params?.whitelist ?? []);
  const host = params?.host ?? globalWindow.location.href;

  const isInstalled = () => !!globalWindow.ic?.plug;

  const verifyInstallation = () => {
    const installed = isInstalled();

    if (!installed) globalWindow.open("https://plugwallet.ooo/", "_blank");
  };

  const connect = async () => {
    verifyInstallation();
    let hasAllowed: Object | null = null;

    try {
      hasAllowed = await globalWindow?.ic?.plug?.requestConnect({
        whitelist,
        host: params?.host,
      });
    } catch (e) {
      hasAllowed = null;
    }

    return hasAllowed;
  };

  const isConnected = async () => await globalWindow?.ic?.plug.isConnected();
  const getAgent = () => globalWindow.ic.plug.agent;

  const createAgent = async () => {
    await globalWindow.ic.plug.createAgent({ whitelist, host });
  };

  const verifyConnection = async () => {
    const connected = await isConnected();

    if (!connected) {
      await connect();
    }

    if (connected && !getAgent()) {
      await createAgent();
    }
  };

  const requestBalance = async () => {
    await verifyConnection();

    return await globalWindow.ic?.plug?.requestBalance();
  };

  const requestTransfer = async ({ to, amount }: TransferArgs) => {
    await verifyConnection();

    const balance = await requestBalance();

    const result = { success: false, message: "" };

    if (balance >= amount) {
      const transfer = await globalWindow.ic?.plug?.requestTransfer({
        to,
        amount,
      });

      const transferStatus = transfer?.transactions?.transactions[0]?.status;

      if (transferStatus === "COMPLETED") {
        result.success = true;
        result.message = `Plug wallet transferred ${amount} e8s`;
      } else if (transferStatus === "PENDING") {
        result.message = "Plug wallet is pending.";
      }
      result.message = "Plug wallet failed to transfer";
    }

    result.message = "Plug wallet doesn't have enough balance";

    return result;
  };

  const getPrincipal = async () => {
    await verifyConnection();
    return globalWindow.ic?.plug?.agent?.getPrincipal();
  };

  interface ActorParams {
    canisterId: string;
    interfaceFactory: any;
  }

  const createActor = async ({ canisterId, interfaceFactory }: ActorParams) => {
    return await globalWindow.ic.plug.createActor({
      canisterId,
      interfaceFactory,
    });
  };

  return {
    isInstalled,
    verifyInstallation,
    connect,
    isConnected,
    verifyConnection,
    requestBalance,
    requestTransfer,
    getPrincipal,
    setWhitelist,
    createActor,
  };
};
