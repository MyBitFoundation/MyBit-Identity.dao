import React from 'react'
import styled from 'styled-components'
import { Table, TableHeader, TableRow, TabBar } from '@aragon/ui'
import UserRow from '../components/UserRow'
import SideBar from '../components/SideBar'

class Identities extends React.Component {
  state = {
    //userFocus: null,
    selected : 0,
  }
  static defaultProps = {
    requests: [],
    authorized: [],
  }
  setSelected = (index) => {
    this.setState({
      selected: index,
    })
  }
  render() {
    const {
      requests,
      authorized,
      userAccount,
    } = this.props

    const {
      selected,
    } = this.state

    const items = []
    if(requests.length > 0) items.push('Requests')
    if(authorized.length > 0) items.push('Confirmed')

    return (
      <Main>
        <TabBar
          items={items}
          selected={selected}
          onSelect={this.setSelected}
        />
        <br/>
        <Table
          header={
            <TableRow>
              <TableHeader title="Address" />
              <TableHeader title="IPFS" />
            </TableRow>
          }
        >
          {items[selected] == 'Requests' &&
           requests.map(({ user, requestID, ipfs }) => (
              <UserRow
                key={user}
                user={user}
                requestID={requestID}
                ipfs={ipfs}
                isCurrentUser={userAccount && userAccount === user}
              />
            ))}
          {items[selected] == 'Confirmed' &&
           authorized.map(({ user, requestID, ipfs }) => (
              <UserRow
                key={user}
                user={user}
                requestID={requestID}
                ipfs={ipfs}
                isCurrentUser={userAccount && userAccount === user}
              />
            ))}
        </Table>
      </Main>
    )
  }
}

const Main = styled.div`
  width: 100%;
`
const TwoPanels = styled.div`
  display: flex;
  width: 100%;
  min-width: 800px;
`

export default Identities
