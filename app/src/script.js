import Aragon from '@aragon/client'
import { addressesEqual } from './web3-utils'

const app = new Aragon()

app.store(async (state, { event, returnValues }) => {
  let nextState
  if (state === null) {
    nextState = {
      identities:[]
    }
  } else {
    nextState = {
      ...state,
    }
  }

  switch (event) {
    case 'NewRequest':
      console.log('NewRequest')
      nextState = updateRequests(nextState, returnValues)
      break
    case 'Authorized':
      nextState = updateAuthorized(nextState, returnValues)
      break
  }
  return nextState;
})

/***********************
 *                     *
 *   Event Handlers    *
 *                     *
 ***********************/

function updateRequests(state, returnValues) {
  console.log('State')
  console.log(state)
  const { identities = [] } = state
  console.log('Identities')
  console.log(identities)
  const idIndex = identities.findIndex(id =>
    addressesEqual(id.user, returnValues.user)
  )
  if (idIndex === -1) {
    identities.push({
      ...returnValues,
      authorized: false
    })
  } else {
    identities[idIndex] = {
      ...returnValues,
      authorized: false
    }
  }
  return {
    ...state,
    identities
  }
}

function updateAuthorized(state, { user, requestID }) {
  const { identities = [] } = state
  const idIndex = identities.findIndex(id =>
    addressesEqual(id.user, user) && (id.requestID === requestID)
  )
  if (idIndex !== -1) {
    identities[idIndex].authorized = true
  }
  return {
    ...state,
    identities
  }
}
