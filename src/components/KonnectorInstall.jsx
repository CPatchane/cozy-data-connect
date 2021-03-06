import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import { TriggerManager } from 'cozy-harvest-lib'
import { translate } from 'cozy-ui/react/I18n'

import KonnectorSuccess from 'components/KonnectorSuccess'
import LegacyKonnectorInstall from 'components/LegacyKonnectorInstall'
import { getKonnector } from 'ducks/konnectors'
import styles from 'styles/konnectorInstall'

export class KonnectorInstall extends PureComponent {
  constructor(props) {
    super(props)
    this.handleLoginSuccess = this.handleLoginSuccess.bind(this)
    this.handleSuccess = this.handleSuccess.bind(this)
  }

  handleLoginSuccess(trigger) {
    this.setState({
      trigger,
      success: true
    })

    this.props.onLoginSuccess(trigger)
  }

  handleSuccess(trigger) {
    this.setState({
      trigger,
      success: true
    })

    this.props.onSuccess(trigger)
  }

  render() {
    const {
      account,
      konnector,
      legacySuccess,
      onDone,
      successMessage,
      successMessages,
      successButtonLabel,
      t
    } = this.props

    const { trigger, success } = this.state

    if (success || legacySuccess) {
      return (
        <KonnectorSuccess
          account={account}
          connector={konnector}
          folderId={trigger && trigger.message.folder_to_save}
          onDone={onDone}
          title={successMessage}
          trigger={trigger}
          messages={successMessages}
          successButtonLabel={successButtonLabel}
        />
      )
    }

    return konnector.oauth ? (
      <LegacyKonnectorInstall {...this.props} />
    ) : (
      <div className={styles['col-account-connection-content']}>
        <div className={styles['col-account-connection-form']}>
          <h4 className="u-ta-center">
            {t('account.config.title', { name: konnector.name })}
          </h4>
          <TriggerManager
            account={account}
            konnector={konnector}
            onLoginSuccess={this.handleLoginSuccess}
            onSuccess={this.handleSuccess}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  konnector: getKonnector(state.cozy, ownProps.connector.slug)
})

export default translate()(connect(mapStateToProps)(KonnectorInstall))
