import { createThirdwebClient } from 'thirdweb'
import { defineChain } from 'thirdweb/chains'

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_TW_CLIENT_ID || '1907ab5bcfb3199965a6f9f4cc671e13',
})

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  rpc: 'https://testnet-rpc.monad.xyz',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  blockExplorers: [{
    name: 'Monad Explorer',
    url: 'https://testnet.monadexplorer.com',
  }],
})
