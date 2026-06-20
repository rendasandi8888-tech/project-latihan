'use client'
import { ConnectButton, lightTheme } from 'thirdweb/react'
import { client, monadTestnet } from '@/lib/blockchain/client'

export function ConnectWalletButton() {
  return (
    <ConnectButton
      client={client}
      chain={monadTestnet}
      theme={lightTheme({
        colors: {
          primaryButtonBg: "#185FA5",
          primaryButtonText: "#ffffff",
        }
      })}
      connectButton={{
        label: "Connect Wallet",
      }}
    />
  )
}
