import path from 'path';
import * as grpc from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { ApiURL } from '../shared/types';

const DEFAULT_HOSTNAME = 'localhost';
const DEFAULT_PORT = '9092';

const parseUrl = (url: string): [string, string] => {
  const [hostname, port] = url.split(':');
  return [hostname || DEFAULT_HOSTNAME, port || DEFAULT_PORT];
};

class NetServiceFactory {
  protected service: grpc.Client | null = null;

  private hostname: string | null = null;

  private port: string | null = null;

  createNetService = (protoPath: string, url: ApiURL, serviceName: string) => {
    const [hostname, port] = parseUrl(url);
    if (this.hostname !== hostname || this.port !== port) {
      if (this.service) {
        this.service.close();
      }
      const resolvedProtoPath = path.join(__dirname, '..', protoPath);
      const packageDefinition = loadSync(resolvedProtoPath);
      // @ts-ignore
      const Services = grpc.loadPackageDefinition(packageDefinition).spacemesh.v1;
      this.service = new Services[serviceName](`${hostname}:${port}`, grpc.credentials.createInsecure());
      this.hostname = hostname;
      this.port = port;
    }
  };
}

export default NetServiceFactory;
