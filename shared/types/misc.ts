export type NetId = string;
export type ApiURL = string; // `url` | `url:port`

export interface NodeVersionAndBuild {
  version: string;
  build: string;
}

export type PublicServices = Array<{
  url: string;
  name: string;
}>;
