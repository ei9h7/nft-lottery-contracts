// SPDX-License-Identifier: MIT
pragma solidity ^0.6.5;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
pragma experimental ABIEncoderV2;


contract NFTWinnerTicket is  Ownable, ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _ticketsId;

   struct NFTStruct { 
      uint256 id;
      string  url;
   }

    address public lotteryAddress;

    constructor() public ERC721("WinnerTicket", "WIN") {
         _ticketsId.increment();
    }

    function setLotteryAddress(address _lotteryAddress) public onlyOwner {
        lotteryAddress = _lotteryAddress;
    }

    function sendWinnerNFT(address _receiver) public {
        require(
            msg.sender == lotteryAddress,
            "This function is only callable by the Lottery contract"
        );
      
        uint256 newTicketId = _ticketsId.current();
        _safeMint(_receiver, newTicketId);
        // Cheating to get a different image through this api
        _setBaseURI("https://picsum.photos/200");
        _ticketsId.increment();
    }

    function getTokens(address _owner)
        external
        view
        returns (NFTStruct[] memory ownerTokens)
    {
        // Get Ticket balance of _owner
        uint256 numberOfToken = balanceOf(_owner);
        
        // Returns empty array if no tokens
        if (numberOfToken == 0) {
            return new NFTStruct[](0);
        } else {
            NFTStruct[] memory tokens = new NFTStruct[](numberOfToken);
            uint256 totalSupply = totalSupply(); 
            uint256 resultIndex = 1;

            uint256 ticketId;

            for (ticketId = 1; ticketId <= totalSupply; ticketId++) {
                if (ownerOf(ticketId) == _owner) {
                    tokens[resultIndex-1] = NFTStruct(ticketId, tokenURI(resultIndex) );
                    resultIndex++;
                }
            }

            return tokens;
        }
    }
}
