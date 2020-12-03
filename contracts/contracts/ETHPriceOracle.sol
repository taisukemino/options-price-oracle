pragma solidity 0.6.0;
import "./interfaces/ICaller.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

interface ETHPriceOracle is Ownable {
    ICaller private ICallerInstance;

    uint256 private nonce = 0;
    uint256 private modulus = 1000;
    mapping(uint256 => bool) pendingRequests;
    
    event GetLatestETHPrice(address callerAddress, uint id);
    event SetLatestETHPrice(uint256 ethPrice, address callerAddress);

    function getLatestETHPrice() public returns (uint256){
        nonce++;
        uint256 id = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce))) % modulus;
        pendingRequests[id] = true;

        emit event GetLatestETHPrice(address msg.sender, uint id);

        return id;
    }

    function setLatestETHPrice(uint256 _ethPrice, address callerAddress, uint256 _id) public onlyOwner {
        require(pendingRequests[_id] == true, "This request is not in my pending list.");
        delete pendingRequests[_id];
        ICallerInstance = ICaller(callerAddress);
        ICallerInstance.callback(_ethPrice, _id);
      
        emit SetLatestETHPrice(_ethPrice, callerAddress); 
    }
}

// continue to the oracle 2 zombies course chapter 13
