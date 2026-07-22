import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '../../hooks/useAuth'

const COUNTRY_SEO: Record<string, {
  siteTitle: string
  keywords: string[]
  description: string
  ageGroups: string[]
  cities?: string[]
}> = {
  US: {
    siteTitle: 'NaughtyHaughty USA',
    keywords: ['adult dating USA', 'mature dating America', 'older men dating USA', 'senior dating USA', 'NSA dating America', 'casual adult dating USA', 'dating for men over 50 USA', 'discreet adult dating', 'mature singles USA', 'older singles New York', 'adult dating site USA', 'hookup site USA', 'older men dating younger women USA', 'dating in New York', 'dating in Los Angeles', 'dating in Chicago', 'dating in Miami', 'dating in Houston'],
    description: 'NaughtyHaughty — the premier adult dating site for mature, confident singles across the USA. Meet real, open-minded women in New York, Los Angeles, Chicago, Miami, and beyond. Join free.',
    ageGroups: ['men over 50 dating USA', 'mature men dating app USA', 'older men singles USA', 'dating for men 55+ America'],
    cities: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Houston', 'Las Vegas', 'Phoenix'],
  },
  CA: {
    siteTitle: 'NaughtyHaughty Canada',
    keywords: ['adult dating Canada', 'mature dating Canada', 'older men dating Canada', 'senior dating Canada', 'NSA dating Canada', 'casual adult dating Canada', 'dating for men over 50 Canada', 'discreet dating Canada', 'mature singles Toronto', 'adult dating Vancouver', 'hookup site Canada', 'older men dating Canada', 'dating in Toronto', 'dating in Vancouver', 'dating in Calgary', 'dating in Montreal'],
    description: 'NaughtyHaughty Canada — meet adventurous, open-minded singles across Canada. Mature adult dating in Toronto, Vancouver, Calgary, and Montreal. Join free today.',
    ageGroups: ['men over 50 dating Canada', 'mature men Canada', 'older singles Toronto', 'dating for men 55+ Canada'],
    cities: ['Toronto', 'Vancouver', 'Calgary', 'Montreal', 'Ottawa', 'Edmonton'],
  },
  AU: {
    siteTitle: 'NaughtyHaughty Australia',
    keywords: ['adult dating Australia', 'mature dating Australia', 'older men dating Australia', 'senior dating Australia', 'NSA dating Australia', 'casual adult dating Australia', 'dating for men over 50 Australia', 'discreet adult dating Australia', 'mature singles Sydney', 'adult dating Melbourne', 'hookup site Australia', 'older men dating Australia', 'dating in Sydney', 'dating in Melbourne', 'dating in Brisbane', 'dating in Perth'],
    description: 'NaughtyHaughty Australia — adult dating for confident, mature singles. Meet adventurous singles in Sydney, Melbourne, Brisbane, Perth, and across Australia. Join free.',
    ageGroups: ['men over 50 dating Australia', 'mature men Australia', 'older singles Sydney', 'dating for men 55+ Australia'],
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
  },
  GB: {
    siteTitle: 'NaughtyHaughty UK',
    keywords: ['adult dating UK', 'mature dating UK', 'older men dating UK', 'senior dating Britain', 'NSA dating UK', 'casual adult dating UK', 'dating for men over 50 UK', 'discreet adult dating UK', 'mature singles London', 'adult dating Manchester', 'hookup site UK', 'older men dating UK', 'dating in London', 'dating in Manchester', 'dating in Birmingham', 'dating in Edinburgh'],
    description: 'NaughtyHaughty UK — the adult dating site for mature, confident British singles. Meet real, open-minded women in London, Manchester, Birmingham, and across the UK. Join free.',
    ageGroups: ['men over 50 dating UK', 'mature men UK', 'older singles London', 'dating for men 55+ Britain'],
    cities: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Leeds', 'Bristol'],
  },
  NZ: {
    siteTitle: 'NaughtyHaughty New Zealand',
    keywords: ['adult dating New Zealand', 'mature dating NZ', 'older men dating New Zealand', 'casual dating NZ', 'dating for men over 50 NZ', 'discreet dating New Zealand', 'mature singles Auckland', 'adult dating NZ'],
    description: 'NaughtyHaughty New Zealand — adult dating for mature, open-minded singles. Meet adventurous women in Auckland, Wellington, and across New Zealand.',
    ageGroups: ['men over 50 NZ', 'mature men New Zealand', 'older singles Auckland'],
    cities: ['Auckland', 'Wellington', 'Christchurch'],
  },
  IE: {
    siteTitle: 'NaughtyHaughty Ireland',
    keywords: ['adult dating Ireland', 'mature dating Ireland', 'older men dating Ireland', 'casual dating Ireland', 'dating for men over 50 Ireland', 'discreet dating Ireland', 'mature singles Dublin', 'adult dating site Ireland'],
    description: 'NaughtyHaughty Ireland — meet adventurous, open-minded singles across Ireland. Adult dating in Dublin and beyond.',
    ageGroups: ['men over 50 Ireland', 'mature men Dublin', 'older singles Ireland'],
    cities: ['Dublin', 'Cork', 'Galway'],
  },
  DEFAULT: {
    siteTitle: 'NaughtyHaughty',
    keywords: ['adult dating', 'mature dating', 'older men dating', 'NSA dating', 'casual adult dating', 'senior dating site', 'discreet dating', 'dating for men over 50', 'hookup site', 'mature singles', 'older singles', 'adult dating site free', 'meet singles online', 'adult personals'],
    description: 'NaughtyHaughty — the premier adult dating site for mature, confident singles worldwide. Real connections with open-minded people. Join free.',
    ageGroups: ['men over 50 dating', 'mature men dating', 'older singles dating', 'senior adult dating'],
  },
}

