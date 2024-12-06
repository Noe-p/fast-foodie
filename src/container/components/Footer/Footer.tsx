import { Link, P14 } from '@/components/Texts';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { SocialIcon } from 'react-social-icons';
import tw from 'tailwind-styled-components';

interface FooterProps {
  className?: string;
}

export function Footer(props: FooterProps): React.JSX.Element {
  const { className } = props;
  const { t } = useTranslation();

  return (
    <Main className={className}>
      <InfosContainer>
        <LinkStyled href='mailto:noephilippe29@gmail.com' target='_blank'>
          {t('noephilippe29@gmail.com')}
        </LinkStyled>
        <LinkStyled href='tel:0781533181' target='_blank'>
          {t('07 81 53 31 81')}
        </LinkStyled>
        <LinkStyled
          href='https://maps.google.com/maps?q=172+avenue+winston+churchill+rennes'
          target='_blank'
        >
          {t('16 avenue des Lilas - 35000 Rennes')}
        </LinkStyled>
      </InfosContainer>
      <SocialMediasContainer>
        <SocialLogo network='facebook' />
        <SocialLogo network='instagram' />
        <SocialLogo network='twitter' />
        <SocialLogo network='linkedin' />
      </SocialMediasContainer>
      <CopyRight>
        {t('generics.designed')}
        <LinkStyled href='https://noe-philippe.com' target='_blank'>
          {'Noé PHILIPPE'}
        </LinkStyled>
      </CopyRight>
      <CopyRight>{t('generics.copyright')}</CopyRight>
    </Main>
  );
}

const Main = tw.div`
  flex
  items-center
  bg-gray-100
  w-full
  flex-col
`;

const SocialMediasContainer = tw.div`
  flex
  p-4
`;

const SocialLogo = tw(SocialIcon)`
  w-5
  h-5
  mx-2
  hover:scale-105
  transition
  duration-100
  ease-in-out
  opacity-90
  hover:opacity-100
  cursor-pointer
`;

const CopyRight = tw(P14)`
  text-center
  text-gray-500
  w-3/4
  mb-4
`;

const InfosContainer = tw.div`
  flex
  flex-col
  items-center
  justify-center
  mb-2
  mt-8
`;

const LinkStyled = tw(Link)`
  text-gray-500
`;
