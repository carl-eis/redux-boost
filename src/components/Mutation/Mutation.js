import { Component } from 'react'
import { merge } from 'lodash'

export class RestMutationComponent extends Component {
  static defaultProps = {
    query: {},
    options: v => v,
  }

  static getDerivedStateFromProps({ requestState }, { entities }) {
    if (requestState && requestState.result) {
      return {
        entities,
      }
    }

    return {
      entities: undefined,
    }
  }

  // eslint-disable-next-line react/sort-comp
  hasMounted = false

  state = {
    entities: undefined,
  }

  componentDidMount() {
    this.hasMounted = true
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  getMutationResult = () => ({
    ...this.state,
    ...this.props.requestState,
  })

  updateState = data => {
    if (this.hasMounted) {
      this.setState(data)
    }
  }

  runMutation = async (payload = {}) => {
    const { query, fetchStart, options, action = fetchStart } = this.props

    const dynamicPayload = payload.nativeEvent ? undefined : options(payload)

    try {
      const result = await new Promise((resolve, reject) => {
        const requestAction = action(merge(query, dynamicPayload), {
          resolve,
          reject,
        })

        // Handy to use with thunks
        if (requestAction.then) {
          requestAction.then(resp => resolve(resp)).catch(err => reject(err))
        }
      })

      // Result is not guaranteed to have entities
      this.updateState({
        entities: result ? result.entities : undefined,
      })

      return result
    } catch (error) {
      throw error
    }
  }

  render() {
    const { children } = this.props

    return children(this.runMutation, this.getMutationResult())
  }
}