const COUNTRY_NAMES: Record<string, string> = {
  US: 'the United States', GB: 'the United Kingdom', CA: 'Canada', AU: 'Australia',
  NZ: 'New Zealand', IE: 'Ireland', DE: 'Germany', FR: 'France',
  SG: 'Singapore', ZA: 'South Africa', AE: 'UAE',
}

function getCountryName(code: string): string {
  return COUNTRY_NAMES[code] || code
}

function upsertMeta(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el) }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el) }
  el.setAttribute('href', href)
}

function buildTitle(path: string, countryCode: string, city: string): string {
  const c = countryCode && countryCode !== 'DEFAULT' ? countryCode : ''
  const countryName = c ? getCountryName(c) : ''
  const siteTitle = COUNTRY_SEO[countryCode]?.siteTitle || COUNTRY_SEO.DEFAULT.siteTitle
  const loc = city || countryName

  if (path === '/') return `${siteTitle} | Adult Dating for Mature Singles${loc ? ` in ${loc}` : ''}`
  if (path === '/discover') return `Discover Singles${loc ? ` in ${loc}` : ' Worldwide'} | NaughtyHaughty`
  if (path === '/meet') return `Meet Singles${loc ? ` in ${loc}` : ''} | NaughtyHaughty`
  if (path === '/likes') return `Your Likes & Matches${loc ? ` in ${loc}` : ''} | NaughtyHaughty`
  if (path === '/chat') return `Messages | NaughtyHaughty`
  if (path.startsWith('/chat/')) return `Chat | NaughtyHaughty`
  if (path === '/visitors') return `Profile Visitors | NaughtyHaughty`
  if (path === '/gifts') return `Gifts | NaughtyHaughty`
  if (path === '/login') return `Sign In | NaughtyHaughty`
  if (path === '/register') return `Join Free${loc ? ` — Meet Singles in ${loc}` : ''} | NaughtyHaughty`
  if (path === '/premium') return `VIP Premium Membership | NaughtyHaughty`
  if (path === '/credits') return `Credits & Payments | NaughtyHaughty`
  if (path === '/boost') return `Boost Your Profile | NaughtyHaughty`
  if (path === '/home') return `Your Matches${loc ? ` in ${loc}` : ''} | NaughtyHaughty`
  if (path === '/settings') return `Settings | NaughtyHaughty`
  if (path === '/referrals') return `Referrals | NaughtyHaughty`
  if (path === '/contact') return `Contact Us | NaughtyHaughty`
  if (path === '/terms') return `Terms of Service | NaughtyHaughty`
  if (path === '/privacy') return `Privacy Policy | NaughtyHaughty`
  if (path.startsWith('/profile/') || path.startsWith('/@')) return `Profile | NaughtyHaughty`
  return `${siteTitle}${loc ? ` — ${loc}` : ''}`
}

function buildDescription(countryCode: string, city: string): string {
  const seoData = COUNTRY_SEO[countryCode] || COUNTRY_SEO.DEFAULT
  if (city) {
    return seoData.description.replace(
      /in [A-Z][a-z]+/g,
      `in ${city}`
    )
  }
  return seoData.description
}

export default function SEOHead() {
  const [location] = useLocation()
  const { user } = useAuth()
  const countryCode = user?.countryCode?.toUpperCase() || 'DEFAULT'
  const userCity = user?.city || ''
  const seoData = COUNTRY_SEO[countryCode] || COUNTRY_SEO.DEFAULT

  useEffect(() => {
    const title = buildTitle(location, countryCode, userCity)
    document.title = title

    const description = buildDescription(countryCode, userCity)
    const allKeywords = [
      ...seoData.keywords,
      ...seoData.ageGroups,
      ...(userCity ? [`adult dating in ${userCity}`, `singles in ${userCity}`, `mature singles ${userCity}`] : []),
    ].join(', ')

    upsertMeta('description', description)
    upsertMeta('keywords', allKeywords)
    upsertMeta('robots', 'index, follow')
    upsertMeta('author', 'NaughtyHaughty')
    upsertMeta('geo.region', countryCode !== 'DEFAULT' ? countryCode : '')
    if (userCity) upsertMeta('geo.placename', userCity)

    // Open Graph
    upsertMeta('og:title', title, true)
    upsertMeta('og:description', description, true)
    upsertMeta('og:type', 'website', true)
    upsertMeta('og:site_name', 'NaughtyHaughty', true)
    upsertMeta('og:image', '/og-image.jpg', true)
    if (userCity) upsertMeta('og:locale', countryCode !== 'DEFAULT' ? `en_${countryCode}` : 'en_US', true)

    // Twitter Card
    upsertMeta('twitter:card', 'summary_large_image')
    upsertMeta('twitter:title', title)
    upsertMeta('twitter:description', description)
    upsertMeta('twitter:image', '/og-image.jpg')

    // Canonical
    upsertLink('canonical', `https://naughtyhaughty.com${location}`)
  }, [location, countryCode, userCity, seoData])

  return null
}

export { COUNTRY_SEO, COUNTRY_NAMES, getCountryName }
