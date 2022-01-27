# iExec-Space-Lottery

A lottery based on iExec technology with NFT

LotteryContract =>

- Players mint NFT ticket with an ID vs ETH
- Start the lottery
- Fake a random number with block complexty (not a real random) to get a range
- Owner contract is the obly able to mint the both NFT
- Send a NFT Winner Ticket to the winner + give him the funds
- 9% of taxes stays to the Lottey Smart contract

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
