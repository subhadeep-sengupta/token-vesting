// Here we export some useful types and functions for interacting with the Anchor program.
import { Account, address, getBase58Decoder, SolanaClient } from 'gill'
import { SolanaClusterId } from '@wallet-ui/react'
import { getProgramAccountsDecoded } from './helpers/get-program-accounts-decoded'
import { Tokenvesting, TOKENVESTING_DISCRIMINATOR, TOKENVESTING_PROGRAM_ADDRESS, getTokenvestingDecoder } from './client/js'
import TokenvestingIDL from '../target/idl/tokenvesting.json'

export type TokenvestingAccount = Account<Tokenvesting, string>

// Re-export the generated IDL and type
export { TokenvestingIDL }

// This is a helper function to get the program ID for the Tokenvesting program depending on the cluster.
export function getTokenvestingProgramId(cluster: SolanaClusterId) {
  switch (cluster) {
    case 'solana:devnet':
    case 'solana:testnet':
      // This is the program ID for the Tokenvesting program on devnet and testnet.
      return address('6z68wfurCMYkZG51s1Et9BJEd9nJGUusjHXNt4dGbNNF')
    case 'solana:mainnet':
    default:
      return TOKENVESTING_PROGRAM_ADDRESS
  }
}

export * from './client/js'

export function getTokenvestingProgramAccounts(rpc: SolanaClient['rpc']) {
  return getProgramAccountsDecoded(rpc, {
    decoder: getTokenvestingDecoder(),
    filter: getBase58Decoder().decode(TOKENVESTING_DISCRIMINATOR),
    programAddress: TOKENVESTING_PROGRAM_ADDRESS,
  })
}
