import { color, shadow, radius, space, font, fontSize, transition, lighten, darken } from '../../styles/theme';

export const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: ${space('md')};
  background: linear-gradient(135deg, ${color('void')} 0%, ${darken(color('void'), 0.05)} 100%);
  border: 1px solid ${color('border')};
  border-radius: ${radius('lg')};
  color: ${color('text')};
  font-family: ${font('base')};
  font-size: ${fontSize('lg')};
  box-shadow: ${shadow('void')};
  transition: all ${transition('normal')};
  outline: none;

  &::placeholder {
    color: ${color('textSecondary')};
    opacity: 0.6;
  }

  &:focus {
    border-color: ${color('primary')};
    box-shadow: 0 0 0 2px ${color('primary')}40;
  }
`;

export const SearchIcon = styled.div`
  position: absolute;
  right: ${space('md')};
  top: 50%;
  transform: translateY(-50%);
  color: ${color('textSecondary')};
  cursor: pointer;
  transition: color ${transition('fast')};

  &:hover {
    color: ${color('primary')};
  }
`;

export const SearchDropdown = styled.div`
  position: absolute;
  top: calc(100% + ${space('sm')});
  left: 0;
  right: 0;
  background: linear-gradient(135deg, ${color('void')} 0%, ${darken(color('void'), 0.05)} 100%);
  border: 1px solid ${color('border')};
  border-radius: ${radius('lg')};
  box-shadow: ${shadow('void')};
  z-index: 10;
  overflow: hidden;
  animation: fadeIn ${transition('fast')} forwards;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const SearchDropdownHeader = styled.div`
  padding: ${space('sm')} ${space('md')};
  border-bottom: 1px solid ${color('border')};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const SearchTitle = styled.span`
  font-weight: bold;
  color: ${color('text')};
`;

export const SearchCloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${color('textSecondary')};
  cursor: pointer;
  font-size: ${fontSize('lg')};
  transition: color ${transition('fast')};
  
  &:hover {
    color: ${color('primary')};
  }
`;

export const SearchFilters = styled.div`
  padding: ${space('sm')} ${space('md')};
  border-bottom: 1px solid ${color('border')};
  display: flex;
  gap: ${space('md')};
  flex-wrap: wrap;
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${space('xs')};
`;

export const FilterLabel = styled.span`
  font-size: ${fontSize('sm')};
  color: ${color('textSecondary')};
`;

export const FilterSelect = styled.select`
  padding: ${space('xs')} ${space('sm')};
  background: ${darken(color('void'), 0.05)};
  border: 1px solid ${color('border')};
  border-radius: ${radius('sm')};
  color: ${color('text')};
  appearance: none;
  cursor: pointer;
  position: relative;
  
  &:focus {
    border-color: ${color('primary')};
  }
`;

export const FilterInput = styled.input`
  padding: ${space('xs')} ${space('sm')};
  background: ${darken(color('void'), 0.05)};
  border: 1px solid ${color('border')};
  border-radius: ${radius('sm')};
  color: ${color('text')};
  
  &:focus {
    border-color: ${color('primary')};
  }
  
  &[type="number"] {
    width: 80px;
    text-align: center;
    appearance: textfield;
    
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      appearance: none;
      margin: 0;
    }
  }
`;

export const SearchResults = styled.div`
  max-height: 50vh;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${darken(color('void'), 0.05)};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${color('secondary')};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${lighten(color('secondary'), 0.1)};
  }
`;

export const NoResults = styled.div`
  padding: ${space('lg')};
  text-align: center;
  color: ${color('textSecondary')};
`;

export const LoadMoreButton = styled.button`
  width: 100%;
  padding: ${space('sm')};
  background: ${color('secondary')};
  border: none;
  color: ${color('text')};
  cursor: pointer;
  transition: background ${transition('fast')};
  
  &:hover {
    background: ${lighten(color('secondary'), 0.1)};
  }
  
  &:disabled {
    background: ${darken(color('secondary'), 0.1)};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${space('md')};
  color: ${color('primary')};
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  &::before {
    content: '';
    width: 20px;
    height: 20px;
    border: 2px solid ${color('primary')};
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: ${space('sm')};
  }
`;
