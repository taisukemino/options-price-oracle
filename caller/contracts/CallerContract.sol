pragma solidity 0.6.0;
import '../../oracle/contracts/IETHPriceOracle.sol';

contract CallerContract {
    IETHPriceOracle private ETHPriceOracleInstance;
    address private ETHPriceOracleAddress;
    event newOracleAddressRegistered(address oracleAddress);

    setOracleInstanceAddress(address _oracleInstanceAddress) public {
      ETHPriceOracleAddress = _ETHPriceOracleInstanceAddress;
      ETHPriceOracleInstance = IETHPriceOracle(ETHPriceOracleAddress);
      
      emit newOracleAddressRegistered(ETHPriceOracleAddress);
    }
}
