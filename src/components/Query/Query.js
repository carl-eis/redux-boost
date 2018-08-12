import { Component } from 'react'
import PropTypes from 'prop-types'

import { requestActions } from '../../state/requests/actions'

export class RestQuery extends Component {
  static contextTypes = {
    store: PropTypes.object.isRequired,
  }

  static defaultProps = {
    query: {},
    options: {},
    action: requestActions.requestStart,
  }

  // eslint-disable-next-line react/sort-comp
  hasMounted = false

  state = {
    loading:
      typeof this.props.shouldSkip !== 'undefined'
        ? this.props.shouldSkip
        : true,
    error: undefined,
    result: undefined,
    // TODO: implement networkStatus updates
    // networkStatus: 'string',
  }

  componentDidMount() {
    this.fetchData()
    this.hasMounted = true
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  getQueryResult = () => ({
    fetchData: this.fetchData,
    ...this.state,
  })

  updateState = data => {
    if (this.hasMounted) {
      this.setState(data)
    }
  }

  fetchData = async () => {
    if (this.props.shouldSkip) return null

    const { store } = this.context
    const { query, action } = this.props
    this.setState({ loading: true })

    try {
      const result = await new Promise((resolve, reject) => {
        const requestAction = action(query, {
          resolve,
          reject,
        })

        // Handy to use with thunks
        if (requestAction.then) {
          requestAction.then(resp => resolve(resp)).catch(err => reject(err))
        }

        return store.dispatch(requestAction)
      })

      this.updateState({
        result,
        loading: false,
        entities: result.entities,
      })

      return result
    } catch (error) {
      this.updateState({ loading: false, error, result: undefined })

      return null
    }
  }

  render() {
    const { children } = this.props
    const queryResult = this.getQueryResult()
    return children(queryResult)
  }
}
