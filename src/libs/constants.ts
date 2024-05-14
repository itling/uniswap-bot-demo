// This file stores web3 related constants such as addresses, token definitions, ETH currency references and ABI's

import {Token } from '@uniswap/sdk-core'
import { BigNumber, ethers } from 'ethers'

// Addresses from https://docs.uniswap.org/contracts/v3/reference/deployments/optimism-deployments
export const POOL_FACTORY_CONTRACT_ADDRESS =
  '0x1F98431c8aD98523631AE4a59f267346ea31F984'
export const NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS =
  '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'
export const V3_SWAP_ROUTER_ADDRESS =
  '0xE592427A0AEce92De3Edee1F18E0157C05861564'

// Currencies and Tokens

export const USDC_TOKEN = new Token(
  0xa, //chain_id
  '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
  6,
  'USDC',
  'USDC'
)

export const WETH_TOKEN = new Token(
  0xa, //chain_id
  '0x4200000000000000000000000000000000000006',
  18,
  'ETH',
  'ETH wrapper token'
)

export const DAI_TOKEN = new Token(
  0xa, //chain_id
  '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
  18,
  'DAI',
  'DAI Stablecoin'
)

// Transactions
export const MAX_FEE_PER_GAS = '100000000000'
export const MAX_PRIORITY_FEE_PER_GAS = '100000000000'
export const TOKEN0_AMOUNT_TO_APPROVE_FOR_TRANSFER = ethers.utils.parseUnits("1", 6) //usdc 6位小数
export const TOKEN1_AMOUNT_TO_APPROVE_FOR_TRANSFER = ethers.utils.parseEther('1')// 18位小数

// ABI's
export const ERC20_ABI = [
  // Read-Only Functions
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',

  // Authenticated Functions
  'function transfer(address to, uint amount) returns (bool)',
  'function approve(address _spender, uint256 _value) returns (bool)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint amount)',
]

export const NONFUNGIBLE_POSITION_MANAGER_ABI = [
  // Read-Only Functions
  'function balanceOf(address _owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address _owner, uint256 _index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string memory)',

  'function positions(uint256 tokenId) external view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
]
