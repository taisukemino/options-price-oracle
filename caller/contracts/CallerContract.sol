pragma solidity 0.6.0;
import '../../oracle/contracts/IETHPriceOracle.sol';
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract CallerContract is Ownable {
    IETHPriceOracle private ETHPriceOracleInstance;
    address private ETHPriceOracleAddress;
    event newOracleAddressRegistered(address oracleAddress);

    setOracleInstanceAddress(address _ETHPriceOracleInstanceAddress) public onlyOwner {
      ETHPriceOracleAddress = _ETHPriceOracleInstanceAddress;
      ETHPriceOracleInstance = IETHPriceOracle(ETHPriceOracleAddress);
      
      emit newOracleAddressRegistered(ETHPriceOracleAddress);
    }
}
