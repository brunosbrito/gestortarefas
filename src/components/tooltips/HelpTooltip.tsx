import { InfoTooltip } from './InfoTooltip';

interface HelpTooltipProps {
  content: string | React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * Wrapper especializado do InfoTooltip para uso em labels de formulários
 * Sempre usa o ícone de ajuda (HelpCircle)
 */
export const HelpTooltip = ({ content, side = 'right' }: HelpTooltipProps) => {
  return (
    <InfoTooltip
      content={content}
      side={side}
      variant="help"
      iconClassName="w-3.5 h-3.5"
    />
  );
};
