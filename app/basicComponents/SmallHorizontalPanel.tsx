import React from 'react';
import styled from 'styled-components';
import { horizontalPanelBlack, horizontalPanelWhite } from '../assets/images';

const Wrapper = styled.img`
  position: absolute;
  top: -25px;
  right: 0px;
  width: 60px;
  height: 15px;
`;

type Props = {
  isDarkMode: boolean;
};

const SmallHorizontalPanel = ({ isDarkMode }: Props) => <Wrapper src={isDarkMode ? horizontalPanelWhite : horizontalPanelBlack} />;

export default SmallHorizontalPanel;