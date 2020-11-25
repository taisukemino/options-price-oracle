pragma solidity 0.6.0;
import "openzeppelin-solidity/contracts/access/Ownable.sol";

interface ETHPriceOracle is Ownable {
    uint256 private nonce = 0;
    uint256 private modulus = 1000;
    mapping(uint256 => bool) pendingRequests;
    event GetLatestETHPrice(address callerAddress, uint id);
    function getLatestETHPrice() public returns (uint256){
        nonce++;
        uint256 id = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce))) % modulus;
        pendingRequests[id] = true;

        emit event GetLatestETHPrice(address msg.sender, uint id);

        return id;
    }
