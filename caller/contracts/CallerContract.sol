pragma solidity 0.6.0;

contract CallerContract {
    address private oracleAddress;

    setOracleInstanceAddress(address _oracleInstanceAddress) public {
      oracleAddress = _oracleInstanceAddress;
    }
}
