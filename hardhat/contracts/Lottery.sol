// SPDX-License-Identifier: MIT
pragma solidity ^0.6.5;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/INFTLotteryTicket.sol";
import "./interfaces/INFTWinnerTicket.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";


contract Lottery is Ownable {
    event GetWinner();
    event StartLottery();

    uint256 RATE = 9;

    INFTLotteryTicket internal immutable LotteryTicketContract;
    INFTWinnerTicket internal immutable WinnerTicketContract;

    address payable[] public players;

    mapping(address => uint256) public amountDueTo;

    bool public isInProgress;

    uint256 public drawBalance;
    // Ticket index to get the range for the draw
    uint256 public lastTicketId;
    uint256 public actualTicketId;

    // Actual Winner Ticket ID
    uint256 public winnerTicketId;
    address payable public recentWinner;


    constructor(address _NFTTicketAddress, address _NFTWinnerTicketAddress) public {
        isInProgress = false;
        LotteryTicketContract = INFTLotteryTicket(_NFTTicketAddress);
        WinnerTicketContract = INFTWinnerTicket(_NFTWinnerTicketAddress);
        lastTicketId = 1;
    }

    // Buy a lottery Ticket with an ID
    function buyTicket() public payable  {
        require(isInProgress == false, "Drawing in progress");
        require(
            msg.value >= 10000000000000000,
            "Need at least 0,01 ETH to mint a Ticket"
        );

        // Send ticket to buyer
        LotteryTicketContract.sendTicket(msg.sender);

        // Actualize balance
        drawBalance += msg.value;
        
        // Add player to the lottery
        players.push(payable(msg.sender));
    }

    function startLottery() public onlyOwner {
        actualTicketId = LotteryTicketContract.getActualId();
        require(actualTicketId > 2, "More than two lottery tickets have to be minted");
        isInProgress = true;
        computeWinner();
    }

    function computeWinner() internal  {
        actualTicketId = LotteryTicketContract.getActualId();
        winnerTicketId = getRandomNumber() % (actualTicketId - lastTicketId - 1) + lastTicketId;
        lastTicketId = actualTicketId;
        endLottery();
    }


    function endLottery() internal {
        recentWinner = payable(LotteryTicketContract.ownerOf(winnerTicketId));
        WinnerTicketContract.sendWinnerNFT(recentWinner);
        amountDueTo[recentWinner] += SafeMath.sub(
            drawBalance, 
            SafeMath.div(SafeMath.mul(drawBalance,5),100)); // 5 % fee
        isInProgress = false;
        // Remove all addresses from next gamble
        players = new address payable[](0);
        // Reset draw balance
        drawBalance = 0;
    }



    // Claim my rewards
    function claim() public payable  {
        require(isRewardClaimable(msg.sender), "You have no reward to claim");
        msg.sender.transfer(amountDueTo[msg.sender]);
        amountDueTo[msg.sender] = 0;
    }

    function isRewardClaimable(address _potentialWinner) public view returns(bool){
        if(amountDueTo[_potentialWinner] == 0) {
            return false;
        }
        else {
            return true;
        }
    }

    // Fake a random number
    function getRandomNumber() internal view returns(uint){
        return uint(keccak256(abi.encodePacked(block.timestamp,block.difficulty,  msg.sender)));
    }

    function withdraw() external payable onlyOwner {
        payable(msg.sender).transfer(address(this).balance);   
    }
}
