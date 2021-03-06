import { compose, createStore, applyMiddleware } from 'redux'
import { cozyMiddleware } from 'redux-cozy-client'
import { createLogger } from 'redux-logger'
import konnectorsI18nMiddleware from 'lib/middlewares/konnectorsI18n'
import thunkMiddleware from 'redux-thunk'

import CollectStore from 'lib/CollectStore'
import getReducers from 'reducers'

const configureStore = (client, context, options = {}) => {
  // Enable Redux dev tools
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE || compose

  const reduxStore = createStore(
    getReducers(),
    composeEnhancers(
      applyMiddleware.apply(this, [
        cozyMiddleware(client),
        konnectorsI18nMiddleware(options.lang),
        thunkMiddleware,
        createLogger()
      ])
    )
  )

  return Object.assign(new CollectStore(context, options), reduxStore)
}

export default configureStore
