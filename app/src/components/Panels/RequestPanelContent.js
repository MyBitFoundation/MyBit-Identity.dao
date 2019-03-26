import React from 'react'
import styled from 'styled-components'
import { Button, Field, IconError, Text, TextInput, Info, theme } from '@aragon/ui'
import CircularProgress from '@material-ui/core/CircularProgress'
import isURL from 'validator/lib/isURL'

const initialState = {
  websiteField: '',
  twitterField: '',
  facebookField: '',
  githubField: '',
  keybaseField: '',
  error: null,
  warning: null,
  loading: false,
}

class RequestPanelContent extends React.Component {
  static defaultProps = {
    onRequestConfirmation: () => {},
  }
  state = {
    ...initialState,
  }
  componentWillReceiveProps({ opened }) {
    if (opened && !this.props.opened) {
      // setTimeout is needed as a small hack to wait until the input is
      // on-screen before we call focus
      this.websiteInput && setTimeout(() => this.websiteInput.focus(), 0)

    }

    // Finished closing the panel, its state can be reset
    if (!opened && this.props.opened) {
      this.setState({
        ...initialState
      })
    }
  }
  /*
  filteredWebsite() {
    const { websiteField } = this.state
    return websiteField.trim()
  }
  */

  //Convert the file to buffer to store on IPFS
  convertToBuffer = async(reader) => {
    //file is converted to a buffer for upload to IPFS
    const buffer = await Buffer.from(reader.result);
    //set this buffer-using es6 syntax
    this.setState({buffer});
  };

  //Take file input from user
  handleFileChange = event => {
    event.stopPropagation()
    event.preventDefault()
    const file = event.target.files[0]
    let arr = file.name.split('.')
    this.setState({
      type: arr[arr.length-1]
    })
    let reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => this.convertToBuffer(reader)
  };

  handleWebsiteChange = event => {
    this.setState({
      websiteField: event.target.value,
    })
  }

  handleTwitterChange = event => {
    this.setState({
      twitterField: event.target.value,
    })
  }

  handleFacebookChange = event => {
    this.setState({
      facebookField: event.target.value,
    })
  }

  handleGitHubChange = event => {
    this.setState({
      githubField: event.target.value,
    })
  }

  handleKeybaseChange = event => {
    this.setState({
      keybaseField: event.target.value,
    })
  }

  handleSubmit = event => {
    event.preventDefault()
    const {
      websiteField,
      twitterField,
      facebookField,
      githubField,
      keybaseField,
      buffer,
      type
    } = this.state
    const { getUser } = this.props
    //const website = this.filteredWebsite()

    const userAccount = getUser()
    if(userAccount == '' || userAccount == undefined){
      this.setState({ error : 'Please sign in to MetaMask.' })
    } else if(buffer == undefined || type == undefined){
      this.setState({ error : 'Something went wrong. Please select select a photo again.'})
    } else if(websiteField != '' && !isURL(websiteField)){
      this.setState({ error : 'Website field invalid.' })
    } else if(twitterField != '' && !isURL(twitterField)){
      this.setState({ error : 'Twitter field invalid.' })
    } else if(facebookField != '' && !isURL(facebookField)){
      this.setState({ error : 'Facebook field invalid.' })
    } else if(githubField != '' && !isURL(githubField)){
      this.setState({ error : 'GitHub field invalid.' })
    } else if(keybaseField != '' && !isURL(keybaseField)){
      this.setState({ error : 'Keybase field invalid.' })
    } else {
      this.setState({
        loading: true
      })
      this.props.onRequestConfirmation({
        buffer: buffer,
        type: type,
        website: websiteField,
        twitter: twitterField,
        facebook: facebookField,
        github: githubField,
        keybase: keybaseField,
      })
    }
  }

  render() {
    const {
      websiteField,
      twitterField,
      facebookField,
      githubField,
      keybaseField,
      error,
      warning,
      loading,
    } = this.state

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <Field
            label='Upload Photo'
          >
            <p>
              Photos are one of the best ways to know that you are not a bot.
              Please take a photo of yourself holding a piece of paper that displays your Ethereum address.
            </p>
            <br/>
            <input
              type = "file"
              onChange = {this.handleFileChange}
              required
            />
          </Field>
          <Field
            label='Website'
          >
            <TextInput
              innerRef={element => (this.websiteInput = element)}
              value={websiteField}
              onChange={this.handleWebsiteChange}
              wide
            />
          </Field>
          <Field
            label='Twitter'
          >
            <TextInput
              innerRef={element => (this.twitterInput = element)}
              value={twitterField}
              onChange={this.handleTwitterChange}
              wide
            />
          </Field>
          <Field
            label='Facebook'
          >
            <TextInput
              innerRef={element => (this.facebookInput = element)}
              value={facebookField}
              onChange={this.handleFacebookChange}
              wide
            />
          </Field>
          <Field
            label='GitHub'
          >
            <TextInput
              innerRef={element => (this.githubInput = element)}
              value={githubField}
              onChange={this.handleGitHubChange}
              wide
            />
          </Field>
          <Field
            label='Keybase'
          >
            <TextInput
              innerRef={element => (this.keybaseInput = element)}
              value={keybaseField}
              onChange={this.handleKeybaseChange}
              wide
            />
          </Field>
          <Info>
            Including social media posts that reference your Ethereum address can help ensure your identity is accepted.
          </Info>
          <br/>
          {loading ? (
            <div>
              <Spinner/>
            </div>
          ) : (
            <Button
              mode="strong"
              type="submit"
              wide
            >
              Submit
            </Button>
          )}
          <Messages>
            {error && <ErrorMessage message={error} />}
            {warning && <WarningMessage message={warning} />}
          </Messages>
        </form>
      </div>
    )
  }
}

const Messages = styled.div`
  margin-top: 15px;
`

const WarningMessage = ({ message }) => <Info.Action>{message}</Info.Action>

const ErrorMessage = ({ message }) => (
  <Info background="rgba(251,121,121,0.06)"><IconError />
    <Text size="small" style={{ marginLeft: '10px' }}>
      {message}
    </Text>
  </Info>
)

const Spinner = () => (
  <div style={{ width: '100%', textAlign: 'center' }}>
    <CircularProgress style={{ color: theme.accent }}/>
  </div>
)

export default RequestPanelContent
