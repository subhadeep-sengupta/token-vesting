import {
  TokenvestingAccount,
  getCloseInstruction,
  getTokenvestingProgramAccounts,
  getTokenvestingProgramId,
  getDecrementInstruction,
  getIncrementInstruction,
  getInitializeInstruction,
  getSetInstruction,
} from '@project/anchor'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { generateKeyPairSigner } from 'gill'
import { useWalletUi } from '@wallet-ui/react'
import { useWalletTransactionSignAndSend } from '../solana/use-wallet-transaction-sign-and-send'
import { useClusterVersion } from '@/components/cluster/use-cluster-version'
import { toastTx } from '@/components/toast-tx'
import { useWalletUiSigner } from '@/components/solana/use-wallet-ui-signer'
import { install as installEd25519 } from '@solana/webcrypto-ed25519-polyfill'

// polyfill ed25519 for browsers (to allow `generateKeyPairSigner` to work)
installEd25519()

export function useTokenvestingProgramId() {
  const { cluster } = useWalletUi()
  return useMemo(() => getTokenvestingProgramId(cluster.id), [cluster])
}

export function useTokenvestingProgram() {
  const { client, cluster } = useWalletUi()
  const programId = useTokenvestingProgramId()
  const query = useClusterVersion()

  return useQuery({
    retry: false,
    queryKey: ['get-program-account', { cluster, clusterVersion: query.data }],
    queryFn: () => client.rpc.getAccountInfo(programId).send(),
  })
}

export function useTokenvestingInitializeMutation() {
  const { cluster } = useWalletUi()
  const queryClient = useQueryClient()
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()

  return useMutation({
    mutationFn: async () => {
      const tokenvesting = await generateKeyPairSigner()
      return await signAndSend(getInitializeInstruction({ payer: signer, tokenvesting }), signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx)
      await queryClient.invalidateQueries({ queryKey: ['tokenvesting', 'accounts', { cluster }] })
    },
    onError: () => toast.error('Failed to run program'),
  })
}

export function useTokenvestingDecrementMutation({ tokenvesting }: { tokenvesting: TokenvestingAccount }) {
  const invalidateAccounts = useTokenvestingAccountsInvalidate()
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()

  return useMutation({
    mutationFn: async () => await signAndSend(getDecrementInstruction({ tokenvesting: tokenvesting.address }), signer),
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}

export function useTokenvestingIncrementMutation({ tokenvesting }: { tokenvesting: TokenvestingAccount }) {
  const invalidateAccounts = useTokenvestingAccountsInvalidate()
  const signAndSend = useWalletTransactionSignAndSend()
  const signer = useWalletUiSigner()

  return useMutation({
    mutationFn: async () => await signAndSend(getIncrementInstruction({ tokenvesting: tokenvesting.address }), signer),
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}

export function useTokenvestingSetMutation({ tokenvesting }: { tokenvesting: TokenvestingAccount }) {
  const invalidateAccounts = useTokenvestingAccountsInvalidate()
  const signAndSend = useWalletTransactionSignAndSend()
  const signer = useWalletUiSigner()

  return useMutation({
    mutationFn: async (value: number) =>
      await signAndSend(
        getSetInstruction({
          tokenvesting: tokenvesting.address,
          value,
        }),
        signer,
      ),
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}

export function useTokenvestingCloseMutation({ tokenvesting }: { tokenvesting: TokenvestingAccount }) {
  const invalidateAccounts = useTokenvestingAccountsInvalidate()
  const signAndSend = useWalletTransactionSignAndSend()
  const signer = useWalletUiSigner()

  return useMutation({
    mutationFn: async () => {
      return await signAndSend(getCloseInstruction({ payer: signer, tokenvesting: tokenvesting.address }), signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}

export function useTokenvestingAccountsQuery() {
  const { client } = useWalletUi()

  return useQuery({
    queryKey: useTokenvestingAccountsQueryKey(),
    queryFn: async () => await getTokenvestingProgramAccounts(client.rpc),
  })
}

function useTokenvestingAccountsInvalidate() {
  const queryClient = useQueryClient()
  const queryKey = useTokenvestingAccountsQueryKey()

  return () => queryClient.invalidateQueries({ queryKey })
}

function useTokenvestingAccountsQueryKey() {
  const { cluster } = useWalletUi()

  return ['tokenvesting', 'accounts', { cluster }]
}
