import { ellipsify } from '@wallet-ui/react'
import {
  useTokenvestingAccountsQuery,
  useTokenvestingCloseMutation,
  useTokenvestingDecrementMutation,
  useTokenvestingIncrementMutation,
  useTokenvestingInitializeMutation,
  useTokenvestingProgram,
  useTokenvestingProgramId,
  useTokenvestingSetMutation,
} from './tokenvesting-data-access'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExplorerLink } from '../cluster/cluster-ui'
import { TokenvestingAccount } from '@project/anchor'
import { ReactNode } from 'react'

export function TokenvestingProgramExplorerLink() {
  const programId = useTokenvestingProgramId()

  return <ExplorerLink address={programId.toString()} label={ellipsify(programId.toString())} />
}

export function TokenvestingList() {
  const tokenvestingAccountsQuery = useTokenvestingAccountsQuery()

  if (tokenvestingAccountsQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!tokenvestingAccountsQuery.data?.length) {
    return (
      <div className="text-center">
        <h2 className={'text-2xl'}>No accounts</h2>
        No accounts found. Initialize one to get started.
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {tokenvestingAccountsQuery.data?.map((tokenvesting) => (
        <TokenvestingCard key={tokenvesting.address} tokenvesting={tokenvesting} />
      ))}
    </div>
  )
}

export function TokenvestingProgramGuard({ children }: { children: ReactNode }) {
  const programAccountQuery = useTokenvestingProgram()

  if (programAccountQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!programAccountQuery.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }

  return children
}

function TokenvestingCard({ tokenvesting }: { tokenvesting: TokenvestingAccount }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tokenvesting: {tokenvesting.data.count}</CardTitle>
        <CardDescription>
          Account: <ExplorerLink address={tokenvesting.address} label={ellipsify(tokenvesting.address)} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 justify-evenly">
          <TokenvestingButtonIncrement tokenvesting={tokenvesting} />
          <TokenvestingButtonSet tokenvesting={tokenvesting} />
          <TokenvestingButtonDecrement tokenvesting={tokenvesting} />
          <TokenvestingButtonClose tokenvesting={tokenvesting} />
        </div>
      </CardContent>
    </Card>
  )
}

export function TokenvestingButtonInitialize() {
  const mutationInitialize = useTokenvestingInitializeMutation()

  return (
    <Button onClick={() => mutationInitialize.mutateAsync()} disabled={mutationInitialize.isPending}>
      Initialize Tokenvesting {mutationInitialize.isPending && '...'}
    </Button>
  )
}

export function TokenvestingButtonIncrement({ tokenvesting }: { tokenvesting: TokenvestingAccount }) {
  const incrementMutation = useTokenvestingIncrementMutation({ tokenvesting })

  return (
    <Button variant="outline" onClick={() => incrementMutation.mutateAsync()} disabled={incrementMutation.isPending}>
      Increment
    </Button>
  )
}

export function TokenvestingButtonSet({ tokenvesting }: { tokenvesting: TokenvestingAccount }) {
  const setMutation = useTokenvestingSetMutation({ tokenvesting })

  return (
    <Button
      variant="outline"
      onClick={() => {
        const value = window.prompt('Set value to:', tokenvesting.data.count.toString() ?? '0')
        if (!value || parseInt(value) === tokenvesting.data.count || isNaN(parseInt(value))) {
          return
        }
        return setMutation.mutateAsync(parseInt(value))
      }}
      disabled={setMutation.isPending}
    >
      Set
    </Button>
  )
}

export function TokenvestingButtonDecrement({ tokenvesting }: { tokenvesting: TokenvestingAccount }) {
  const decrementMutation = useTokenvestingDecrementMutation({ tokenvesting })

  return (
    <Button variant="outline" onClick={() => decrementMutation.mutateAsync()} disabled={decrementMutation.isPending}>
      Decrement
    </Button>
  )
}

export function TokenvestingButtonClose({ tokenvesting }: { tokenvesting: TokenvestingAccount }) {
  const closeMutation = useTokenvestingCloseMutation({ tokenvesting })

  return (
    <Button
      variant="destructive"
      onClick={() => {
        if (!window.confirm('Are you sure you want to close this account?')) {
          return
        }
        return closeMutation.mutateAsync()
      }}
      disabled={closeMutation.isPending}
    >
      Close
    </Button>
  )
}
