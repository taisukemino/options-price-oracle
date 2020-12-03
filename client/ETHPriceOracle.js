import BN from "bn.js";
import account from "./Account.js";
import OracleJSON from "../contracts/EthPriceOracle.json";

const SLEEP_INTERVAL = process.env.SLEEP_INTERVAL || 2000;
const PRIVATE_KEY_FILE_NAME =
  process.env.PRIVATE_KEY_FILE || "./oracle_private_key";
const CHUNK_SIZE = process.env.CHUNK_SIZE || 3;
const MAX_RETRIES = process.env.MAX_RETRIES || 5;
let pendingRequests = [];

async function init() {
  const { ownerAddress, web3js, client } = account.loadAccount(
    PRIVATE_KEY_FILE_NAME
  );
  const oracleContract = await getOracleContract(web3js);
  filterEvents(oracleContract, web3js);
  return { oracleContract, ownerAddress, client };
}

async function getOracleContract(web3js) {
  const networkId = await web3js.eth.net.getId();
  const ETHPriceOracleContract = new web3js.eth.Contract(
    ETHPriceOracleJSON.abi,
    ETHPriceOracleJSON.networks[networkId].address
  );
  return ETHPriceOracleContract;
}

async function filterEvents(oracleContract, web3js) {
  oracleContract.events.GetLatestETHPrice(async (err, event) => {
    if (err) {
      console.error("Error on event", err);
      return;
    }
    await addRequestToQueue(event);
  });
  oracleContract.events.SetLatestETHPrice(async (err, event) => {
    if (err) {
      console.error("Error on event", err);
      // do something
    }
  });
}

async function addRequestToQueue(event) {
  const callerAddress = event.returnValues.callerAddress;
  const id = event.returnValues.id;
  pendingRequests.push({ callerAddress, id });
}

async function processQueue(oracleContract, ownerAddress) {
  let processedRequests = 0;
  while (pendingRequests.length > 0 && processedRequests < CHUNK_SIZE) {
    const req = pendingRequests.shift();
    await this.processRequest(
      oracleContract,
      ownerAddress,
      req.id,
      req.callerAddress
    );
    processedRequests++;
  }
}

async function processRequest(oracleContract, ownerAddress, id, callerAddress) {
  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      const ETHPrice = await this.retrieveLatestETHPrice();
      await setLatestETHPrice(
        oracleContract,
        callerAddress,
        ownerAddress,
        ETHPrice,
        id
      );
      return;
    } catch (error) {
      if (retries === MAX_RETRIES - 1) {
        await setLatestETHPrice(
          oracleContract,
          callerAddress,
          ownerAddress,
          "0",
          id
        );
        return;
      }
      retries++;
    }
  }
}

async function setLatestETHPrice(
  oracleContract,
  callerAddress,
  ownerAddress,
  ETHPrice,
  id
) {
  ETHPrice = ETHPrice.replace(".", "");
  const multiplier = new BN(10 ** 10, 10);
  const ETHPriceInt = new BN(parseInt(ETHPrice), 10).mul(multiplier);
  const idInt = new BN(parseInt(id));
  try {
    await oracleContract.methods
      .setLatestETHPrice(
        ETHPriceInt.toString(),
        callerAddress,
        idInt.toString()
      )
      .send({ from: ownerAddress });
  } catch (error) {
    console.log("Error encountered while calling setLatestETHPrice.");
  }
}

(async () => {
  const { oracleContract, ownerAddress, client } = await init();
  process.on("SIGINT", () => {
    console.log("Calling client.disconnect()");
    client.disconnect();
    process.exit();
  });
  setInterval(async () => {
    await processQueue(oracleContract, ownerAddress);
  }, SLEEP_INTERVAL);
})();
