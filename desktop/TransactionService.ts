import { ApiURL } from '../shared/types';
import NetServiceFactory from './NetServiceFactory';
import Logger from './logger';

const logger = Logger({ className: 'TransactionService' });

const PROTO_PATH = 'proto/tx.proto';

class TransactionService extends NetServiceFactory {
  createService = (url: ApiURL) => {
    this.createNetService(PROTO_PATH, url, 'TransactionService');
  };

  submitTransaction = ({ transaction }) =>
    new Promise((resolve) => {
      // @ts-ignore
      this.service.SubmitTransaction({ transaction }, (error, response) => {
        if (error) {
          logger.error('grpc SubmitTransaction', error);
          resolve({ error, response: null });
        } else {
          resolve({ error: null, response });
        }
      });
    });
}

export default TransactionService;
