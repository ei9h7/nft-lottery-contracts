import { Lottery, Lottery__factory, NFTLotteryTicket, NFTLotteryTicket__factory, NFTWinnerTicket, NFTWinnerTicket__factory } from '../../typechain';
import hre from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import _ from 'lodash';

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

	let draw1Players: SignerWithAddress[];
	let draw1Loosers: SignerWithAddress[];
	let draw1Winner: SignerWithAddress;

	let recentWinnerAddress: string;

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

		// Buy Tickets
		await lotteryContract.buyTicket({ value: '10000000000000000' });
		await lotteryContract.connect(user2).buyTicket({ value: '10000000000000000' });
		await lotteryContract.connect(user1).buyTicket({ value: '10000000000000000' });
		await lotteryContract.connect(user2).buyTicket({ value: '10000000000000000' });
		await lotteryContract.connect(user1).buyTicket({ value: '10000000000000000' });
		await lotteryContract.connect(user1).buyTicket({ value: '10000000000000000' });

		// Start Lottery
		await lotteryContract.startLottery();
		draw1Players = [deployer, user1, user2];

		// Verify balance after ticket selling
		expect(await hre.ethers.provider.getBalance(lotteryContract.address)).to.be.eq('60000000000000000');

		// Get the winner
		recentWinnerAddress = await lotteryContract.recentWinner();
		// Deduce Signers
		draw1Loosers = draw1Players.filter((player) => player.address !== recentWinnerAddress);
		draw1Winner = draw1Players.find((player) => player.address === recentWinnerAddress) as SignerWithAddress;
	});

	it('One draw', async function () {
		// Expect winner in players
		expect(recentWinnerAddress).to.be.oneOf([deployer.address, user1.address, user2.address]);
		// Test is reward claimable
		expect(await lotteryContract.isRewardClaimable(recentWinnerAddress)).to.be.eq(true);

		// Test reward not claimable for loosers
		draw1Loosers.forEach(async (looser) => {
			expect(await lotteryContract.isRewardClaimable(looser.address)).to.be.eq(false);
		});

		// Excpect lottery not in progress anymore
		expect(await lotteryContract.isInProgress()).to.be.eq(false);

		// Verify bounty is set up
		expect(await lotteryContract.amountDueTo(recentWinnerAddress)).to.be.eq('57000000000000000');

		// Claim bounty for winner
		await lotteryContract.connect(draw1Winner).claim();

		expect(await hre.ethers.provider.getBalance(lotteryContract.address)).to.be.eq('3000000000000000');
	});

	it('Two draws', async function () {
		const draw2Players = [deployer, user2];
		// Launch a second draw
		await lotteryContract.buyTicket({ value: '10000000000000000' });
		await lotteryContract.buyTicket({ value: '10000000000000000' });
		await lotteryContract.connect(user2).buyTicket({ value: '10000000000000000' });

		// Verify balance after ticket selling
		expect(await hre.ethers.provider.getBalance(lotteryContract.address)).to.be.eq('90000000000000000');

		// Start Lottery a second time
		await lotteryContract.startLottery();

		// Excpect lottery not in progress anymore
		expect(await lotteryContract.isInProgress()).to.be.eq(false);

		// Get the winner of draw 2
		recentWinnerAddress = await lotteryContract.recentWinner();

		// Deduce Signers

		const winner_s = _.sortedUniq([draw1Winner, draw2Players.find((player) => player.address === recentWinnerAddress) as SignerWithAddress]);
		const loosers = draw1Players.filter((player) => !winner_s.includes(player));

		// Expect winner in players
		expect(recentWinnerAddress).to.be.oneOf([deployer.address, user2.address]);

		// Test reward not claimable for loosers
		winner_s.forEach(async (winner) => {
			expect(await lotteryContract.isRewardClaimable(winner.address)).to.be.eq(true);
		});

		// // Test reward not claimable for loosers
		loosers.forEach(async (looser) => {
			expect(await lotteryContract.isRewardClaimable(looser.address)).to.be.eq(false);
		});

		// Assert merging of bounty if same winner
		if (winner_s.length == 1) {
			// Verify bounty is set up
			expect(await lotteryContract.amountDueTo(winner_s[0].address)).to.be.eq('85500000000000000');
		} else {
			expect(await lotteryContract.amountDueTo(draw1Winner.address)).to.be.eq('57000000000000000');
			expect(await lotteryContract.amountDueTo(recentWinnerAddress)).to.be.eq('28500000000000000');
		}

		// Claim bounty for winner
		winner_s.forEach((winner) => {
			lotteryContract.connect(winner).claim();
		});

		await delay(2);

		expect(await hre.ethers.provider.getBalance(lotteryContract.address)).to.be.eq('4500000000000000');
	});
});
function delay(n: number) {
	return new Promise(function (resolve) {
		setTimeout(resolve, n * 1000);
	});
}
