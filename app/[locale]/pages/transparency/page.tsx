import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import ContentPage from '@/components/pages/ContentPage'
import ContentSections from '@/components/pages/ContentSections'
import JsonLd from '@/components/seo/JsonLd'
import {
  breadcrumbSchema,
  organizationSchema,
  websiteSchema,
} from '@/components/seo/schema'
import { SITE } from '@/lib/constants'

const locales = ['en', 'fr']

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const safeLocale = locale === 'fr' ? 'fr' : 'en'
  const title =
    safeLocale === 'fr'
      ? 'Transparence, propriété et confiance'
      : 'Transparency, ownership and trust'
  const description =
    safeLocale === 'fr'
      ? 'Découvrez qui possède Apple Magic Blog, comment notre rédaction travaille et comment demander une correction.'
      : 'Learn who owns Apple Magic Blog, how our newsroom works and how to request a correction.'
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE.url}/${safeLocale}/pages/transparency`,
      languages: {
        en: `${SITE.url}/en/pages/transparency`,
        fr: `${SITE.url}/fr/pages/transparency`,
        'x-default': `${SITE.url}/en/pages/transparency`,
      },
    },
  }
}

export default async function TransparencyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const safeLocale = locale === 'fr' ? 'fr' : 'en'
  setRequestLocale(safeLocale)
  const french = safeLocale === 'fr'
  const sections = french
    ? [
        {
          heading: 'Propriété et siège',
          body: [
            'Apple Magic Blog est une publication technologique indépendante dont la rédaction est basée à Douala, au Cameroun. Nous ne sommes ni affiliés, ni approuvés, ni sponsorisés par Apple Inc.',
            'Notre nom de publication, nos coordonnées éditoriales, nos auteurs et nos politiques sont affichés de manière cohérente afin que les lecteurs et les plateformes puissent identifier clairement la source de nos contenus.',
          ],
        },
        {
          heading: 'Responsabilité éditoriale',
          body: [
            'Chaque article identifie son auteur, sa date de publication, sa date de mise à jour et sa catégorie. Les profils auteurs présentent leur rôle, leur expérience, leurs domaines d’expertise et leurs liens professionnels.',
            'Les actualités, analyses, opinions, tests, guides et contenus sponsorisés sont distingués dans notre système éditorial et dans les données structurées du site.',
          ],
        },
        {
          heading: 'Sources, exactitude et corrections',
          body: [
            'Nous privilégions les sources primaires, les annonces officielles et les essais directs. Nous attribuons les informations externes et séparons clairement les faits confirmés des rumeurs ou prévisions.',
            'Pour signaler une erreur, écrivez à corrections@applemagic.blog. Les corrections importantes sont apportées rapidement, avec une mise à jour visible de l’article.',
          ],
        },
        {
          heading: 'Indépendance commerciale',
          body: [
            'La publicité, les affiliations et les partenariats ne déterminent jamais nos notes ou conclusions. Les liens rémunérés et contenus sponsorisés sont clairement signalés.',
          ],
        },
        {
          heading: 'Contacter la rédaction',
          body: [
            'Conseils et sujets : tips@applemagic.blog. Presse : press@applemagic.blog. Corrections : corrections@applemagic.blog. Confidentialité : privacy@applemagic.blog. Assistance générale : support@applemagic.blog.',
          ],
        },
      ]
    : [
        {
          heading: 'Ownership and headquarters',
          body: [
            'Apple Magic Blog is an independent technology publication with its editorial operation based in Douala, Cameroon. We are not affiliated with, endorsed by or sponsored by Apple Inc.',
            'Our publication name, editorial contacts, authors and policies are presented consistently so readers and platforms can clearly identify the source behind our reporting.',
          ],
        },
        {
          heading: 'Editorial accountability',
          body: [
            'Every article identifies its author, publication date, update date and category. Author profiles disclose professional roles, experience, expertise and relevant professional links.',
            'News, analysis, opinion, reviews, guides and sponsored material are distinguished in our editorial workflow and in the website structured data.',
          ],
        },
        {
          heading: 'Sources, accuracy and corrections',
          body: [
            'We prioritize primary sources, official announcements and direct testing. External information is attributed, and confirmed facts are clearly separated from rumors or forecasts.',
            'Report an error at corrections@applemagic.blog. Material errors are corrected promptly and the article update is made visible.',
          ],
        },
        {
          heading: 'Commercial independence',
          body: [
            'Advertising, affiliate relationships and partnerships never determine our scores or conclusions. Paid links and sponsored material are clearly disclosed.',
          ],
        },
        {
          heading: 'Contact the newsroom',
          body: [
            'Tips and story ideas: tips@applemagic.blog. Press: press@applemagic.blog. Corrections: corrections@applemagic.blog. Privacy: privacy@applemagic.blog. General support: support@applemagic.blog.',
          ],
        },
      ]
  const title = french
    ? 'Transparence, propriété et confiance'
    : 'Transparency, ownership and trust'

  return (
    <>
      <JsonLd
        data={[
          organizationSchema(safeLocale),
          websiteSchema(safeLocale),
          breadcrumbSchema(
            [{ name: title, path: `/${safeLocale}/pages/transparency` }],
            safeLocale,
          ),
        ]}
      />
      <ContentPage
        eyebrow={french ? 'Confiance' : 'Trust center'}
        title={title}
        intro={
          french
            ? 'Qui nous sommes, qui est responsable de nos contenus et comment nous protégeons notre indépendance éditoriale.'
            : 'Who we are, who is accountable for our content and how we protect editorial independence.'
        }
        lastUpdated={
          french
            ? 'Dernière mise à jour : 5 septembre 2026'
            : 'Last updated: September 5, 2026'
        }
      >
        <ContentSections sections={sections} />
      </ContentPage>
    </>
  )
}
