import { color, shadow, radius, space, font, fontSize, transition, lighten, darken } from '../../styles/theme';
import { VoidContainer, hoverEffect } from '../../styles/components';

export const BeatmapSetContainer = styled(VoidContainer)`
  margin-bottom: ${space('md')};
  transition: all ${transition('normal')};
  overflow: hidden;

  &.hovered {
    transform: translateY(-2px);
    box-shadow: ${shadow('hover')};
    ${hoverEffect};
  }
`;

export const BeatmapSetMain = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: ${space('md')};
  padding: ${space('md')};
  background: linear-gradient(135deg, ${color('void')} 0%, ${darken(color('void'), 0.05)} 100%);
`;

export const CoverContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: ${radius('md')};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform ${transition('normal')};

    .hovered & {
      transform: scale(1.05);
    }
  }
`;

export const StatusBadge = styled.div`
  position: absolute;
  top: ${space('xs')};
  right: ${space('xs')};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${fontSize('sm')};
  backdrop-filter: blur(4px);

  &.ranked {
    background: rgba(${color('success').replace('#', '').match(/../g).map(x => parseInt(x, 16)).join(', ')}, 0.2);
    border: 1px solid ${color('success')};
  }

  &.loved {
    background: rgba(${color('primary').replace('#', '').match(/../g).map(x => parseInt(x, 16)).join(', ')}, 0.2);
    border: 1px solid ${color('primary')};
  }

  &.qualified {
    background: rgba(255, 170, 0, 0.2);
    border: 1px solid #ffaa00;
  }

  &.pending {
    background: rgba(${color('textSecondary').replace('#', '').match(/../g).map(x => parseInt(x, 16)).join(', ')}, 0.2);
    border: 1px solid ${color('textSecondary')};
  }

  &.unranked {
    background: rgba(${color('textSecondary').replace('#', '').match(/../g).map(x => parseInt(x, 16)).join(', ')}, 0.1);
    border: 1px solid rgba(${color('textSecondary').replace('#', '').match(/../g).map(x => parseInt(x, 16)).join(', ')}, 0.3);
  }
`;

export const BeatmapInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0; // Fix for text-overflow
`;

export const BeatmapHeader = styled.div``;

export const Title = styled.h3`
  font-family: ${font('heading')};
  font-size: ${fontSize('xl')};
  margin-bottom: ${space('xs')};
  color: ${color('text')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Artist = styled.span`
  color: ${color('textSecondary')};
  font-size: ${fontSize('lg')};
`;

export const Mapper = styled.div`
  font-size: ${fontSize('sm')};
  color: ${color('textSecondary')};

  a {
    color: ${color('primary')};
    text-decoration: none;
    transition: color ${transition('fast')};

    &:hover {
      color: ${lighten(color('primary'), 0.1)};
      text-decoration: underline;
    }
  }
`;

export const BeatmapStats = styled.div`
  display: flex;
  gap: ${space('lg')};
  margin-top: auto;
`;

export const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: ${space('xs')};
`;

export const StatLabel = styled.span`
  color: ${color('textSecondary')};
  font-size: ${fontSize('sm')};
`;

export const StatValue = styled.span`
  font-family: ${font('glitch')};
  color: ${color('text')};
`;

export const BeatmapActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${space('sm')};
`;

export const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${fontSize('lg')};
  transition: all ${transition('normal')};
  border: none;
  cursor: pointer;
  
  &.add {
    background: ${color('primary')};
    color: ${color('text')};

    &:hover {
      background: ${lighten(color('primary'), 0.05)};
    }
  }

  &.remove {
    background: rgba(${color('error').replace('#', '').match(/../g).map(x => parseInt(x, 16)).join(', ')}, 0.1);
    color: ${color('error')};

    &:hover {
      background: rgba(${color('error').replace('#', '').match(/../g).map(x => parseInt(x, 16)).join(', ')}, 0.2);
    }
  }

  &.toggle-difficulties {
    background: ${color('secondary')};
    color: ${color('text')};

    &.active {
      transform: rotate(180deg);
      background: ${lighten(color('secondary'), 0.1)};
    }

    &:hover {
      background: ${lighten(color('secondary'), 0.05)};
    }
  }

  &.small {
    width: 24px;
    height: 24px;
    font-size: ${fontSize('sm')};
  }
`;

export const DifficultiesList = styled.div`
  border-top: 1px solid ${color('border')};
  padding: ${space('md')};
  background: rgba(${color('void').replace('#', '').match(/../g).map(x => parseInt(x, 16)).join(', ')}, 0.5);
  animation: slideDown ${transition('normal')} forwards;

  @keyframes slideDown {
    from {
      max-height: 0;
      opacity: 0;
    }
    to {
      max-height: 1000px;
      opacity: 1;
    }
  }
`;

export const DifficultyItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${space('sm')};
  border-radius: ${radius('sm')};
  background: rgba(${darken(color('secondary'), 0.05).replace('#', '').match(/../g).map(x => parseInt(x, 16)).join(', ')}, 0.1);
  margin-bottom: ${space('sm')};

  &:last-child {
    margin-bottom: 0;
  }
`;

export const DifficultyInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${space('md')};
`;

export const DifficultyName = styled.span`
  color: ${color('text')};
  font-weight: bold;
`;

export const DifficultyRating = styled.span`
  color: ${color('primary')};
  font-family: ${font('glitch')};
`;

export const DifficultyStats = styled.div`
  display: flex;
  gap: ${space('md')};
`;

export const DifficultyActions = styled.div``;
