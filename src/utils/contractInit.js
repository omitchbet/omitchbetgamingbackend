import Web3 from "web3";
import Provider from "@truffle/hdwallet-provider";
import Pool from "../abis/Pool.js";
import Contract from "../abis/contract-addresses.js";

export const contractInit = () => {
  const provider = new Provider(
    process.env.PRIVATE_KEY,
    "https://eth-rinkeby.alchemyapi.io/v2/xNEegDrklleB3pCQxntwknaFWbrwVyM8"
  );
  const web3 = new Web3(provider);
  const myContract = new web3.eth.Contract(Pool.abi, Contract.Pool);
  const walletAddress = web3.eth.accounts.privateKeyToAccount(
    process.env.PRIVATE_KEY
  );

  return { myContract, web3, provider, walletAddress };
};
