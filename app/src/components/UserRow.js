import React from 'react'
import styled from 'styled-components'
import {
  TableRow,
  TableCell,
  Badge,
  SafeLink,
} from '@aragon/ui'

class UserRow extends React.Component {
  static defaultProps = {
    user: '',
    requestID: '0',
    ipfs: '',
  }
  render() {
    const {
      user,
      requestID,
      ipfs,
      isCurrentUser,
    } = this.props

    return (
      <TableRow>
        <TableCell>
          <Owner>
            <span>{user}</span>
            {isCurrentUser && (
              <Badge.Identity
                style={{ fontVariant: 'small-caps' }}
                title="This is your Ethereum address"
              >
                you
              </Badge.Identity>
            )}
          </Owner>
        </TableCell>
        <TableCell>
          <SafeLink href={`https://gateway.ipfs.io/ipfs/${ipfs}`} target='_blank'>
            {ipfs}
          </SafeLink>
        </TableCell>
      </TableRow>
    )
  }
}

const Owner = styled.div`
  display: flex;
  align-items: center;
  & > span:first-child {
    margin-right: 10px;
  }
`
export default UserRow
