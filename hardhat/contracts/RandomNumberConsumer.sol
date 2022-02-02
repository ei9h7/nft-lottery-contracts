// SPDX-License-Identifier: MIT
pragma solidity ^0.6.5;

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract RandomNumberConsumer is VRFConsumerBase, Ownable {
    bytes32 internal keyHash;
    uint256 internal fee;

    uint256 public randomResult;
    ERC20 internal immutable LinkTokenContract;

    constructor(address vrfCoordinator,address linkToken) public
        VRFConsumerBase(
            vrfCoordinator, // VRF Coordinator
            linkToken // LINK Token
        )
    {
        LinkTokenContract = ERC20(linkToken);
        keyHash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
        fee = 0.1 * 10**18; // 0.1 LINK (Varies by network)
    }

    /**
     * Requests randomness
     */
    function getRandomNumber() public returns (bytes32 requestId) {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
        return requestRandomness(keyHash, fee);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        randomResult = randomness;
    }

     function withdrawLink() external {
        LinkTokenContract.transfer(msg.sender, LinkTokenContract.balanceOf(address(this)));   
     }
    
}
