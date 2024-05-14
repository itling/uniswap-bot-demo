import { Token } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
import { WETH_TOKEN, DAI_TOKEN, USDC_TOKEN } from './libs/constants'

// Sets if the example should run locally or on chain
export enum Environment {
  LOCAL,
  OP_MAINNET,
  MAINNET,
}

// Inputs that configure this example to run
export interface ExampleConfig {
  env: Environment
  rpc: {
    local: string
    op_mainnet: string
    mainnet: string
  }
  wallet: {
    address: string
    privateKey: string
  }
  tokens: {
    token0: Token
    token0Amount: number
    token1: Token
    token1Amount: number
    poolFee: FeeAmount
  }
}

// Example Configuration

export const CurrentConfig: ExampleConfig = {
  env: Environment.OP_MAINNET,
  rpc: {
    local: 'http://localhost:8545',
    op_mainnet: 'https://op-pokt.nodies.app',
    mainnet: '',
  },
  wallet: {
    address: '',
    privateKey: '',
  },
  tokens: {
    token0: USDC_TOKEN,
    token0Amount: 0.1,
    token1: DAI_TOKEN,
    token1Amount: 0.1,
    poolFee: FeeAmount.LOWEST,
  },
}
