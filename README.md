# iExec-NFT-Lottery

A lottery with NFTs based on iExec technology

LotteryContract =>

- Players mint NFT ticket with ETH
- Start the lottery
- Fake a psuedo-random number with block complexity (not a real random) to get a range
- Owner contract is the only able to mint both NFTs (Tickets & Winner)
- Send a NFT Winner Ticket to the winner + give him the funds
- 9% Smart contract

NFTLotteryTicket =>

- Classic ERC721
- Has an ID
- Only mintable by the lottery contract

NFTWinnerTicket =>

- Classic ERC721
- Has an ID AND an URL
- Only mintable by the lottery contract

For a V2 =>

- Use a custom ORACLE with iExec technology (Didn't find the address of proxy in the documentation) OR Chainlink VRF
- Implements a Timer to auto trigger the lottery launch on ticket buying
- Use IPFS for real NFT storage
