import React, { useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { chevronLeftBlack, chevronLeftWhite, chevronRightBlack, chevronRightWhite, addContact, explorer, copyBlack, copyWhite } from '../../assets/images';
import { Modal } from '../common';
import { Button, Link, Input } from '../../basicComponents';
import { getFormattedTimestamp, getAddress, formatSmidge } from '../../infra/utils';
import { smColors } from '../../vars';
import { RootState, Tx, TxState } from '../../types';
import { eventsService } from '../../infra/eventsService';

const Wrapper = styled.div<{ isDetailed: boolean }>`
  display: flex;
  flex-direction: column;
  ${({ isDetailed }) => isDetailed && `background-color: ${smColors.lighterGray};`}
  cursor: pointer;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  padding: 10px 10px 15px 10px;
  cursor: pointer;
  background-color: ${({ theme }) => (theme.isDarkMode ? smColors.black : 'transparent')};
  &:hover {
    background-color: ${({ theme }) => (theme.isDarkMode ? smColors.dark75Alpha : smColors.disabledGray)};
  }
`;

const Icon = styled.img`
  width: 10px;
  height: 20px;
  margin-right: 10px;
`;

const HeaderInner = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: relative;
  width: 100%;
  cursor: inherit;
`;

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
`;

const Text = styled.span`
  font-size: 13px;
  line-height: 17px;
  color: ${({ theme }) => (theme.isDarkMode ? smColors.white : smColors.darkGray50Alpha)};
`;

const BlackText = styled(Text)`
  color: ${({ theme }) => (theme.isDarkMode ? smColors.white : smColors.realBlack)};
`;

const BoldText = styled(Text)`
  font-family: SourceCodeProBold;
  color: ${({ color, theme }) => {
    if (color) {
      return color;
    } else {
      return theme.isDarkMode ? smColors.white : smColors.realBlack;
    }
  }};
`;

const DarkGrayText = styled(Text)`
  color: ${({ theme }) => (theme.isDarkMode ? smColors.white : smColors.darkGray)};
  cursor: inherit;
`;

const Amount = styled.div`
  font-size: 13px;
  margin: 2px 0px;
  text-align: right;
  color: ${({ color }) => color};
  cursor: inherit;
`;

const CopiedBanner = styled.div`
  position: absolute;
  left: 48%;
  top: 15px;
  font-size: 15px;
  line-height: 20px;
  color: ${smColors.darkerGreen};
`;

const DetailsSection = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
  padding: 6px 12px 12px 20px;
  background-color: ${({ theme }) => (theme.isDarkMode ? smColors.black : 'transparent')};
`;

const TextRow = styled.div<{ isLast?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  overflow: hidden;
  white-space: nowrap;
  padding: 5px 0;
  border-bottom: ${({ isLast, theme }) => (isLast ? `0px` : `1px solid ${theme.isDarkMode ? smColors.dMBlack1 : smColors.darkGray10Alpha};`)};
  :first-child {
    border-top: ${({ theme }) => `1px solid ${theme.isDarkMode ? smColors.dMBlack1 : smColors.darkGray10Alpha};`};
  }
  :last-child {
    border-bottom: none;
  }
`;

const AddToContactsImg = styled.img`
  width: 14px;
  height: 12px;
  cursor: pointer;
  margin-left: 4px;
`;

const InputSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const Chevron = styled.img`
  width: 8px;
  height: 13px;
  margin-right: 10px;
  align-self: center;
`;

const LinkEdit = styled.span`
  color: ${smColors.blue};
  text-decoration: underline;
  margin-left: 5px;
  cursor: pointer;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  margin: 30px 0 15px 0;
`;

const RightButton = styled.div`
  display: flex;
  align-items: flex-end;
`;

const ExplorerIcon = styled.img`
  width: 20px;
  height: 20px;
  margin-left: 5px;
  cursor: pointer;
`;

const CopyIcon = styled.img`
  width: 16px;
  height: 15px;
  margin-left: 5px;
  cursor: inherit;
`;

const formatTxId = (id: string | undefined) => id && `0x${id.substring(0, 6)}`;

type Props = {
  tx: Tx;
  publicKey: string;
  addAddressToContacts: ({ address }: { address: string }) => void;
};

const TxRow = ({ tx, publicKey, addAddressToContacts }: Props) => {
  const [isDetailed, setIsDetailed] = useState(false);
  const [note, setNote] = useState(tx.note || '');
  const [isCopied, setIsCopied] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const currentAccountIndex = useSelector((state: RootState) => state.wallet.currentAccountIndex);
  const explorerUrl = useSelector((state: RootState) => state.network.explorerUrl);
  const isDarkMode = useSelector((state: RootState) => state.ui.isDarkMode);

  const { txId, nickname, amount, fee, sender, receiver, status, layerId, timestamp } = tx;
  const statuses: Array<string> = Object.keys(TxState);

  const getColor = ({ isSent }: { isSent: boolean }) => {
    if (status === TxState.MEMPOOL || status === TxState.MESH) {
      return smColors.orange;
    } else if (status === TxState.REJECTED || status === TxState.INSUFFICIENT_FUNDS || status === TxState.CONFLICTING) {
      return smColors.red;
    }
    return isSent ? smColors.blue : smColors.darkerGreen;
  };

  const isSent = txId !== 'reward' ? tx.sender === getAddress(publicKey) : false;
  const color = getColor({ isSent });
  const chevronLeft = isDarkMode ? chevronLeftWhite : chevronLeftBlack;
  const chevronRight = isDarkMode ? chevronRightWhite : chevronRightBlack;

  const copyAddress = async ({ id }: { id: string }) => {
    await navigator.clipboard.writeText(`0x${id}`);
    setIsCopied(true);
  };

  const handleAddToContacts = (event: React.MouseEvent, address: string) => {
    event.stopPropagation();
    addAddressToContacts({ address });
  };

  const save = async () => {
    await eventsService.updateTransaction({ newData: { note }, accountIndex: currentAccountIndex, txId: tx.txId });
    setIsDetailed(false);
    setShowNoteModal(false);
  };

  const toggleTxDetails = () => {
    setIsDetailed(!isDetailed);
  };

  const renderDetails = () => (
    <DetailsSection>
      <TextRow>
        <BlackText>TRANSACTION ID</BlackText>
        <BoldText onClick={() => copyAddress({ id: txId })}>
          {formatTxId(txId)}
          <CopyIcon src={isDarkMode ? copyWhite : copyBlack} />
          <ExplorerIcon src={explorer} onClick={() => window.open(`${explorerUrl}txs/0x${txId}${isDarkMode ? '?dark' : ''}`)} />
        </BoldText>
      </TextRow>
      <TextRow>
        <BlackText>STATUS</BlackText>
        <BoldText color={color}>{statuses[status]}</BoldText>
      </TextRow>
      {layerId ? (
        <TextRow>
          <BlackText>LAYER ID</BlackText>
          <BoldText>{layerId}</BoldText>
        </TextRow>
      ) : null}
      <TextRow>
        <BlackText>FROM</BlackText>
        <BoldText onClick={!isSent ? () => copyAddress({ id: sender }) : () => {}}>
          {isSent ? `0x${getAddress(publicKey)} (Me)` : nickname || `0x${sender}`}
          <CopyIcon src={isDarkMode ? copyWhite : copyBlack} />
          {!isSent && !nickname && <AddToContactsImg onClick={(e: React.MouseEvent) => handleAddToContacts(e, sender)} src={addContact} />}
        </BoldText>
      </TextRow>
      <TextRow>
        <BlackText>TO</BlackText>
        <BoldText onClick={isSent ? () => copyAddress({ id: receiver }) : () => {}}>
          {isSent ? nickname || `0x${receiver}` : `0x${getAddress(publicKey)} (Me)`}
          {isSent && <CopyIcon src={isDarkMode ? copyWhite : copyBlack} />}
          {isSent && !nickname && <AddToContactsImg onClick={(e: React.MouseEvent) => handleAddToContacts(e, `0x${receiver}`)} src={addContact} />}
        </BoldText>
      </TextRow>
      <TextRow>
        <BlackText>VALUE</BlackText>
        <BoldText>{formatSmidge(amount)}</BoldText>
      </TextRow>
      <TextRow>
        <BlackText>TRANSACTION FEE</BlackText>
        <BoldText>{formatSmidge(fee || 0)}</BoldText>
      </TextRow>
      <TextRow>
        <BlackText>NOTE</BlackText>
        <BlackText>
          {note ? `${note}` : `NO NOTE`}
          <LinkEdit onClick={() => setShowNoteModal(true)}>EDIT</LinkEdit>
        </BlackText>
      </TextRow>
    </DetailsSection>
  );

  return (
    <Wrapper isDetailed={isDetailed}>
      <Header onClick={toggleTxDetails}>
        <Icon src={isSent ? chevronRight : chevronLeft} />
        <HeaderInner>
          <HeaderSection>
            [tx.nickname && <DarkGrayText key="nickname">{nickname && nickname.toUpperCase()}</DarkGrayText>, <Text key={txId}>{formatTxId(txId)}</Text>]
          </HeaderSection>
          <HeaderSection>
            <Amount color={color}>{`${isSent ? '-' : '+'}${formatSmidge(amount)}`}</Amount>
            <DarkGrayText>{getFormattedTimestamp(timestamp)}</DarkGrayText>
          </HeaderSection>
          {isCopied && <CopiedBanner>Copied!</CopiedBanner>}
        </HeaderInner>
      </Header>
      {isDetailed && renderDetails()}
      {showNoteModal && (
        <Modal header="Note" subHeader="enter your transaction note">
          <InputSection>
            <Chevron src={chevronRight} />
            <Input
              type="text"
              placeholder="NOTE"
              value={note}
              onEnterPress={save}
              onChange={({ value }: { value: string }) => {
                setNote(value);
              }}
              autofocus
            />
          </InputSection>
          <ButtonsWrapper>
            <Link onClick={() => window.open('https://testnet.spacemesh.io/#/send_coin')} text="TRANSACTION GUIDE" />
            <RightButton>
              <Link style={{ color: smColors.orange, marginRight: '10px' }} onClick={() => setShowNoteModal(false)} text="CANCEL" />
              <Button text="NEXT" isDisabled={note === tx.note} onClick={save} />
            </RightButton>
          </ButtonsWrapper>
        </Modal>
      )}
    </Wrapper>
  );
};

export default TxRow;
