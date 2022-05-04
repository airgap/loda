export const getLinkProtocol = (url: string) => /^(.+?):\/\//.exec(url)?.[1]
