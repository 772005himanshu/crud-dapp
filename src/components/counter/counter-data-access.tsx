'use client'

import { getCounterProgram, getCounterProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import AccountListFeature from '../account/account-list-feature'

interface CreateEntryArgs {
  title: String;
  message : String;
  owner: PublicKey
}


interface DeleteEntryArgs {
  owner: PublicKey;
}

export function useCounterProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getCounterProgramId(cluster.network as Cluster), [cluster.network])
  const program = useMemo(() => getCounterProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['counter', 'all', { cluster }],
    queryFn: () => program.account.journalEntryState.all(),
  })

  const getProgramAccount = useQuery{(
    queryKey: ['get-program-account', {cluster}],
    queryFn:  useConnection: any.getParsedAccountInfo: any(programId),
  )};

  const createEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey : ['journalEntry', 'create', {Cluster}] ,
    mutationFn: async({title, message,owner}) => {
      return program.methods.createJournalEntry(title, message,owner).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();  //last
    };

    onError: (error) => {
      toast.error('Error creating entry: ${error.message}');
    },

  });


  const UpdateEntry  = useMutation<string, Error,CreateEntryArgs> ({
    mutationKey : ['journalEntry', 'update', {Cluster}],
    mutationFn : async ({title,message}) => {
      return program.method.updateJournalEntry(title,message).rpc();
    },

    onSuccess: (signature: any) => {
      useTransactionToast(signature);
      accounts.refetch();
    },
    onError: () => {
      toast.error('Error updating entry: ${error.message}')
    },
  });


  const deleteEntry = useMutation({
    mutationKey: ['journalEntry', 'delete', {Cluster}],
    mutationFn: (title: String) => {
      return program.methods.deleteJournalEntry(title).rpc();

    },
    onSuccess: (signature: any) => {
      useTransactionToast(signature);
      accounts.refetch();
    },
    

  });

  return {
    accountQuery,
    updateQuery,
    deleteQuery,
  };

}


