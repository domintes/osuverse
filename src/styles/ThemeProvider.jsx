import React from 'react';
import { ThemeProvider as StyledThemeProvider, createGlobalStyle } from 'styled-components';
import { theme } from './theme';

// Global styles with cyberpunk/void aesthetics
const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Cracked Code';
    src: url('/fonts/CrackedCode.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'CyberDisplay';
    src: url('/fonts/CyberDisplay.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.typography.fontFamily.base};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    min-height: 100vh;
    overflow-x: hidden;
    position: relative;
    background-image: radial-gradient(circle at center, ${({ theme }) => theme.colors.void} 0%, ${({ theme }) => theme.colors.background} 70%);
    
    &::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: url('/noise.png') repeat;
      opacity: 0.03;
      pointer-events: none;
      z-index: ${({ theme }) => theme.zIndex.background};
    }
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.fast};
    position: relative;
    
    &:hover {
      color: ${({ theme }) => theme.colors.neon.blue};
      text-shadow: 0 0 5px ${({ theme }) => theme.colors.neon.blue};
    }
  }

  button, input, select, textarea {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.typography.fontFamily.heading};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.text};
  }

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  }

  h2 {
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  }

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  }

  img {
    max-width: 100%;
  }

  ul, ol {
    list-style: none;
  }

  .cyber-text {
    font-family: ${({ theme }) => theme.typography.fontFamily.cyber};
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.cyber};
  }

  .cracked-text {
    font-family: ${({ theme }) => theme.typography.fontFamily.cracked};
    text-transform: uppercase;
  }

  .glitch-text {
    position: relative;
    
    &::before, &::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    &::before {
      left: 2px;
      text-shadow: -1px 0 ${({ theme }) => theme.colors.neon.pink};
      clip: rect(24px, 550px, 90px, 0);
      animation: glitch-anim 3s infinite linear alternate-reverse;
    }

    &::after {
      left: -2px;
      text-shadow: -1px 0 ${({ theme }) => theme.colors.neon.blue};
      clip: rect(85px, 550px, 140px, 0);
      animation: glitch-anim2 2.5s infinite linear alternate-reverse;
    }
  }

  @keyframes glitch-anim {
    0% { clip: rect(42px, 9999px, 44px, 0); }
    5% { clip: rect(12px, 9999px, 59px, 0); }
    10% { clip: rect(48px, 9999px, 29px, 0); }
    15% { clip: rect(42px, 9999px, 73px, 0); }
    20% { clip: rect(63px, 9999px, 27px, 0); }
    25% { clip: rect(34px, 9999px, 55px, 0); }
    30% { clip: rect(86px, 9999px, 73px, 0); }
    35% { clip: rect(20px, 9999px, 20px, 0); }
    40% { clip: rect(26px, 9999px, 60px, 0); }
    45% { clip: rect(25px, 9999px, 66px, 0); }
    50% { clip: rect(57px, 9999px, 98px, 0); }
    55% { clip: rect(5px, 9999px, 46px, 0); }
    60% { clip: rect(82px, 9999px, 31px, 0); }
    65% { clip: rect(54px, 9999px, 27px, 0); }
    70% { clip: rect(28px, 9999px, 99px, 0); }
    75% { clip: rect(45px, 9999px, 69px, 0); }
    80% { clip: rect(23px, 9999px, 85px, 0); }
    85% { clip: rect(54px, 9999px, 84px, 0); }
    90% { clip: rect(45px, 9999px, 47px, 0); }
    95% { clip: rect(37px, 9999px, 20px, 0); }
    100% { clip: rect(4px, 9999px, 91px, 0); }
  }

  @keyframes glitch-anim2 {
    0% { clip: rect(65px, 9999px, 65px, 0); }
    5% { clip: rect(52px, 9999px, 77px, 0); }
    10% { clip: rect(35px, 9999px, 55px, 0); }
    15% { clip: rect(86px, 9999px, 49px, 0); }
    20% { clip: rect(23px, 9999px, 24px, 0); }
    25% { clip: rect(89px, 9999px, 90px, 0); }
    30% { clip: rect(2px, 9999px, 79px, 0); }
    35% { clip: rect(14px, 9999px, 34px, 0); }
    40% { clip: rect(79px, 9999px, 65px, 0); }
    45% { clip: rect(26px, 9999px, 35px, 0); }
    50% { clip: rect(80px, 9999px, 51px, 0); }
    55% { clip: rect(33px, 9999px, 23px, 0); }
    60% { clip: rect(40px, 9999px, 65px, 0); }
    65% { clip: rect(80px, 9999px, 41px, 0); }
    70% { clip: rect(91px, 9999px, 60px, 0); }
    75% { clip: rect(19px, 9999px, 76px, 0); }
    80% { clip: rect(65px, 9999px, 62px, 0); }
    85% { clip: rect(53px, 9999px, 59px, 0); }
    90% { clip: rect(19px, 9999px, 45px, 0); }
    95% { clip: rect(21px, 9999px, 35px, 0); }
    100% { clip: rect(63px, 9999px, 52px, 0); }
  }
`;

const ThemeProvider = ({ children }) => {
  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </StyledThemeProvider>
  );
};

export default ThemeProvider;
