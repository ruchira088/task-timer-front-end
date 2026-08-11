import { Option } from "~/types/Option"

export enum Environment {
  Development,
  Staging,
  Production
}

const URL_MAPPINGS: Record<Environment.Staging | Environment.Production, string[]> = {
  [Environment.Staging]: ["staging.timer.ruchij.com"],
  [Environment.Production]: ["timer.ruchij.com"]
}

export const getEnvironment = (): Environment => {
  if (typeof window === "undefined") {
    return Environment.Development
  }

  const host: string = window.location.host

  // Object.entries stringifies the numeric enum keys, so parse back to a number
  // — otherwise this returns "2" rather than Environment.Production, and any
  // `===` comparison against the enum silently fails.
  return Option.fromNullable(Object.entries(URL_MAPPINGS).find(([_, hosts]) => hosts.includes(host)))
    .map(([env]) => Number(env) as Environment)
    .getOrElse(() => Environment.Development)
}
