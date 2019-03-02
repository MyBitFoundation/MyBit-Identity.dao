import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import BN from 'bn.js'
import {
  AppBar,
  AppView,
  Badge,
  BaseStyles,
  Button,
  PublicUrl,
  SidePanel,
  font,
  observe,
  BreakPoint,
} from '@aragon/ui'
import EmptyState from './screens/EmptyState'
import Identities from './screens/Identities'
import RequestPanelContent from './components/Panels/RequestPanelContent'
import MenuButton from './components/MenuButton/MenuButton'
import ipfs from './ipfs'
//import { networkContextType } from './provide-network'
//import { makeEtherscanBaseUrl } from './utils'
//import { addressesEqual } from './web3-utils'

class App extends React.Component {
  static propTypes = {
    app: PropTypes.object.isRequired,
    sendMessageToWrapper: PropTypes.func.isRequired,
  }
  static defaultProps = {
    requests: [],
    authorized: [],
    network: {},
    userAccount: '',
  }
  state = {
    sidepanelOpened: false,
  }
  /*
  static childContextTypes = {
    network: networkContextType,
  }
  getChildContext() {
    const { network } = this.props

    return {
      network: {
        etherscanBaseUrl: makeEtherscanBaseUrl(network.type),
        type: network.type,
      },
    }
  }
  */
  handleRequest = ({ buffer, type, website, twitter, facebook, github, keybase }) => {
    const { app, userAccount } = this.props
    if(userAccount !== ''){
      console.log('Ethereum Account: ', userAccount)
      //Generate json file
      const json = JSON.stringify({
                website: website,
                twitter: twitter,
                facebook: facebook,
                github: github,
                keybase: keybase
              }, null, 4)

      //Save to IPFS and return address
      const files = [
        {
          path: 'folder/social-media.json',
          content: ipfs.types.Buffer.from(json)
        },
        {
          path: 'folder/mugshot.' + type,
          content: buffer
        }
      ]
      console.log('Uploading to IPFS. Please wait...')
      ipfs.add(files)
        .then(results => {
          console.log(results)
          const hashIndex = results.findIndex(ipfsObject => ipfsObject.path === "folder")
          this.handleSidepanelClose()
          //Save request ot Ethereum (two parts -- submitProof, then requestAuthorization (which goes to a vote))
          app
            .submitProof(results[hashIndex].hash)
            .subscribe(
              txHash1 => {
                console.log('Tx: ', txHash1)
                app
                  .requestAuthorization(userAccount)
                  .subscribe(
                    txHash2 => {
                      console.log('Tx: ', txHash2)
                    },
                    err => {
                      console.error(err)
                    })
              },
              err => {
                console.error(err)
              })
        })
    }
  }
  handleMenuPanelOpen = () => {
    this.props.sendMessageToWrapper('menuPanel', true)
  }
  handleSidepanelOpen = address => {
    this.setState({ sidepanelOpened: true })
  }
  handleSidepanelClose = () => {
    this.setState({ sidepanelOpened: false })
  }
  /*
  handleSidepanelTransitionEnd = open => {
    if (!open) {
      this.setState({ buffer: '' })
    }
  }
  */
  render() {
    const {
      requests,
      authorized,
      userAccount,
    } = this.props
    const { config, sidepanelOpened } = this.state
    return (
      <PublicUrl.Provider url="./aragon-ui/">
        <BaseStyles />
        <Main>
          <AppView
            appBar={
              <AppBar
                title={
                  <Title>
                    <BreakPoint to="medium">
                      <MenuButton onClick={this.handleMenuPanelOpen} />
                    </BreakPoint>
                    <TitleLabel>Identity</TitleLabel>
                  </Title>
                }
                endContent={
                  <Button
                    mode="strong"
                    onClick={this.handleSidepanelOpen}
                  >
                    Request Confirmation
                  </Button>
                }
              />
            }
          >
            {(requests.length > 0 || authorized.length > 0) ? (
              <Identities
                requests={requests}
                authorized={authorized}
                userAccount={userAccount}
              />
            ) : (
              <EmptyState onActivate={this.handleSidepanelOpen} />
            )}
          </AppView>
          <SidePanel
            title={
              'Request Identity Confirmation'
            }
            opened={sidepanelOpened}
            onClose={this.handleSidepanelClose}
            //onTransitionEnd={this.handleSidepanelTransitionEnd}
          >
            <RequestPanelContent
              opened={sidepanelOpened}
              onRequestConfirmation={this.handleRequest}
            />
          </SidePanel>
        </Main>
      </PublicUrl.Provider>
    )
  }
}

const Main = styled.div`
  height: 100vh;
`

const Title = styled.span`
  display: flex;
  align-items: center;
`

const TitleLabel = styled.span`
  margin-right: 10px;
  ${font({ size: 'xxlarge' })};
`

export default observe(
  observable =>
    observable.map(state => {
      if (!state) {
        return
      }

      const { identities } = state

      return {
        ...state,
        requests: identities
          ? identities
              .filter(({ authorized }) => authorized === false)
          : [],
        authorized: identities
          ? identities
              .filter(({ authorized }) => authorized === true)
          : [],
      }
    }),
  {}
)(App)
