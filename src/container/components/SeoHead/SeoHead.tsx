import Head from 'next/head';
import { useRouter } from 'next/router';

interface SeoHeadProps {
  title?: string;
  description?: string;
}

export function SeoHead(props: SeoHeadProps): React.JSX.Element {
  const { asPath } = useRouter();

  const canonicalUrl = asPath.split('?')[0];

  const title = props.title ?? process.env.NEXT_PUBLIC_DEFAULT_META_TITLE;
  const description =
    props.description ?? process.env.NEXT_PUBLIC_DEFAULT_META_DESCRIPTION;
  const domain = `${process.env.NEXT_PUBLIC_APP_URL}`;
  const url = `${domain}/${canonicalUrl === '/' ? '' : canonicalUrl}`;
  const image = `${process.env.NEXT_PUBLIC_APP_URL}/og.png`;
  const manifest = '/manifest.json';

  return (
    <Head>
      <title>{title}</title>
      <meta name='description' content={description} />

      <meta property='og:url' content={url} />
      <meta property='og:type' content='website' />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={image} />

      <meta name='twitter:card' content='summary_large_image' />
      <meta property='twitter:domain' content={domain} />
      <meta property='twitter:url' content={url} />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={image} />
      <link rel='manifest' href={manifest} />
      <meta name='viewport' content='width=device-width, user-scalable=no' />
    </Head>
  );
}
