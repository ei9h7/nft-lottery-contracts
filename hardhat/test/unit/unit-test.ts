import { expect } from 'chai';
import { Lottery, Lottery__factory, NFTLotteryTicket, NFTLotteryTicket__factory, NFTWinnerTicket, NFTWinnerTicket__factory } from '../../typechain';
import hre from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber } from 'ethers';

describe('Lottery', function () {
	let ticketFactory: NFTLotteryTicket__factory;
	let ticketContract: NFTLotteryTicket;

	let winnerTicketFactory: NFTWinnerTicket__factory;
	let winnerTicketContract: NFTWinnerTicket;

	let lotteryFactory: Lottery__factory;
	let lotteryContract: Lottery;

	let deployer: SignerWithAddress;
	let user1: SignerWithAddress;
	let user2: SignerWithAddress;

	// `beforeEach` will run before each test, re-deploying the contract every
	// time. It receives a callback, which can be async.
	beforeEach(async function () {
		[deployer, user1, user2] = await hre.ethers.getSigners();

		// Deploy Lottery Ticket
		ticketFactory = await hre.ethers.getContractFactory('NFTLotteryTicket');
		ticketContract = await ticketFactory.deploy();
		await ticketContract.deployed();

		// Deploy Winner Ticket
		winnerTicketFactory = await hre.ethers.getContractFactory('NFTWinnerTicket');
		winnerTicketContract = await winnerTicketFactory.deploy();
		await winnerTicketContract.deployed();

		// Deploy Lottery Contract
		lotteryFactory = await hre.ethers.getContractFactory('Lottery');
		lotteryContract = await lotteryFactory.deploy(ticketContract.address, winnerTicketContract.address);
		await lotteryContract.deployed();

		await ticketContract.setLotteryAddress(lotteryContract.address);
		await winnerTicketContract.setLotteryAddress(lotteryContract.address);
	});

	it('It should deploy the Lottery', async function () {
		expect(await lotteryContract.isInProgress()).to.equal(false);
	});

	it('It should buy NFT tickets', async function () {
		await lotteryContract.buyTicket({ value: '10000000000000000' });
		expect(await ticketContract.balanceOf(deployer.address)).to.equal(1);
		await lotteryContract.connect(user1).buyTicket({ value: '10000000000000000' });
		await expect(lotteryContract.connect(user1).buyTicket({ value: '4000' })).to.be.revertedWith('Need at least 0,01 ETH to mint a Ticket');
		await lotteryContract.connect(user1).buyTicket({ value: '10000000000000000' });
		expect(await ticketContract.balanceOf(user1.address)).to.equal(2);
	});

	it('It should return tickets', async function () {
		await lotteryContract.connect(user2).buyTicket({ value: '10000000000000000' });
		await lotteryContract.connect(user1).buyTicket({ value: '10000000000000000' });
		await lotteryContract.connect(user2).buyTicket({ value: '10000000000000000' });
		await lotteryContract.connect(user1).buyTicket({ value: '10000000000000000' });
		await lotteryContract.connect(user1).buyTicket({ value: '10000000000000000' });

		const deployerTokens = await ticketContract.getTokens(deployer.address);
		const user1Tokens = await ticketContract.getTokens(user1.address);
		const user2Tokens = await ticketContract.getTokens(user2.address);

		expect(deployerTokens.length).to.be.eq(0);

		expect(user1Tokens[0]).to.be.eq(BigNumber.from('2'));
		expect(user1Tokens[1]).to.be.eq(BigNumber.from('4'));
		expect(user1Tokens[2]).to.be.eq(BigNumber.from('5'));

		expect(user2Tokens[0]).to.be.eq(BigNumber.from('1'));
		expect(user2Tokens[1]).to.be.eq(BigNumber.from('3'));
	});

	it('It should start lottery ', async function () {
		await expect(lotteryContract.startLottery()).to.be.revertedWith('More than two lottery tickets have to be minted');
		await lotteryContract.buyTicket({ value: '10000000000000000' });
		await lotteryContract.buyTicket({ value: '10000000000000000' });
		await lotteryContract.startLottery();
	});

	it('It should send Winner Tickets', async function () {
		// // Impersonate and take the Signer of the Lottery contract
		// await hre.network.provider.request({
		// 	method: 'hardhat_impersonateAccount',
		// 	params: [lotteryContract.address],
		// });
		// await hre.network.provider.send('hardhat_setBalance', [lotteryContract.address, '0x10000']);
		// const lotterySigner = await hre.ethers.getSigner(lotteryContract.address);
		// await winnerTicketContract.connect(lotterySigner).sendWinnerNFT(user2.address);
		// // Stop Impersonate
		// await hre.network.provider.request({
		// 	method: 'hardhat_stopImpersonatingAccount',
		// 	params: [lotteryContract.address],
		// });

		await expect(winnerTicketContract.sendWinnerNFT(user1.address)).to.be.revertedWith('This function is only callable by the Lottery contract');
	});
});
