// @flow
import { shell } from 'electron';
import React, { Component } from 'react';
import styled from 'styled-components';
import { Link, Input, DropDown, Button, ErrorPopup } from '/basicComponents';
import { getAbbreviatedText } from '/infra/utils';
import { smColors } from '/vars';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 525px;
  height: 100%;
  margin-right: 10px;
  padding: 10px 15px;
  background-color: ${smColors.black02Alpha};
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const HeaderText = styled.div`
  font-family: SourceCodeProBold;
  font-size: 16px;
  line-height: 20px;
  color: ${smColors.black};
`;

const SubHeader = styled(HeaderText)`
  margin-bottom: 25px;
`;

const DetailsRow = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
`;

const DetailsText = styled.div`
  flex: 1;
  margin-right: 10px;
  font-size: 16px;
  line-height: 20px;
  color: ${smColors.realBlack};
`;

const DetailsText1 = styled(DetailsText)`
  margin-right: 0;
  text-align: right;
`;

const Fee = styled.div`
  font-size: 13px;
  line-height: 17px;
  color: ${smColors.black};
  padding: 5px;
  cursor: inherit;
  ${({ isInDropDown }) => isInDropDown && `opacity: 0.5; border-bottom: 1px solid ${smColors.disabledGray};`}
  &:hover {
    opacity: 1;
    color: ${smColors.darkGray50Alpha};
  }
`;

const Footer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  justify-content: space-between;
  align-items: flex-end;
`;

// TODO add auto update for fee ranges
const fees = [
  {
    fee: 0.001,
    label: '~ 10 min',
    text: '(FEE 0.001 SMC)'
  },
  {
    fee: 0.003,
    label: '~ 5 min',
    text: '(FEE 0.003 SMC)'
  },
  {
    fee: 0.005,
    label: '~ 1 min',
    text: '(FEE 0.005 SMC)'
  }
];

type Props = {
  fromAddress: string,
  address: string,
  hasAddressError: boolean,
  updateTxAddress: ({ value: string }) => void,
  updateTxAddressDebounced: ({ value: string }) => void,
  resetAddressError: () => void,
  amount: string,
  updateTxAmount: ({ value: string }) => void,
  updateTxAmountDebounced: ({ value: string }) => void,
  hasAmountError: boolean,
  resetAmountError: () => void,
  updateFee: ({ fee: number }) => void,
  note: string,
  updateTxNote: ({ value: string }) => void,
  isNextActionEnabled: boolean,
  nextAction: () => void,
  cancelTx: () => void
};

type State = {
  selectedFeeIndex: number
};

class TxParams extends Component<Props, State> {
  state = {
    selectedFeeIndex: 0
  };

  render() {
    const {
      fromAddress,
      address,
      hasAddressError,
      updateTxAddress,
      updateTxAddressDebounced,
      resetAddressError,
      amount,
      hasAmountError,
      updateTxAmount,
      updateTxAmountDebounced,
      resetAmountError,
      note,
      updateTxNote,
      isNextActionEnabled,
      nextAction,
      cancelTx
    } = this.props;
    const { selectedFeeIndex } = this.state;
    return (
      <Wrapper>
        <Header>
          <HeaderText>Send SMC</HeaderText>
          <Link onClick={cancelTx} text="CANCEL TRANSACTION" style={{ color: smColors.orange }} />
        </Header>
        <SubHeader>--</SubHeader>
        <DetailsRow>
          <DetailsText>From</DetailsText>
          <Input value={address} onChange={updateTxAddress} onChangeDebounced={updateTxAddressDebounced} maxLength="64" style={{ flex: 1 }} />
          {hasAddressError && <ErrorPopup onClick={resetAddressError} text="this address is invalid" style={{ top: '-4px', right: '-195px' }} />}
        </DetailsRow>
        <DetailsRow>
          <DetailsText>From</DetailsText>
          <DetailsText1>{getAbbreviatedText(fromAddress, 8)}</DetailsText1>
        </DetailsRow>
        <DetailsRow>
          <DetailsText>Amount to send</DetailsText>
          <Input value={amount} onChange={updateTxAmount} extraText="SMC" onChangeDebounced={updateTxAmountDebounced} style={{ flex: 1 }} />
          {hasAmountError && <ErrorPopup onClick={resetAmountError} text="you don't have enough SMC in your wallet" style={{ top: '-4px', right: '-195px' }} />}
        </DetailsRow>
        <DetailsRow>
          <DetailsText>Est. Confirmation time</DetailsText>
          <DropDown
            data={fees}
            onPress={this.selectFee}
            DdElement={({ label, text, isMain }) => this.renderFeeElement({ label, text, isInDropDown: !isMain })}
            selectedItemIndex={selectedFeeIndex}
            rowHeight={40}
            style={{ border: `1px solid ${smColors.black}` }}
          />
        </DetailsRow>
        <DetailsRow>
          <DetailsText>
            Note
            <br />
            (only you can see this)
          </DetailsText>
          <Input value={note} onChange={updateTxNote} maxLength="50" style={{ flex: 1 }} />
        </DetailsRow>
        <Footer>
          <Link onClick={this.navigateToGuide} text="SEND SMC GUIDE" />
          <Button onClick={nextAction} text="NEXT" isDisabled={!isNextActionEnabled} />
        </Footer>
      </Wrapper>
    );
  }

  renderFeeElement = ({ label, text, isInDropDown }: { label: string, text: string, isInDropDown: boolean }) => (
    <Fee key={label} isInDropDown={isInDropDown}>
      {label} {text}
    </Fee>
  );

  selectFee = ({ index }: { index: number }) => {
    const { updateFee } = this.props;
    updateFee({ fee: fees[index].fee });
    this.setState({ selectedFeeIndex: index });
  };

  navigateToGuide = () => shell.openExternal('https://testnet.spacemesh.io/#/send_coin');
}

export default TxParams;