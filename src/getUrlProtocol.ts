export const getUrlProtocol = (url: string) => /^(.+?):\/\//.exec(url)?.[1]
