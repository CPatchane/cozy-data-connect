import React from 'react'
import { connect } from 'react-redux'

import { translate } from 'cozy-ui/react/I18n'

import AccountConnection from 'containers/AccountConnection'
import {
  endConnectionCreation,
  isConnectionRunning,
  isCreatingConnection,
  startConnectionCreation
} from 'ducks/connections'
import { getCompleteFolderPath } from 'lib/helpers'
import {
  getCreatedConnectionAccount,
  getTriggerByKonnectorAndAccount
} from 'reducers/index'

class CreateAccountService extends React.Component {
  constructor(props, context) {
    super(props, context)
    const { t, konnector } = props
    const values = {}

    if (
      (konnector.fields &&
        konnector.fields.advancedFields &&
        konnector.fields.advancedFields.folderPath) ||
      (konnector.fields && konnector.folderPath)
    ) {
      values.folderPath = t('account.config.default_folder', {
        name: konnector.name
      })
    } else if (Array.isArray(konnector.folders) && konnector.folders.length) {
      const folder = konnector.folders[0] // we only handle the first one for now
      if (folder.defaultDir) {
        values.folderPath = getCompleteFolderPath(
          folder.defaultDir,
          konnector.name,
          t
        )
      }
    }

    this.setState({ values: values })

    this.props.startCreation(this.props.konnector)
  }

  onSuccess = account => {
    this.props.endCreation()
    this.props.onSuccess(account)
  }

  render() {
    const { konnector, t } = this.props
    const { values } = this.state
    return (
      <div className="coz-service-content">
        <AccountConnection
          connector={konnector}
          onDone={this.onSuccess}
          successButtonLabel={t('intent.service.success.button.label')}
          values={values}
          {...this.props}
        />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  // infos from route parameters
  const { konnector } = ownProps
  const createdAccount = getCreatedConnectionAccount(state)
  const trigger = getTriggerByKonnectorAndAccount(
    state,
    konnector,
    createdAccount
  )
  return {
    createdAccount,
    isCreating: isCreatingConnection(state.connections),
    isRunning: isConnectionRunning(state.connections, trigger),
    trigger
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  startCreation: () => dispatch(startConnectionCreation(ownProps.konnector)),
  endCreation: () => dispatch(endConnectionCreation())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(translate()(CreateAccountService))
