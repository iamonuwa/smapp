import React from 'react';
import styled from 'styled-components';
import { NetworkIndicator, ProgressBar } from '../../basicComponents';
import { Status } from '../../types';
import { smColors } from '../../vars';

const ProgressLabel = styled.div`
  margin-left: 10px;
  text-transform: uppercase;
`;

const Progress = styled.div`
  display: flex;
  flex-direction: column;
  width: 100px;
  margin-left: 20px;
`;

type Props = {
  status: Status | null;
  error: any;
};

const NetworkStatus = ({ status, error }: Props) => {
  const getSyncLabelPercentage = (): number => {
    if (status && status.syncedLayer && status.topLayer) {
      return Math.round((status.syncedLayer * 100) / status.topLayer);
    }
    return 0;
  };

  const renderSyncingStatus = () => {
    const progress = getSyncLabelPercentage();
    return (
      <>
        {progress >= 100 ? (
          <>
            <NetworkIndicator color={smColors.green} />
            <ProgressLabel>synced</ProgressLabel>
          </>
        ) : (
          <>
            <NetworkIndicator color={status?.isSynced ? smColors.green : smColors.orange} />
            <ProgressLabel>syncing</ProgressLabel>
            <ProgressLabel>{getSyncLabelPercentage()}%</ProgressLabel>
            <ProgressLabel>{`${status?.syncedLayer || 0} / ${status?.topLayer || 0}`}</ProgressLabel>
            <Progress>
              <ProgressBar progress={progress} />
            </Progress>
          </>
        )}
      </>
    );
  };

  const renderError = () => (
    <>
      <NetworkIndicator color={smColors.red} />
      <ProgressLabel>Please restart node</ProgressLabel>
    </>
  );

  return error ? renderError() : renderSyncingStatus();
};

export default NetworkStatus;