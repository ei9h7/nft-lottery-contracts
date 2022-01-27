import * as dotenv from 'dotenv';

import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
require('solidity-coverage');

dotenv.config();

const config: HardhatUserConfig = {
	solidity: {
		compilers: [
			{
				version: '0.6.5',
			},
			{
				version: '0.6.0',
				settings: {},
			},
		],
	},
	networks: {
		hardhat: {
			gas: 'auto',
		},
		iExecSidechain: {
			url: 'https://viviani.iex.ec',
			accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
		},
		goerli: {
			url: process.env.GOERLI_URL || '',
			accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
			gas: 10000000,
			gasPrice: 10000000000,
		},
	},
};

export default config;
