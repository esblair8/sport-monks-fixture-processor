'use strict'
const https = require('https')

module.exports = class SportmonksApi {

    constructor(tokenId, sport = 'soccer') {
        this.token = tokenId
        this.baseUrl = `https://${sport}.sportmonks.com/api/`
    }

    get(endpoint, params) {
        let url = this._composeUrl(endpoint, params)
        console.log('url', url)
        return new Promise((resolve, reject) => {
            const request = https.get(url, (response) => {
                if (response && response.statusCode && (response.statusCode < 200 || response.statusCode > 299)) {
                    reject(new Error('Failed to load page, status code: ' + response.statusCode))
                }
                const body = []
                response.on('data', (chunk) => body.push(chunk))
                response.on('end', () => resolve(JSON.parse(body.join(''))))
            })
            request.on('error', (err) => reject(err))
        })
    }

    _composeUrl(endpoint, params) {
        let page = params.page
        let newEndpoint = this.baseUrl + endpoint
        let wrapped = endpoint.match(/\{(.*?)\}/g)
        if (wrapped) {
            let unwrapped = (wrapped) => wrapped.replace('{', '').replace('}', '')
            for (let w in wrapped) {
                let k = unwrapped(wrapped[w])
                newEndpoint = newEndpoint.replace(wrapped[w], params[k])
                delete params[k]
            }
        }
        newEndpoint += '?api_token=' + this.token
        if (params && Object.keys(params.includes).length > 0) {
            let plist = []
            let pkeys = Object.keys(params.includes)
            for (let p in pkeys) {
                if (pkeys[p] != 'page' && params.includes[pkeys[p]])
                    plist.push(pkeys[p])
            }
            if (page)
                newEndpoint += '&page=' + page
            if (params.bookmakers)
                newEndpoint += '&bookmakers=' + params.bookmakers.join(',')
            if (params.markets)
                newEndpoint += '&markets=' + params.markets.join(',')
            if (plist.length > 0)
                newEndpoint += '&include=' + plist.join(',')
        }
        return newEndpoint
    }
}
