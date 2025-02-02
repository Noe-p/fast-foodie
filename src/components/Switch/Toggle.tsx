import { useTranslation } from 'next-i18next';
import tw from 'tailwind-styled-components';
import { Col } from '../Helpers';

interface ToggleProps {
  className?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function Toggle(props: ToggleProps): JSX.Element {
  const { className, value, onChange } = props;
  const { t } = useTranslation();

  return (
    <Col className={className}>
      <ToggleContainer
        $active={value}
        onClick={() => onChange(!value)}
      >
        <ToggleCircle $active={value} />
      </ToggleContainer>
    </Col>
  );
}

const ToggleContainer = tw.div`
  flex
  items-center
  justify-center
  w-12
  h-7
  rounded-full
  ${(props: { $active?: boolean }) =>
    props.$active ? 'bg-primary' : 'bg-primary/50'}
  relative
  transition
  duration-200
  cursor-pointer
`;

const ToggleCircle = tw.div<{ $active?: boolean }>`
  absolute
  w-5
  h-5
  rounded-full
  bg-white
  transition
  duration-200
  transform
  left-1
  ${(props: { $active?: boolean }) =>
    props.$active ? 'translate-x-5' : 'translate-x-0'}
`;
