import React, { Component } from 'react'
import { ReactReduxContext } from 'react-redux'
import { RestQuery } from './QueryContainer'

export const restQuery = config => WrappedComponent => {
  let lastResultProps
  const {
    // This properties will be passed to the request middleware
    name,
    method,
    serialize,
    executor,
    prepareExecutor,

    // `query` object will be merged with properties above
    query,
    payload,

    // `options` fn creates an object using `ownProps` that
    // will be merged with properties above
    options,

    // Allows to bypass request and config processing using `ownProps`
    skip,

    // The component to render while data is loading
    placeholder: Placeholder,
  } = config

  class RestQueryHoc extends Component {
    applyProps = fn => {
      if (typeof fn === 'function') {
        return fn(this.props)
      }

      return fn
    }

    render() {
      config.query = {
        name,
        method,
        payload,
        serialize,
        executor,
        prepareExecutor,
        ...query,
        ...this.applyProps(options),
      }

      if (skip) {
        config.shouldSkip = this.applyProps(skip)
      }

      const Context = this.props.context || ReactReduxContext

      return (
        <Context.Consumer>
          {({ store }) => (
            <RestQuery store={store} {...config} {...this.props}>
              {result => {
                const propName = config.name || 'data'
                let childProps = { [propName]: result }

                if (config.props) {
                  const newResult = {
                    [propName]: result,
                    ownProps: this.props,
                  }

                  lastResultProps = config.props(newResult, lastResultProps)
                  childProps = lastResultProps
                }

                if (Placeholder && result.loading) {
                  return <Placeholder {...this.props} />
                }

                return <WrappedComponent {...this.props} {...childProps} />
              }}
            </RestQuery>
          )}
        </Context.Consumer>
      )
    }
  }

  return RestQueryHoc
}
