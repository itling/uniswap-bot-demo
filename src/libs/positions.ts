import { CurrencyAmount, Percent, Price, Token } from '@uniswap/sdk-core'
import {
  MintOptions,
  IncreaseOptions,
  nearestUsableTick,
  NonfungiblePositionManager,
  Pool,
  Position,
  TickMath,
} from '@uniswap/v3-sdk'
import { BigNumber, ethers } from 'ethers'
import { CurrentConfig } from '../config'
import {
  ERC20_ABI,
  MAX_FEE_PER_GAS,
  MAX_PRIORITY_FEE_PER_GAS,
  NONFUNGIBLE_POSITION_MANAGER_ABI,
  NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
} from './constants'
import { TOKEN0_AMOUNT_TO_APPROVE_FOR_TRANSFER ,TOKEN1_AMOUNT_TO_APPROVE_FOR_TRANSFER } from './constants'
import { fromReadableAmount } from './conversion'
import { getPoolInfo } from './pool'
import {
  getProvider,
  getWalletAddress,
  sendTransaction,
  TransactionState,
} from './providers'
import JSBI from 'jsbi'

export interface PositionInfo {
  tickLower: number
  tickUpper: number
  liquidity: BigNumber
  feeGrowthInside0LastX128: BigNumber
  feeGrowthInside1LastX128: BigNumber
  tokensOwed0: BigNumber
  tokensOwed1: BigNumber
  amount0:CurrencyAmount<Token>
  amount1:CurrencyAmount<Token>
  token0Price:string
  token0PriceLower:string
  token0PriceUpper:string
}

const token0= CurrencyAmount.fromRawAmount(
  CurrentConfig.tokens.token0,
  fromReadableAmount(
    CurrentConfig.tokens.token0Amount,
    CurrentConfig.tokens.token0.decimals
  )
)
const token1=  CurrencyAmount.fromRawAmount(
  CurrentConfig.tokens.token1,
  fromReadableAmount(
    CurrentConfig.tokens.token1Amount,
    CurrentConfig.tokens.token1.decimals
  )
)

export async function mintPosition(): Promise<TransactionState> {

  const address = getWalletAddress()
  const provider = getProvider()
  if (!address || !provider) {
    return TransactionState.Failed
  }
  //Give approval to the contract to transfer tokens
  // const tokenInApproval = await getTokenTransferApproval(
  //   CurrentConfig.tokens.token0,
  //   TOKEN0_AMOUNT_TO_APPROVE_FOR_TRANSFER 
  // )
  // const tokenOutApproval = await getTokenTransferApproval(
  //   CurrentConfig.tokens.token1,
  //   TOKEN1_AMOUNT_TO_APPROVE_FOR_TRANSFER 
  // )
  // console.log('approve begin.....')
  // // Fail if transfer approvals do not go through
  // if (
  //   tokenInApproval !== TransactionState.Sent ||
  //   tokenOutApproval !== TransactionState.Sent
  // ) {
  //   return TransactionState.Failed
  // }
  // console.log('approve end.....')

  const positionToMint = await constructPosition(
    token0,
    token1
  )

  const mintOptions: MintOptions = {
    recipient: address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 20,
    slippageTolerance: new Percent(50, 10_000),
  }

  // 如果已经创建了postion 则使用increaseOptions替换mintOptions
  // const increaseOptions: IncreaseOptions={
  //     tokenId: 544292,
  //     deadline: Math.floor(Date.now() / 1000) + 60 * 20,
  //     slippageTolerance: new Percent(50, 10_000),
  // }

  // get calldata for minting a position
  const { calldata, value } = NonfungiblePositionManager.addCallParameters(
    positionToMint,
    mintOptions
  )

  // build transaction
  const transaction = {
    data: calldata,
    to: NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
    value: value,
    from: address,
    //maxFeePerGas: MAX_FEE_PER_GAS,
    //maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
  }

  return sendTransaction(transaction)
}

