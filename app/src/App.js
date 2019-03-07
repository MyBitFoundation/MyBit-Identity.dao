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
import tokenAbi from './abi/minimeToken.json'
//import votingAbi from './abi/voting.json'
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
    proposals: [],
    authorized: [],
    network: {},
    userAccount: '',
    tokenAddress: null,
  }
  state = {
    sidepanelOpened: false,
    isTokenHolder: false,
    token: null,
    voting: null,
  }

  async componentWillReceiveProps({ app, tokenAddress, votingAddress, userAccount }) {
    if(!this.state.token && tokenAddress){
      const token = app.external(tokenAddress, tokenAbi)
      this.setState({
        ...this.state,
        token,
      })
    }
    /*
    if(!this.state.voting && votingAddress){
      const voting = app.external(votingAddress, votingAbi)
      this.setState({
        ...this.state,
        voting,
      })
    }
    */
    if(this.state.token){
      const balance = await this.getBalance(userAccount);
      if(balance > 0){
        this.setState({
          ...this.state,
          isTokenHolder: true,
        })
      } else {
        this.setState({
          ...this.state,
          isTokenHolder: false,
        })
      }
    }
  }

  getBalance = (userAccount) => {
    const { token } = this.state
    return new Promise((resolve, reject) =>
      token
        .balanceOf(userAccount)
        .first()
        .subscribe(resolve, reject)
    )
  }

  getUser = () => {
    return this.props.userAccount
  }

  handleSubmission = ({ buffer, type, website, twitter, facebook, github, keybase }) => {
    const { app, userAccount } = this.props
    if(userAccount !== ''){
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
              txHash => {
                console.log('Tx: ', txHash)
              },
              err => {
                console.error(err)
              })
        })
    }
  }
  handleRequest = (user) => {
    const { app } = this.props
    app
      .requestAuthorization(user)
      .subscribe(
        txHash => {
          console.log('Tx: ', txHash)
        },
        err => {
          console.error(err)
        })
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
      proposals,
      authorized,
      userAccount,
    } = this.props
    const {
      sidepanelOpened,
      isTokenHolder,
    } = this.state
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
            {(requests.length > 0 || proposals.length > 0 || authorized.length > 0) ? (
              <Identities
                requests={requests}
                proposals={proposals}
                authorized={authorized}
                userAccount={userAccount}
                isTokenHolder={isTokenHolder}
                onInitiateAuth={this.handleRequest}
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
              onRequestConfirmation={this.handleSubmission}
              getUser={this.getUser}
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
              .filter(({ authorized, initiated }) => (authorized === false && initiated === false))
          : [],
        proposals: identities
          ? identities
              .filter(({ authorized, initiated }) => (authorized === false && initiated === true))
          : [],
        authorized: identities
          ? identities
              .filter(({ authorized }) => authorized === true)
          : [],
      }
    }),
  {}
)(App)
