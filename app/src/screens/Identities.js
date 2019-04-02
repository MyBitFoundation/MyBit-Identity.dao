import React from 'react'
import styled from 'styled-components'
import { Table, TableHeader, TableRow, TabBar, breakpoint } from '@aragon/ui'
import UserCard from '../components/UserCard'
import SideBar from '../components/SideBar'

class Identities extends React.Component {
  state = {
    //userFocus: null,
    selected : 0,
    isTokenHolder: false
  }
  static defaultProps = {
    requests: [],
    proposals: [],
    authorized: [],
    failed: [],
  }
  setSelected = (index) => {
    this.setState({
      selected: index,
    })
  }

  componentDidMount = async () => {
    const { userAccount, getBalance } = this.props
    if(userAccount != ''){
      console.log('Getting balance')
      console.log('User: ', userAccount)
      const balance = await getBalance(userAccount)
      console.log('Balance: ', balance)
      if(balance > 0){
        this.setState({
          ...this.state,
          isTokenHolder: true
        })
      } else {
        this.setState({
          ...this.state,
          isTokenHolder: false
        })
      }
    }
  }

  componentWillReceiveProps = async ({ userAccount, getBalance }) => {
    if(userAccount != ''){
      console.log('Getting balance')
      console.log('User: ', userAccount)
      const balance = await getBalance(userAccount)
      console.log('Balance: ', balance)
      if(balance > 0){
        this.setState({
          ...this.state,
          isTokenHolder: true
        })
      } else {
        this.setState({
          ...this.state,
          isTokenHolder: false
        })
      }
    }
  }

  render() {
    const {
      requests,
      proposals,
      authorized,
      failed,
      userAccount,
      ipfsAPI,
      ipfsURL,
      getBalance,
      onInitiateAuth,
      onInitiateRevoke,
    } = this.props

    const {
      selected,
      isTokenHolder
    } = this.state

    const items = []
    if(requests.length > 0) items.push('Requests')
    if(proposals.length > 0) items.push('Proposals')
    if(authorized.length > 0) items.push('Confirmed')
    if(failed.length > 0) items.push('Rejected')

    return (
      <Main>
        <TabBar
          items={items}
          selected={selected}
          onSelect={this.setSelected}
        />
        <br/>
        <Grid>
          {items[selected] == 'Requests' &&
           requests.map(({ user, requestID, ipfs }) => (
              <UserCard
                key={user}
                user={user}
                ipfs={ipfs}
                ipfsAPI={ipfsAPI}
                ipfsURL={ipfsURL}
                isCurrentUser={userAccount && userAccount === user}
                isTokenHolder={isTokenHolder}
                onInitiateAuth={onInitiateAuth}
              />
            ))}
          {items[selected] == 'Proposals' &&
           proposals.map(({ user, requestID, ipfs }) => (
              <UserCard
                key={user}
                user={user}
                ipfs={ipfs}
                ipfsAPI={ipfsAPI}
                ipfsURL={ipfsURL}
                isCurrentUser={userAccount && userAccount === user}
              />
            ))}
          {items[selected] == 'Confirmed' &&
           authorized.map(({ user, requestID, ipfs }) => (
              <UserCard
                key={user}
                user={user}
                ipfs={ipfs}
                ipfsAPI={ipfsAPI}
                ipfsURL={ipfsURL}
                isCurrentUser={userAccount && userAccount === user}
                isTokenHolder={isTokenHolder}
                onInitiateRevoke={onInitiateRevoke}
              />
            ))}
          {items[selected] == 'Rejected' &&
           failed.map(({ user, requestID, ipfs }) => (
              <UserCard
                key={user}
                user={user}
                ipfs={ipfs}
                ipfsAPI={ipfsAPI}
                ipfsURL={ipfsURL}
                isCurrentUser={userAccount && userAccount === user}
                isTokenHolder={isTokenHolder}
                onInitiateAuth={onInitiateAuth}
              />
            ))}
        </Grid>
      </Main>
    )
  }
}

const Main = styled.div`
  width: 100%;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 30px;
  ${breakpoint(
    'medium',
    `
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
     `
  )};
`

export default Identities
