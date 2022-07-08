export const validateEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const getUserBalance = async (web3, myContract, user_id) => {
  let balance = await myContract.methods.bettingBalance(user_id).call();
  balance = Number(web3.utils.fromWei(balance, "ether"));
  return balance;
};
