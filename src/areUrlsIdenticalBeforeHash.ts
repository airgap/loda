import { positionOfHash } from './positionOfHash'

export const areUrlsIdenticalBeforeHash = (url1: string, url2: string) =>
	url1.endsWith(url2.slice(0, positionOfHash(url2)), positionOfHash())
