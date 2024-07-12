import axios from 'axios'
import axiosRetry from 'axios-retry'

/*****
 * Store
 */
// import { useAccountStore } from "/@src/stores/accountStore";

/** Default config for axios instance */
const config = {
  baseURL: import.meta.env.VITE_APP_API,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json, text/plain, */*',
    Accept: 'application/json, text/plain, */*'
  }
}

const bridge = axios.create(config)
// Define max request retry
axiosRetry(bridge, { retries: 5 })

//Response interceptor
bridge.interceptors.response.use(
  (response: any) => {
    try {
      getResponseData(response)
    } catch (error) {}

    return response
  },
  async (error: any) => {
    // send log
    try {
      getResponseData(error)
    } catch (error) {}
    // all the error responses
    if (error.response) {
      switch (error.response.status) {
        case 400:
          console.error(error.response.status, error.message)
          break

        case 401:
          var sessionID = window.location.pathname.slice(1).split('/')[0]

          break

        case 403: // Authentification error
          console.error(error.response.status, error.message)
          break

        case 404: // Not found
          console.error(error.response.status, error.message)
          break

        case 498: // Token expired
          break

        case 499: // Refresfh token expired
          break

        default:
          console.error(error.message)
      }
    }

    return Promise.reject(error)
  }
)

export default bridge
