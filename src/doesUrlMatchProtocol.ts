import { Protocol } from './Protocol'

export const doesUrlMatchProtocol = (url: string, protocol: Protocol) =>
	new RegExp(`^${protocol}?://`).test(url)
