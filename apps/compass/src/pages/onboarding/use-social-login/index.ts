import { AuthAdapter } from '@web3auth/auth-adapter'
import { CHAIN_NAMESPACES, WALLET_ADAPTERS, WEB3AUTH_NETWORK } from '@web3auth/base'
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider'
import { Web3AuthNoModal } from '@web3auth/no-modal'
import { useRef, useState } from 'react'

const clientId = process.env.WEB3AUTH_CLIENT_ID ?? ''
const oauthClientId = process.env.OAUTH_CLIENT_ID ?? ''
const verifier = process.env.WEB3AUTH_VERIFIER ?? ''

export const useWeb3Login = () => {
  const web3auth = useRef<Web3AuthNoModal | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const init = async () => {
    try {
      const privateKeyProvider = new EthereumPrivateKeyProvider({
        config: {
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: '0x1', // use 0x1 for Mainnet
            rpcTarget: 'https://rpc.ankr.com/eth',
            displayName: 'Ethereum Mainnet',
            blockExplorerUrl: 'https://etherscan.io/',
            ticker: 'ETH',
            tickerName: 'Ethereum',
            logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
          },
        },
      })

      const web3Auth = new Web3AuthNoModal({
        clientId,
        privateKeyProvider,
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
      })

      const authAdapter = new AuthAdapter({
        adapterSettings: {
          uxMode: 'popup',
          clientId,
          loginConfig: {
            google: {
              typeOfLogin: 'google',
              verifier,
              clientId: oauthClientId,
            },
          },
        },
      })
      web3Auth.configureAdapter(authAdapter)

      web3auth.current = web3Auth

      await web3auth.current.init()
      return web3auth
    } catch (error) {
      setError('Something went wrong, please try again')
    }
  }

  const logout = async () => {
    if (!web3auth.current) {
      return
    }
    setLoggedIn(true)

    try {
      await web3auth.current.logout()
    } catch (error) {
      // ignore
    }

    setLoggedIn(false)
  }

  const login = async () => {
    setError(null)
    setIsLoading(true)

    if (!web3auth.current) {
      await init()
    }

    if (!web3auth.current) {
      setError('Something went wrong, please try again')
      return
    }

    if (web3auth.current.connected) {
      await logout()
    }

    try {
      const web3authProvider = await web3auth.current.connectTo(WALLET_ADAPTERS.AUTH, {
        loginProvider: 'google',
      })

      setLoggedIn(true)
      return web3authProvider
    } catch (error) {
      setError('Something went wrong, please try again')
    } finally {
      setIsLoading(false)
    }
  }

  const authenticateUser = async () => {
    if (!web3auth.current) {
      return
    }

    const idToken = await web3auth.current.authenticateUser()
    return idToken
  }

  const getUserInfo = async () => {
    if (!web3auth.current) {
      return
    }
    return web3auth.current.getUserInfo()
  }

  const getPrivateKey = async () => {
    if (!web3auth.current?.provider) {
      return
    }

    const privateKey = await web3auth.current.provider.request<undefined, string>({
      method: 'eth_private_key',
    })

    return privateKey
  }

  return {
    login,
    logout,
    authenticateUser,
    getUserInfo,
    loggedIn,
    getPrivateKey,
    isLoading,
    error,
  }
}
