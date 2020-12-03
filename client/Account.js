import fs from "fs";
import Web3 from "web3";
import {
  Client,
  NonceTxMiddleware,
  SignedTxMiddleware,
  LocalAddress,
  CryptoUtils,
  LoomProvider
} from "loom-js";

function loadAccount(privateKeyFileName) {
  const extdevChainId = "extdev-plasma-us1";
  const privateKeyString = fs.readFileSync(privateKeyFileName, "utf-8");
  const privateKey = CryptoUtils.B64ToUint8Array(privateKeyString);
  const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);
  const client = new Client(
    extdevChainId,
    "wss://extdev-plasma-us1.dappchains.com/websocket",
    "wss://extdev-plasma-us1.dappchains.com/queryws"
  );
  client.txMiddleware = [
    new NonceTxMiddleware(publicKey, client),
    new SignedTxMiddleware(privateKey)
  ];
  client.on("error", (msg) => {
    console.error("Connection error", msg);
  });
  return {
    ownerAddress: LocalAddress.fromPublicKey(publicKey).toString(),
    web3: new Web3(new LoomProvider(client, privateKey)),
    client
  };
}

module.exports = {
  loadAccount
};
