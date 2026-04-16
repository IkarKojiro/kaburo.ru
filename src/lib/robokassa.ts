import crypto from 'crypto'

interface RobokassaConfig {
  merchantLogin: string
  password1: string
  password2: string
  testMode: boolean
}

function generateSignature(
  merchantLogin: string,
  outSum: number,
  invId: string,
  password: string,
  isTest = false
): string {
  const signatureString = `${merchantLogin}:${outSum}:${invId}:${password}`
  return crypto.createHash('md5').update(signatureString).digest('hex')
}

function generateResultSignature(
  outSum: number,
  invId: string,
  password: string
): string {
  const signatureString = `${outSum}:${invId}:${password}`
  return crypto.createHash('md5').update(signatureString).digest('hex')
}

export function getPaymentUrl(
  config: RobokassaConfig,
  orderId: string,
  amount: number,
  description: string
): string {
  const { merchantLogin, password1, testMode } = config
  const baseUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx'

  const signature = generateSignature(
    merchantLogin,
    amount,
    orderId,
    password1,
    testMode
  )

  const params = new URLSearchParams({
    MerchantLogin: merchantLogin,
    OutSum: amount.toFixed(2),
    InvId: orderId,
    Description: description,
    SignatureValue: signature,
    IsTest: testMode ? '1' : '0',
  })

  return `${baseUrl}?${params.toString()}`
}

export function verifyResultSignature(
  outSum: number,
  invId: string,
  receivedSignature: string,
  password2: string
): boolean {
  const expectedSignature = generateResultSignature(outSum, invId, password2)
  return expectedSignature.toLowerCase() === receivedSignature.toLowerCase()
}

export function getRobokassaConfig(): RobokassaConfig {
  return {
    merchantLogin: process.env.ROBOKASSA_MERCHANT_LOGIN || 'demo',
    password1: process.env.ROBOKASSA_PASSWORD_1 || '',
    password2: process.env.ROBOKASSA_PASSWORD_2 || '',
    testMode: process.env.ROBOKASSA_TEST_MODE === 'true',
  }
}
