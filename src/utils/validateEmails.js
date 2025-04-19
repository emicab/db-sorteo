import validator from 'deep-email-validator'

export async function isEmailValid(email) {
  return await validator.validate(email, {
    validateRegex: true,
    validateMx: true,
    validateTypo: true,
    validateDisposable: true,
    validateSMTP: true // activa la verificación directa (puede tardar más)
  })
}
