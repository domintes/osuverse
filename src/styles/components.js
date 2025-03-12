import { color, shadow, radius, space, transition, gradients } from './theme';

// Replace void-container mixin
export const VoidContainer = styled.div`
  background: ${gradients.void};
  border: 1px solid ${color('border')};
  border-radius: ${radius('lg')};
  box-shadow: ${shadow('void')};
  backdrop-filter: blur(10px);
`;

// Replace flex-center mixin
export const FlexCenter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Replace grid-container mixin
export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: ${space('md')};
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 ${space('lg')};
`;

// Common hover effect
export const hoverEffect = `
  transition: all ${transition('normal')};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadow('hover')};
  }

  &:active {
    transform: translateY(0);
    box-shadow: ${shadow('active')};
  }
`;

// Button component with variants
export const Button = styled.button`
  padding: ${space('sm')} ${space('md')};
  border-radius: ${radius('md')};
  font-weight: bold;
  cursor: pointer;
  border: none;
  ${hoverEffect}

  ${props => props.primary && `
    background: ${color('primary')};
    color: ${color('text')};
  `}

  ${props => props.secondary && `
    background: ${color('secondary')};
    color: ${color('text')};
  `}

  ${props => props.outlined && `
    background: transparent;
    border: 1px solid ${color('border')};
    color: ${color('textSecondary')};
    
    &:hover {
      border-color: ${color('primary')};
      color: ${color('primary')};
    }
  `}
`;
