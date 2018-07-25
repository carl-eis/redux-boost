import { get } from 'lodash'
import { createSelector } from 'reselect'

export const getOperationName = (_, { operation } = {}) => operation

export const getRequests = state => state.requests

export const getResponse = createSelector(
  [getRequests, getOperationName],
  (requests, operation) => get(requests, `${operation}.data`)
)

export const getResult = createSelector(
  [getRequests, getOperationName],
  (requests, operation) => get(requests, `${operation}.result`)
)

export const getIsLoading = createSelector(
  [getRequests, getOperationName],
  (requests, operation) => get(requests, `${operation}.loading`)
)

export const getIsSuccess = createSelector(
  [getRequests, getOperationName],
  (requests, operation) => get(requests, `${operation}.success`)
)
