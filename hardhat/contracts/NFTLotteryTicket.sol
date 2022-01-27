// SPDX-License-Identifier: MIT
pragma solidity ^0.6.5;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "hardhat/console.sol";
contract NFTLotteryTicket is  Ownable, ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _ticketsId;
    
    address public lotteryAddress;

    constructor() public ERC721("LotteryTicket", "TCK") {
        _ticketsId.increment();
    }

    function sendTicket(address _receiver) public {
        require(
            msg.sender == lotteryAddress,
            "This function is only callable by the Lottery contract"
        );
      
        uint256 newTicketId = _ticketsId.current();
        _safeMint(_receiver, newTicketId);
        _ticketsId.increment();
    }

    function getActualId() public view returns (uint256) {
        return _ticketsId.current();
    }

    function setLotteryAddress(address _lotteryAddress) public onlyOwner {
        lotteryAddress = _lotteryAddress;
    }

    function getTokens(address _owner)
        external
        view
        returns (uint256[] memory ownerTokens)
    {
        // Get Ticket balance of _owner
        uint256 numberOfToken = balanceOf(_owner);
        
        // Returns empty array if no tokens
        if (numberOfToken == 0) {
            return new uint256[](0);
        } else {
            uint256[] memory tokens = new uint256[](numberOfToken);
            uint256 totalSupply = totalSupply(); 
            uint256 resultIndex = 1;

            uint256 ticketId;

            for (ticketId = 1; ticketId <= totalSupply; ticketId++) {
                if (ownerOf(ticketId) == _owner) {
                    tokens[resultIndex-1] = ticketId;
                    resultIndex++;
                }
            }

            return tokens;
        }
    }
}
