import {
  AuthzTxType,
  AuthZtypeToMsgTypeMap,
  GenericAuthzMessageType,
  Grant,
  sliceWord,
  TypeOfAuthzGrant,
  typeOfAuthzGrant,
  useActiveChain,
  useAuthzTx,
  useGetGivenAuthz,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ChainTagsStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { CardDivider, GenericCard, Header, HeaderActionType } from '@leapwallet/leap-ui'
import { CaretRight } from '@phosphor-icons/react'
import classNames from 'classnames'
import { ProposalDescription } from 'components/proposal-description'
import Text from 'components/text'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDontShowSelectChain } from 'hooks/useDontShowSelectChain'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { manageChainsStore } from 'stores/manage-chains-store'
import { AggregatedSupportedChain } from 'types/utility'
import { assert } from 'utils/assert'
import { formatAuthzDate } from 'utils/formatAuthzDate'
import { imgOnError } from 'utils/imgOnError'
import { useTxCallBack } from 'utils/txCallback'

import { AuthzDetails } from './AuthzDetails'
import { SelectChainSheet } from './CustomEndpoints'

const AuthZContext = createContext<
  (AuthzTxType & { onReviewRevokeTx: () => Promise<void> }) | null
>(null)

export const AuthZContextProvider = observer(
  ({ children, rootDenomsStore }: { children: ReactNode; rootDenomsStore: RootDenomsStore }) => {
    const denoms = rootDenomsStore.allDenoms
    const txCallback = useTxCallBack()
    const { selectedChain, onReviewRevokeTransaction, ...rest } = useAuthzTx({ denoms })

    const getWallet = Wallet.useGetWallet()

    const onReviewRevokeTx = async () => {
      const wallet = await getWallet(selectedChain)
      await onReviewRevokeTransaction(wallet, txCallback)
    }

    return (
      <AuthZContext.Provider
        value={{ selectedChain, onReviewRevokeTransaction, onReviewRevokeTx, ...rest }}
      >
        {children}
      </AuthZContext.Provider>
    )
  },
)

export function useAuthZContext() {
  const context = useContext(AuthZContext)
  assert(context !== null, 'useManageAuthZContext must be used within ManageAuthZContextProvider')
  return context
}

