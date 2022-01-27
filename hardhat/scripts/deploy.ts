import hre from 'hardhat';
async function main() {
	const [deployer] = await hre.ethers.getSigners();

	console.log(`Deploying with the address : ${deployer.address}`);
	// Deploy lottery ticket NFT contract
	const ticketFactory = await hre.ethers.getContractFactory('NFTLotteryTicket');
	const ticketContract = await ticketFactory.deploy();
	await ticketContract.deployed();
	console.log(`LotteryTicket NFT : ${ticketContract.address}`);

	// Deploy Winner ticket NFT contract
	const winnerTicketFactory = await hre.ethers.getContractFactory('NFTWinnerTicket');
	const winnerTicketContract = await winnerTicketFactory.deploy();
	await winnerTicketContract.deployed();
	console.log(`Winner Ticket NFT : ${winnerTicketContract.address}`);

	// Deploy Lottery contract
	const lotteryFactory = await hre.ethers.getContractFactory('Lottery');
	const lotteryContract = await lotteryFactory.deploy(ticketContract.address, winnerTicketContract.address);
	await lotteryContract.deployed();
	console.log(`Lottery  : ${lotteryContract.address}`);

	// Set Lottery address in NFT contract
	await ticketContract.setLotteryAddress(lotteryContract.address);
	await winnerTicketContract.setLotteryAddress(lotteryContract.address);
	console.log('Lottery set');
}

main()
	.then(() => process.exit())
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
