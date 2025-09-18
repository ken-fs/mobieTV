import JSEncrypt from 'jsencrypt'

const encryptStr = new JSEncrypt()
encryptStr.setPublicKey('-----BEGIN PUBLIC KEY-----\n' +
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDGgOtNRPcXtYbcpz2MMkxJVg2w\n' +
  'urSY/+TLltLI0mJsG2N3vtzx6J9YjSBpLNyHerLn+LaVTcpsdFGBjkCIP2iyM3jJ\n' +
  'gskBupI4nCHWRItP3Dfj04q5wWDFqBHay9sToKZZkACMIzb8w2FSKR4O3VhpAJas\n' +
  'nxoQMaqa7TqKlSahLwIDAQAB\n' +
  '-----END PUBLIC KEY-----\n')

export class RSAEncrypt {
  private params: Record<string, any> = {}

  setParams(params: Record<string, any>) {
    this.params = params
  }

  createDataRsa(): string {
    const sortedParams: Record<string, any> = {}
    
    Object.keys(this.params)
      .sort()
      .forEach(key => {
        sortedParams[key] = this.params[key]
      })

    const jsonString = JSON.stringify(sortedParams)
    const encodedString = btoa(unescape(encodeURIComponent(jsonString)))
    const splitStrArray = this.strSplit(encodedString, 117)
    
    let encodeData = ''
    for (const part of splitStrArray) {
      const encrypted = encryptStr.encrypt(part)
      if (!encrypted) {
        throw new Error('RSA encryption failed')
      }
      encodeData += encrypted
    }
    
    return encodeData
  }

  private strSplit(str: string, n: number): string[] {
    const strArr: string[] = []
    for (let i = 0, l = str.length; i < l / n; i++) {
      const chunk = str.slice(n * i, n * (i + 1))
      strArr.push(chunk)
    }
    return strArr
  }

  encodePostRsa(): string {
    return JSON.stringify({
      params: this.createDataRsa()
    })
  }
}

export default new RSAEncrypt()