export async function constructPosition(
  token0Amount: CurrencyAmount<Token>,
  token1Amount: CurrencyAmount<Token>
): Promise<Position> {
  // get pool info
  const poolInfo = await getPoolInfo()
  console.log('poolInfo=='+JSON.stringify(poolInfo))

  // construct pool instance
  const configuredPool = new Pool(
    token0Amount.currency,
    token1Amount.currency,
    poolInfo.fee,
    poolInfo.sqrtPriceX96.toString(),
    poolInfo.liquidity.toString(),
    poolInfo.tick
  )
  

  const tickLower=nearestUsableTick(poolInfo.tick, poolInfo.tickSpacing) -
  poolInfo.tickSpacing * 10;
  console.log('tickLower='+tickLower)

  const tickUpper=
  nearestUsableTick(poolInfo.tick, poolInfo.tickSpacing) +
  poolInfo.tickSpacing * 10
  console.log('tickUpper='+tickUpper)

  // create position using the maximum liquidity from input amounts
  return Position.fromAmounts({
    pool: configuredPool,
    tickLower,
    tickUpper,
    amount0: token0Amount.quotient,
    amount1: token1Amount.quotient,
    useFullPrecision: true,
  })
}

export async function getPositionIds(): Promise<number[]> {
  const provider = getProvider()
  const address = getWalletAddress()
  if (!provider || !address) {
    throw new Error('No provider available')
  }

  const positionContract = new ethers.Contract(
    NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
    NONFUNGIBLE_POSITION_MANAGER_ABI,
    provider
  )

  // Get number of positions
  const balance: number = await positionContract.balanceOf(address)

  // Get all positions
  const tokenIds = []
  for (let i = 0; i < balance; i++) {
    const tokenOfOwnerByIndex: number =
      await positionContract.tokenOfOwnerByIndex(address, i)
    tokenIds.push(tokenOfOwnerByIndex)
  }

  return tokenIds
}


export async function getPositionInfo(tokenId: number): Promise<PositionInfo> {
  const provider = getProvider()
  if (!provider) {
    throw new Error('No provider available')
  }

  const positionContract = new ethers.Contract(
    NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
    NONFUNGIBLE_POSITION_MANAGER_ABI,
    provider
  )

  const position = await positionContract.positions(tokenId)

  const poolInfo = await getPoolInfo()

  // construct pool instance
  const configuredPool = new Pool(
    token0.currency,
    token1.currency,
    poolInfo.fee,
    poolInfo.sqrtPriceX96.toString(),
    poolInfo.liquidity.toString(),
    poolInfo.tick
  )
  
  const rawPosition=new Position({pool:configuredPool, liquidity:position.liquidity, tickLower:position.tickLower, tickUpper:position.tickUpper} )

  return {
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    liquidity: position.liquidity,
    feeGrowthInside0LastX128: position.feeGrowthInside0LastX128,
    feeGrowthInside1LastX128: position.feeGrowthInside1LastX128,
    tokensOwed0: position.tokensOwed0,
    tokensOwed1: position.tokensOwed1,
    amount0: rawPosition.amount0,
    amount1: rawPosition.amount1,
    token0Price: configuredPool.token0Price.toSignificant(6),
    token0PriceLower: rawPosition.token0PriceLower.toSignificant(6),
    token0PriceUpper: rawPosition.token0PriceUpper.toSignificant(6)

  }
}


export async function getTokenTransferApproval(
  token: Token,
  TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER : BigNumber
): Promise<TransactionState> {
  const provider = getProvider()
  const address = getWalletAddress()
  if (!provider || !address) {
    console.log('No Provider Found')
    return TransactionState.Failed
  }
 
  try {
    const tokenContract = new ethers.Contract(
      token.address,
      ERC20_ABI,
      provider
    )

    const transaction = await tokenContract.populateTransaction.approve(
      NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
      TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER
    )

    return sendTransaction({
      ...transaction,
      from: address,
    })
  } catch (e) {
    console.error('getTokenTransferApproval==',e)
    return TransactionState.Failed
  }
}
