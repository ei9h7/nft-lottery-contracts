// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

interface INFTLotteryTicket  {
    function sendTicket(address _receiver) external;
    function ownerOf(uint256 tokenId) external returns (address);
    function getActualId() external returns (uint256);
}
