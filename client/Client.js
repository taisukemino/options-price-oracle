import account from "./Account.js";
import CallerJSON from "../contracts/CallerContract.json";
import OracleJSON from "../contracts/EthPriceOracle.json";

const SLEEP_INTERVAL = process.env.SLEEP_INTERVAL || 2000;
const PRIVATE_KEY_FILE_NAME =
  process.env.PRIVATE_KEY_FILE || "./caller_private_key";

async function getCallerContract(web3js) {
  const networkId = await web3js.eth.net.getId();
  return new web3js.eth.Contract(
    CallerJSON.abi,
    CallerJSON.networks[networkId].address
  );
}

async function retrieveLatestETHPrice() {
  const res = await fetch("https://api.binance.com/api/v3/ticker/price", {
    params: {
      symbol: "ETHUSDT"
    },
    method: "get"
  });
  const data = await res.json();
  return data.price;
}

retrieveLatestETHPrice()
  .then((data) => {
    console.log(JSON.stringify(data));
  })
  .catch((err) => {
    console.log(err);
  });

async function filterEvents(callerContract) {
  callerContract.events.PriceUpdatedEvent(
    { filter: {} },
    async (err, event) => {
      if (err) console.error("Error on event", err);
      console.log(
        "* New PriceUpdated event. ethPrice: " + event.returnValues.ethPrice
      );
    }
  );
  callerContract.events.ReceivedNewRequestIdEvent(
    { filter: {} },
    async (err, event) => {
      if (err) console.error("Error on event", err);
    }
  );
}

async function init() {
  const { ownerAddress, web3js, client } = account.loadAccount(
    PRIVATE_KEY_FILE_NAME
  );
  const callerContract = await getCallerContract(web3js);
  filterEvents(callerContract);
  return { callerContract, ownerAddress, client, web3js };
}

(async () => {
  const { callerContract, ownerAddress, client, web3js } = await init();
  process.on("SIGINT", () => {
    console.log("Calling client.disconnect()");
    client.disconnect();
    process.exit();
  });
  const networkId = await web3js.eth.net.getId();
  const oracleAddress = OracleJSON.networks[networkId].address;
  await callerContract.methods
    .setOracleInstanceAddress(oracleAddress)
    .send({ from: ownerAddress });
  setInterval(async () => {
    await callerContract.methods.updateETHPrice().send({ from: ownerAddress });
  }, SLEEP_INTERVAL);
})();
