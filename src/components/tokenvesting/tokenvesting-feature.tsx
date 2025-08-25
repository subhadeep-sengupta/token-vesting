import { WalletButton } from '../solana/solana-provider'
import { TokenvestingButtonInitialize, TokenvestingList, TokenvestingProgramExplorerLink, TokenvestingProgramGuard } from './tokenvesting-ui'
import { AppHero } from '../app-hero'
import { useWalletUi } from '@wallet-ui/react'

export default function TokenvestingFeature() {
  const { account } = useWalletUi()

  return (
    <TokenvestingProgramGuard>
      <AppHero
        title="Tokenvesting"
        subtitle={
          account
            ? "Initialize a new tokenvesting onchain by clicking the button. Use the program's methods (increment, decrement, set, and close) to change the state of the account."
            : 'Select a wallet to run the program.'
        }
      >
        <p className="mb-6">
          <TokenvestingProgramExplorerLink />
        </p>
        {account ? (
          <TokenvestingButtonInitialize />
        ) : (
          <div style={{ display: 'inline-block' }}>
            <WalletButton />
          </div>
        )}
      </AppHero>
      {account ? <TokenvestingList /> : null}
    </TokenvestingProgramGuard>
  )
}
