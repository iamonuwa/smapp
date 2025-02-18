import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { startSmeshing, deletePosData } from '../../redux/smesher/actions';
import { CorneredContainer, BackButton } from '../../components/common';
import { PoSModifyPostData, PoSDirectory, PoSSize, PoSProvider, PoSSummary } from '../../components/node';
import { StepsContainer } from '../../basicComponents';
import { posIcon } from '../../assets/images';
import { formatBytes } from '../../infra/utils';
import { AppThDispatch, ComputeProvider, ComputeProviders, RootState } from '../../types';
import { eventsService } from '../../infra/eventsService';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const headers = ['PROOF OF SPACE DATA', 'PROOF OF SPACE DIRECTORY', 'PROOF OF SPACE SIZE', 'POS PROCESSOR', 'POS SETUP'];
const subHeaders = [
  '',
  '',
  'Select how much free space to commit to Spacemesh.\nThe more space you commit, the higher your smeshing rewards will be.',
  'Select a supported graphic processor to use for creating your proof of space',
  'Review your proof of space data creation options.\nClick a link to go back and edit that item.'
];

interface Props extends RouteComponentProps {
  location: {
    hash: string;
    pathname: string;
    search: string;
    state: { modifyPostData: boolean };
  };
}

const NodeSetup = ({ history, location }: Props) => {
  const accounts = useSelector((state: RootState) => state.wallet.accounts);
  const status = useSelector((state: RootState) => state.node.status);
  const existingDataDir = useSelector((state: RootState) => state.smesher.dataDir);
  const minCommitmentSize = useSelector((state: RootState) => state.network.minCommitmentSize);
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode);
  const hideSmesherLeftPanel = useSelector((state: RootState) => state.ui.hideSmesherLeftPanel);
  const [mode, setMode] = useState(location?.state?.modifyPostData ? 0 : 1);
  const [dataDir, setDataDir] = useState(existingDataDir || '');
  const [freeSpace, setFreeSpace] = useState('');
  const [commitmentSize, setCommitmentSize] = useState(0);
  const [providers, setProviders] = useState<ComputeProviders>([]);
  const [provider, setProvider] = useState<ComputeProvider>();
  const [throttle, setThrottle] = useState(false);

  const dispatch: AppThDispatch = useDispatch();

  useEffect(() => {
    const loadComputeProviders = async () => {
      const { error, postComputeProviders } = await eventsService.getPostComputeProviders();
      if (!error) {
        setProviders(postComputeProviders);
      }
    };
    loadComputeProviders();
  }, [dispatch]);

  const formattedCommitmentSize = formatBytes(minCommitmentSize);
  const subHeader = mode !== 1 ? subHeaders[mode] : `Select a directory to save your proof og space data.\nMinimum ${formattedCommitmentSize} of free space is required`;
  const hasBackButton = location?.state?.modifyPostData || mode !== 1;

  const setupAndInitMining = async () => {
    // @ts-ignore
    const done = await dispatch(startSmeshing({ coinbase: accounts[0].publicKey, dataDir, commitmentSize, provider, throttle }));
    if (done) {
      history.push('/main/node', { showIntro: true });
    }
  };

  const handleNextAction = () => {
    if (mode !== 4) {
      setMode(mode + 1);
    } else {
      setupAndInitMining();
    }
  };

  const handleDeletePosData = async () => {
    await dispatch(deletePosData());
    history.push('/main/wallet/');
  };

  const handlePrevAction = () => {
    if (mode === 0) {
      history.goBack();
    } else {
      setMode(mode - 1);
    }
  };

  const renderRightSection = () => {
    switch (mode) {
      case 0:
        return <PoSModifyPostData modify={handleNextAction} deleteData={handleDeletePosData} isDarkMode={isDarkMode} />;
      case 1:
        return (
          <PoSDirectory
            nextAction={handleNextAction}
            minCommitmentSize={formattedCommitmentSize}
            dataDir={dataDir}
            setDataDir={setDataDir}
            freeSpace={freeSpace}
            setFreeSpace={setFreeSpace}
            status={status}
            isDarkMode={isDarkMode}
            skipAction={() => history.push('/main/wallet')}
          />
        );
      case 2:
        return (
          <PoSSize
            nextAction={handleNextAction}
            dataDir={dataDir}
            freeSpace={freeSpace}
            commitmentSize={commitmentSize}
            setCommitmentSize={setCommitmentSize}
            status={status}
            isDarkMode={isDarkMode}
          />
        );
      case 3:
        return (
          <PoSProvider
            nextAction={handleNextAction}
            providers={providers}
            provider={provider}
            setProvider={setProvider}
            throttle={throttle}
            setThrottle={setThrottle}
            status={status}
            isDarkMode={isDarkMode}
          />
        );
      case 4:
        return (
          <PoSSummary
            isDarkMode={isDarkMode}
            dataDir={dataDir}
            commitmentSize={formatBytes(commitmentSize)}
            provider={provider}
            throttle={throttle}
            nextAction={handleNextAction}
            switchMode={({ mode }) => setMode(mode)}
            status={status}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Wrapper>
      {!hideSmesherLeftPanel && <StepsContainer steps={['SETUP WALLET', 'SETUP PROOF OF SPACE']} currentStep={1} isDarkMode={isDarkMode} />}
      <CorneredContainer isDarkMode={isDarkMode} width={!hideSmesherLeftPanel ? 650 : 760} height={450} header={headers[mode]} headerIcon={posIcon} subHeader={subHeader}>
        {hasBackButton && <BackButton action={handlePrevAction} />}
        {renderRightSection()}
      </CorneredContainer>
    </Wrapper>
  );
};

export default NodeSetup;
