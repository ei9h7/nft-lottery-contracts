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

	const randomNumberConsumerFactory = await hre.ethers.getContractFactory('RandomNumberConsumer');
	const randomNumberConsumerContract = await randomNumberConsumerFactory.deploy('0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B', '0x01BE23585060835E02B77ef475b0Cc51aA1e0709');
	await randomNumberConsumerContract.deployed();

	const linkToken = await hre.ethers.getContractAt('ERC20', '0x01BE23585060835E02B77ef475b0Cc51aA1e0709');
	await linkToken.transfer(randomNumberConsumerContract.address, '3000000000000000000'); // 3 LINK
	console.log(await linkToken.balanceOf(deployer.address));
	console.log(await linkToken.balanceOf(randomNumberConsumerContract.address));

	await randomNumberConsumerContract.getRandomNumber();

	const sleep = (seconds: number) => {
		return new Promise((resolve) => setTimeout(() => resolve(null), seconds * 1000));
	};
	await sleep(5);
	console.log(await randomNumberConsumerContract.randomResult());
	console.log(await linkToken.balanceOf(randomNumberConsumerContract.address));
	await randomNumberConsumerContract.getRandomNumber();
	await sleep(5);
	console.log(await randomNumberConsumerContract.randomResult());
	console.log(await linkToken.balanceOf(randomNumberConsumerContract.address));
}

main()
	.then(() => process.exit())
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
