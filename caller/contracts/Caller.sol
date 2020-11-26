pragma solidity 0.6.0;
import '../../oracle/contracts/IETHPriceOracle.sol';
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract Caller is Ownable {
    private uint256 ETHPrice;
    IETHPriceOracle private ETHPriceOracleInstance;
    address private ETHPriceOracleAddress;
    mapping(uint256 => bool) myRequests;
    event NewOracleAddressRegistered(address oracleAddress);
    event ReceivedNewRequestId(uint256 id);
    event ETHPriceUpdated(uint256 ETHPrice, uint256 id);

    setOracleInstanceAddress(address _ETHPriceOracleInstanceAddress) public onlyOwner {
      ETHPriceOracleAddress = _ETHPriceOracleInstanceAddress;
      ETHPriceOracleInstance = IETHPriceOracle(ETHPriceOracleAddress);

      emit NewOracleAddressRegistered(ETHPriceOracleAddress);
    }

    updateETHPrice() public {
      uint256 id = ETHPriceOracleInstance.getLatestETHPrice();
      myRequests[id] = true;

      emit ReceivedNewRequestId(id);
    }

    function callback(uint256 _ethPrice, uint256 _id) public onlyOracle {
      require(myRequests[id] == true, "id is not valid");
      ETHPrice = _ethPrice;
      delete myRequests[id];

      emit ETHPriceUpdated(id);
    }

    modifier onlyOracle() {
      require(msg.sender == ETHPriceOracleAddress, "caller is not the oracle");
      _;
    }
}