const _ManageAuthZ = observer(
  ({ goBack, chainTagsStore }: { goBack: () => void; chainTagsStore: ChainTagsStore }) => {
    const activeChain = useActiveChain()
    const chainInfos = useChainInfos()
    const defaultTokenLogo = useDefaultTokenLogo()

    const {
      selectedChain,
      showAuthzDetailsFor,
      setShowAuthzDetailsFor,
      setSelectedChain,
      setMsgType,
      setGasError,
      setError,
      selectedChainHasMainnetOnly,
    } = useAuthZContext()

    const dontShowSelectChain = useDontShowSelectChain(manageChainsStore)
    const [showSelectChain, setShowSelectChain] = useState(false)
    const { data, isLoading } = useGetGivenAuthz(
      selectedChain,
      selectedChainHasMainnetOnly ? 'mainnet' : undefined,
    )

    const { formattedGrants, isEmpty } = useMemo(() => {
      const _formattedGrants: Record<TypeOfAuthzGrant, Grant[]> = {
        Custom: [],
        Delegate: [],
        Deposit: [],
        Redelegate: [],
        Send: [],
        Undelegate: [],
        Vote: [],
        'Withdraw Reward': [],
      }

      if (data) {
        data.forEach((grant: Grant) => {
          switch (typeOfAuthzGrant(grant)) {
            case TypeOfAuthzGrant.Custom: {
              _formattedGrants.Custom.push(grant)
              break
            }

            case TypeOfAuthzGrant.Delegate: {
              _formattedGrants.Delegate.push(grant)
              break
            }

            case TypeOfAuthzGrant.Deposit: {
              _formattedGrants.Deposit.push(grant)
              break
            }

            case TypeOfAuthzGrant.Redelegate: {
              _formattedGrants.Redelegate.push(grant)
              break
            }

            case TypeOfAuthzGrant.Send: {
              _formattedGrants.Send.push(grant)
              break
            }

            case TypeOfAuthzGrant.Undelegate: {
              _formattedGrants.Undelegate.push(grant)
              break
            }

            case TypeOfAuthzGrant.Vote: {
              _formattedGrants.Vote.push(grant)
              break
            }

            case TypeOfAuthzGrant.WithdrawReward: {
              _formattedGrants['Withdraw Reward'].push(grant)
              break
            }
          }
        })
      }

      return {
        formattedGrants: _formattedGrants,
        isEmpty: Object.values(_formattedGrants).every((entry) => entry.length === 0),
      }
    }, [data])

    const handleGrantClick = (grant: Grant, grantType: TypeOfAuthzGrant) => {
      setShowAuthzDetailsFor(grant)

      if (grantType !== TypeOfAuthzGrant.Custom) {
        setMsgType(AuthZtypeToMsgTypeMap[grantType])
      } else if (grant.authorization['@type'] === GenericAuthzMessageType) {
        setMsgType(grant.authorization.msg ?? '')
      }
    }

    return showAuthzDetailsFor ? (
      <AuthzDetails
        goBack={() => {
          setShowAuthzDetailsFor(undefined)
          setMsgType('')
          setError('')
          setGasError('')
        }}
        grant={showAuthzDetailsFor}
      />
    ) : (
      <>
        <div className='pb-5 enclosing-panel panel-height'>
          <Header title='Manage AuthZ' action={{ type: HeaderActionType.BACK, onClick: goBack }} />

          <div className='overflow-y-auto w-full h-[calc(100%-70px)] p-[28px]'>
            <div className='flex flex-col items-center gap-4 pb-4'>
              <GenericCard
                title={chainInfos[selectedChain].chainName ?? ''}
                img={
                  <img
                    src={chainInfos[selectedChain].chainSymbolImageUrl ?? defaultTokenLogo}
                    className='w-[28px] h-[28px] mr-2 border rounded-full dark:border-[#333333] border-[#cccccc]'
                    onError={imgOnError(defaultTokenLogo)}
                  />
                }
                isRounded={true}
                title2='Chain'
                icon={
                  dontShowSelectChain ? undefined : (
                    <img className='w-[10px] h-[10px] ml-2' src={Images.Misc.RightArrow} />
                  )
                }
                className={classNames({ '!cursor-default': dontShowSelectChain })}
                onClick={dontShowSelectChain ? undefined : () => setShowSelectChain(true)}
              />

              {isLoading && (
                <div className='flex flex-col gap-y-4 w-full'>
                  <Skeleton count={3} />
                </div>
              )}

              {isEmpty && !isLoading && (
                <div className='rounded-2xl bg-white-100 dark:bg-gray-900 p-8 flex flex-col items-center text-center w-full'>
                  <div className='rounded-full bg-gray-50 dark:bg-gray-800 p-[18px] w-fit flex'>
                    <img src={Images.Nav.NoAuthZ} alt='' className='w-6 h-6 invert dark:invert-0' />
                  </div>

                  <h1 className='font-bold text-gray-800 dark:text-white-100 text-base mt-3'>
                    No AuthZ
                  </h1>

                  <p className='text-gray-400 font-medium text-sm'>
                    Your AuthZ grants will appear here
                  </p>
                </div>
              )}

              {!isEmpty && !isLoading && (
                <div className='max-h-[400px] overflow-y-auto w-full'>
                  <div className='flex flex-col gap-4 overflow-hidden'>
                    {Object.entries(formattedGrants).map(([grantType, grants], index) => {
                      if (grants.length === 0) return null

                      return (
                        <div className='overflow-y-auto rounded-2xl w-full' key={grantType + index}>
                          <h2 className='w-full h-10 px-4 pb-1 pt-5 font-bold text-xs bg-white-100 dark:bg-gray-900 text-gray-600 dark:text-gray-200'>
                            {grants.length} {grantType} Authorization{grants.length > 1 ? 's' : ''}
                          </h2>

                          {grants.map((grant, index) => {
                            let date = ''

                            if (grant.expiration) {
                              date = formatAuthzDate(grant.expiration)

                              if (date !== 'Expired') {
                                date = `Expiration Date: ${date}`
                              }
                            }

                            return (
                              <React.Fragment key={grant.grantee + index}>
                                {index !== 0 && <CardDivider />}

                                <div
                                  onClick={() =>
                                    handleGrantClick(grant, grantType as TypeOfAuthzGrant)
                                  }
                                  className='flex justify-between h-[72px] items-center px-4 bg-white-100 dark:bg-gray-900 cursor-pointer'
                                >
                                  <p className='flex flex-col flex-1 justify-center items-start'>
                                    <span className='text-base font-bold text-black-100 dark:text-white-100 text-left text-ellipsis overflow-hidden'>
                                      <Text size='md' className='font-bold'>
                                        You authorized {sliceWord(grant.grantee, 12, 5)}
                                      </Text>
                                    </span>

                                    {grant.expiration && (
                                      <span className='text-xs font-medium text-gray-400'>
                                        {date}
                                      </span>
                                    )}
                                  </p>
                                  <CaretRight size={20} className='text-gray-400' />
                                </div>
                              </React.Fragment>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <ProposalDescription
              title='About AuthZ'
              description='AuthZ empowers you to delegate specific tasks, like voting or claiming rewards, to another wallet without compromising the security of your account. On this page, you can view and manage all AuthZ transactions initiated by your wallet.'
              btnColor={
                (activeChain as AggregatedSupportedChain) === AGGREGATED_CHAIN_KEY
                  ? 'cosmos'
                  : activeChain
              }
            />
          </div>
        </div>

        <SelectChainSheet
          isVisible={showSelectChain}
          onClose={() => setShowSelectChain(false)}
          selectedChain={selectedChain}
          onChainSelect={(chaiName: SupportedChain) => {
            setSelectedChain(chaiName)
            setShowSelectChain(false)
          }}
          chainTagsStore={chainTagsStore}
        />
      </>
    )
  },
)

export const ManageAuthZ = observer(
  ({ goBack, chainTagsStore }: { goBack: () => void; chainTagsStore: ChainTagsStore }) => {
    return (
      <AuthZContextProvider rootDenomsStore={rootDenomsStore}>
        <_ManageAuthZ goBack={goBack} chainTagsStore={chainTagsStore} />
      </AuthZContextProvider>
    )
  },
)
