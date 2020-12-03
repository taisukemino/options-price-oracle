pragma solidity 0.6.0;

interface IETHPriceOracle {
    function getLatestETHPrice() public returns (uint256);
}
