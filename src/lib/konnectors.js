/* konnector lib ready to be added to cozy-client-js */
import * as realtime from './realtime'

export const ERROR_TYPES = {
  CHALLENGE_ASKED: 'CHALLENGE_ASKED',
  LOGIN_FAILED: 'LOGIN_FAILED',
  MAINTENANCE: 'MAINTENANCE',
  NOT_EXISTING_DIRECTORY: 'NOT_EXISTING_DIRECTORY',
  USER_ACTION_NEEDED: 'USER_ACTION_NEEDED',
  VENDOR_DOWN: 'VENDOR_DOWN',
  DISK_QUOTA_EXCEEDED: 'DISK_QUOTA_EXCEEDED'
}

export const KONNECTORS_DOCTYPE = 'io.cozy.konnectors'

export const KONNECTOR_RESULT_STATE = {
  ERRORED: 'errored',
  CONNECTED: 'done'
}

export function subscribeAll(cozy) {
  return realtime.subscribeAll(cozy, KONNECTORS_DOCTYPE)
}

function patchFolderPermission(cozy, konnector, folderId = null) {
  const slug = konnector.attributes ? konnector.attributes.slug : konnector.slug
  const saveFolder = folderId
    ? { type: 'io.cozy.files', values: [folderId] }
    : {}

  return cozy.fetchJSON(
    'PATCH',
    `/permissions/konnectors/${encodeURIComponent(slug)}`,
    {
      data: {
        attributes: {
          permissions: {
            saveFolder: saveFolder
          }
        }
      }
    }
  )
}

export function addFolderPermission(cozy, konnector, folderId) {
  return patchFolderPermission(cozy, konnector, folderId)
}

export function isKonnectorLoginError(error) {
  return error && error.type && error.type === ERROR_TYPES.LOGIN_FAILED
}

export function isKonnectorUserError(error) {
  return (
    error &&
    error.type &&
    [
      ERROR_TYPES.CHALLENGE_ASKED,
      ERROR_TYPES.DISK_QUOTA_EXCEEDED,
      ERROR_TYPES.LOGIN_FAILED,
      ERROR_TYPES.NOT_EXISTING_DIRECTORY,
      ERROR_TYPES.USER_ACTION_NEEDED
    ].includes(error.type)
  )
}

export function isKonnectorKnownError(error) {
  return error && error.type && Object.keys(ERROR_TYPES).includes(error.type)
}

export function buildKonnectorError(message) {
  var error = new Error(message)
  error.type = message.split('.')[0]
  error.code = message
  return error
}

const checkLocale = (t, key) => {
  return t(key) !== key
}

export const getMostAccurateErrorKey = (t, error, getKey = key => key) => {
  // Legacy. Kind of.
  if (!error.code) return error.message

  const errorSegments = error.code.split('.')

  let tested = errorSegments
  let fullKey = getKey(tested.join('.'))

  while (tested.length && !checkLocale(t, fullKey)) {
    tested = tested.slice(0, tested.length - 1)
    fullKey = getKey(tested.join('.'))
  }

  return tested.length ? fullKey : getKey('UNKNOWN_ERROR')
}

const legacyMessages = {
  terms: 'connector'
}

export const getErrorTitle = (t, error, getLocaleFn) =>
  t(getMostAccurateErrorKey(t, error, getLocaleFn))

export const getKonnectorMessage = (t, konnector, message) => {
  const { messages, hasDescriptions } = konnector

  const providesMessage =
    messages && messages.length && messages.includes(message)
  if (providesMessage) return t(`${konnector.slug}.messages.${message}`)

  const providesLegacyMessage =
    hasDescriptions && hasDescriptions[legacyMessages[message] || message]
  if (providesLegacyMessage)
    return t(
      `connector.${konnector.slug}.description.${legacyMessages[message] ||
        message}`
    )

  return null
}
