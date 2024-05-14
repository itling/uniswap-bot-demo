import { mintPosition,getPositionIds,getPositionInfo } from './libs/positions'
import { getPoolInfo } from './libs/pool';
import { promisify } from 'util'

const main = promisify(async () => {

    //mint poisiton
    //await mintPosition()

    //print tokenId
    //const tokenIds=await getPositionIds();
     
    //console.log('My pool tokenId=', tokenIds.toString())
    const poolInfo = await getPoolInfo()
    console.log('poolInfo=='+JSON.stringify(poolInfo))

    const postion=await getPositionInfo(544371)
    console.log(JSON.stringify(postion))
  });

main().then(() => {
    console.log('Async operation completed')
});

