// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
interface ILinkToken {
    function allowance(address owner, address spender) external returns (bool success);
    function approve(address spender, uint256 value)external returns (bool success);
    function balanceOf(address owner) external returns (uint256 balance);
    function decimals() external returns (uint8 decimalPlaces);
    function increaseApproval(address spender, uint256 subtractedValue) external;
    function increaseAllowance(address spender, uint256 subtractedValue) external;
    function transfer(address to, uint256 value) external returns (bool success) ;
    function transferFrom(address from, address to, uint256 value) external returns (bool success);
}