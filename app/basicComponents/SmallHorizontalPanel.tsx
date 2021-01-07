import React from 'react';
import styled from 'styled-components';
import { horizontalPanelBlack, horizontalPanelWhite } from '../assets/images';

const Wrapper = styled.img`
  position: absolute;
  top: -25px;
  right: 0px;
  width: 60px;
  height: 15px;
  transform: ${({ reflection }) => (reflection ? `scale(-1, 1)` : `none`)};
`;

type Props = {
  isDarkMode: boolean;
};

const SmallHorizontalPanel = ({ isDarkMode }: Props) => <Wrapper reflection={isDarkMode} src={isDarkMode ? horizontalPanelBlack : horizontalPanelWhite} />;

export default SmallHorizontalPanel;
