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
    keywords: [
      'naughty dating USA', 'hookup site USA', 'adult hookup USA', 'NSA dating USA', 'casual sex USA',
      'older men younger women USA', 'mature men dating younger women USA', 'naughty women USA',
      'naughty girls USA', 'discreet dating USA', 'MILF dating USA', 'cougar dating USA',
      'older man younger woman USA', 'daddy dating USA', 'sugar daddy USA',
      'mature men hookup USA', 'no strings attached USA', 'adult dating site USA',
      'hookup in New York', 'naughty women New York', 'hookup in Los Angeles', 'hookup in Chicago',
      'hookup in Miami', 'hookup in Las Vegas', 'naughty girls near me USA', 'one night stand USA',
      'casual encounters USA', 'men over 50 dating USA', 'older men dating younger women USA',
      'rich men dating younger women USA', 'wealthy older men USA', 'discreet affairs USA',
      'free hookup site USA', 'best hookup app USA', 'adult singles USA',
    ],
    description: 'NaughtyHaughty USA — where older, wealthy men meet naughty younger women and bold adults find no-strings-attached fun. Verified hotties in New York, Los Angeles, Chicago, Miami & beyond. Join free.',
    ageGroups: ['men over 50 dating USA', 'mature men USA', 'older men younger women USA', 'daddy dating USA', 'silver fox dating USA'],
    cities: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Houston', 'Las Vegas', 'Phoenix', 'Atlanta', 'Dallas', 'Seattle'],
  },
  CA: {
    siteTitle: 'NaughtyHaughty Canada',
    keywords: [
      'naughty dating Canada', 'hookup site Canada', 'adult hookup Canada', 'NSA dating Canada', 'casual sex Canada',
      'older men younger women Canada', 'naughty women Canada', 'naughty girls Canada', 'discreet dating Canada',
      'MILF dating Canada', 'cougar dating Canada', 'daddy dating Canada', 'sugar daddy Canada',
      'mature men hookup Canada', 'no strings attached Canada', 'hookup in Toronto', 'hookup in Vancouver',
      'naughty girls Toronto', 'naughty girls Vancouver', 'naughty women Calgary', 'one night stand Canada',
      'casual encounters Canada', 'men over 50 dating Canada', 'rich men dating Canada',
      'adult dating site Canada', 'free hookup site Canada', 'discreet affairs Canada',
    ],
    description: 'NaughtyHaughty Canada — meet naughty girls and bold older men for NSA fun, casual hookups, and discreet dating in Toronto, Vancouver, Calgary, Montreal & more. Join free.',
    ageGroups: ['men over 50 Canada', 'mature men Canada', 'older men younger women Canada', 'daddy dating Canada', 'silver fox Canada'],
    cities: ['Toronto', 'Vancouver', 'Calgary', 'Montreal', 'Ottawa', 'Edmonton', 'Winnipeg'],
  },
  AU: {
    siteTitle: 'NaughtyHaughty Australia',
    keywords: [
      'naughty dating Australia', 'hookup site Australia', 'adult hookup Australia', 'NSA dating Australia',
      'casual sex Australia', 'older men younger women Australia', 'naughty women Australia',
      'naughty girls Australia', 'discreet dating Australia', 'MILF dating Australia', 'cougar dating Australia',
      'daddy dating Australia', 'sugar daddy Australia', 'hookup in Sydney', 'hookup in Melbourne',
      'naughty girls Sydney', 'naughty girls Melbourne', 'one night stand Australia',
      'casual encounters Australia', 'men over 50 dating Australia', 'rich men dating Australia',
      'adult dating site Australia', 'discreet affairs Australia', 'no strings attached Australia',
    ],
    description: 'NaughtyHaughty Australia — naughty hookups, NSA fun, and discreet encounters for older men and hot women in Sydney, Melbourne, Brisbane, Perth & across Australia. Join free.',
    ageGroups: ['men over 50 Australia', 'mature men Australia', 'older men younger women Australia', 'daddy dating Australia', 'silver fox Australia'],
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra'],
  },
  GB: {
    siteTitle: 'NaughtyHaughty UK',
    keywords: [
      'naughty dating UK', 'hookup site UK', 'adult hookup UK', 'NSA dating UK', 'casual sex UK',
      'older men younger women UK', 'naughty women UK', 'naughty girls UK', 'discreet dating UK',
      'MILF dating UK', 'cougar dating UK', 'daddy dating UK', 'sugar daddy UK', 'hookup in London',
      'hookup in Manchester', 'naughty girls London', 'naughty women London', 'one night stand UK',
      'casual encounters UK', 'men over 50 dating UK', 'rich men dating UK', 'wealthy older men UK',
      'adult dating site UK', 'discreet affairs UK', 'no strings attached UK', 'naughty dating site UK',
    ],
    description: 'NaughtyHaughty UK — older, wealthy British men meet naughty younger women for discreet hookups, NSA fun, and casual encounters in London, Manchester, Birmingham & beyond. Join free.',
    ageGroups: ['men over 50 UK', 'mature men UK', 'older men younger women UK', 'daddy dating UK', 'silver fox UK', 'distinguished men UK'],
    cities: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Leeds', 'Bristol', 'Glasgow', 'Cardiff'],
  },
  NZ: {
    siteTitle: 'NaughtyHaughty New Zealand',
    keywords: [
      'naughty dating New Zealand', 'hookup site NZ', 'NSA dating NZ', 'casual sex NZ',
      'older men younger women NZ', 'naughty women NZ', 'naughty girls NZ', 'discreet dating NZ',
      'MILF dating NZ', 'hookup in Auckland', 'naughty girls Auckland', 'one night stand NZ',
      'casual encounters NZ', 'men over 50 NZ', 'adult dating site NZ', 'sugar daddy NZ',
    ],
    description: 'NaughtyHaughty New Zealand — hookups, NSA fun, and naughty dating for bold adults in Auckland, Wellington, Christchurch & beyond. Join free.',
    ageGroups: ['men over 50 NZ', 'mature men New Zealand', 'older men younger women NZ', 'daddy dating NZ'],
    cities: ['Auckland', 'Wellington', 'Christchurch'],
  },
  IE: {
    siteTitle: 'NaughtyHaughty Ireland',
    keywords: [
      'naughty dating Ireland', 'hookup site Ireland', 'NSA dating Ireland', 'casual sex Ireland',
      'older men younger women Ireland', 'naughty women Ireland', 'naughty girls Ireland',
      'discreet dating Ireland', 'hookup Dublin', 'naughty girls Dublin', 'one night stand Ireland',
      'adult dating site Ireland', 'sugar daddy Ireland', 'men over 50 dating Ireland',
    ],
    description: 'NaughtyHaughty Ireland — meet naughty girls and older men for casual fun and discreet hookups in Dublin, Cork, Galway & beyond. Join free.',
    ageGroups: ['men over 50 Ireland', 'mature men Ireland', 'older men younger women Ireland', 'daddy dating Ireland'],
    cities: ['Dublin', 'Cork', 'Galway', 'Limerick'],
  },
  ZA: {
    siteTitle: 'NaughtyHaughty South Africa',
    keywords: [
      'naughty dating South Africa', 'hookup site South Africa', 'NSA dating South Africa',
      'older men younger women South Africa', 'naughty women South Africa', 'naughty girls South Africa',
      'blesser dating South Africa', 'sugar daddy South Africa', 'hookup Johannesburg',
      'naughty girls Cape Town', 'hookup Durban', 'discreet dating South Africa',
      'casual sex South Africa', 'adult dating South Africa', 'meet older men South Africa',
    ],
    description: 'NaughtyHaughty South Africa — meet naughty girls and wealthy older men for discreet hookups and NSA fun in Johannesburg, Cape Town, Durban & beyond. Join free.',
    ageGroups: ['blesser South Africa', 'older men South Africa', 'sugar daddy South Africa', 'mature men South Africa'],
    cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Sandton'],
  },
  AE: {
    siteTitle: 'NaughtyHaughty UAE',
    keywords: [
      'naughty dating Dubai', 'hookup Dubai', 'NSA dating Dubai', 'casual dating Dubai',
      'older men younger women Dubai', 'naughty girls Dubai', 'discreet dating Dubai',
      'sugar daddy Dubai', 'adult dating Dubai', 'hookup Abu Dhabi', 'naughty women UAE',
      'rich men Dubai', 'wealthy men Dubai', 'expat dating Dubai', 'fun dating Dubai',
    ],
    description: 'NaughtyHaughty UAE — where wealthy older men meet naughty girls for discreet hookups and fun dating in Dubai, Abu Dhabi & beyond. Join free.',
    ageGroups: ['sugar daddy Dubai', 'older men Dubai', 'wealthy men UAE', 'mature men Dubai'],
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah'],
  },
  DE: {
    siteTitle: 'NaughtyHaughty Germany',
    keywords: [
      'naughty dating Germany', 'hookup site Germany', 'NSA dating Germany', 'casual sex Germany',
      'older men younger women Germany', 'naughty girls Germany', 'discreet dating Germany',
      'hookup Berlin', 'naughty girls Berlin', 'adult dating Germany', 'sugar daddy Germany',
    ],
    description: 'NaughtyHaughty Germany — naughty hookups and discreet adult dating for older men and bold women in Berlin, Munich, Hamburg & beyond. Join free.',
    ageGroups: ['older men Germany', 'mature men Germany', 'daddy dating Germany'],
    cities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'],
  },
  DEFAULT: {
    siteTitle: 'NaughtyHaughty',
    keywords: [
      'naughty dating', 'hookup site', 'adult hookup', 'NSA dating', 'casual sex dating',
      'older men younger women', 'naughty girls dating', 'naughty women', 'discreet dating',
      'MILF dating', 'cougar dating', 'daddy dating site', 'sugar daddy dating',
      'mature men hookup', 'no strings attached dating', 'adult dating site free',
      'one night stand site', 'casual encounters', 'free hookup site', 'men over 50 dating',
      'older men dating younger women', 'rich men dating younger women', 'older gentleman dating',
      'adult personals', 'naughty singles near me', 'hookup near me', 'discreet adult dating',
      'naughty dating app', 'best hookup site', 'top hookup app', 'adult dating app',
    ],
    description: 'NaughtyHaughty — the #1 adult hookup site where wealthy older men meet naughty younger women and bold adults find real, discreet fun. Verified hotties worldwide. Join free.',
    ageGroups: ['men over 50 dating', 'older men younger women', 'daddy dating', 'silver daddy dating', 'mature men hookup'],
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

  if (path === '/')        return `${siteTitle} | #1 Adult Hookup & Naughty Dating${loc ? ` in ${loc}` : ''}`
  if (path === '/discover') return `Discover Naughty Hotties${loc ? ` in ${loc}` : ' Near You'} | NaughtyHaughty`
  if (path === '/meet')    return `Meet Naughty Singles${loc ? ` in ${loc}` : ''} | NaughtyHaughty`
  if (path === '/likes')   return `Likes & Matches${loc ? ` in ${loc}` : ''} | NaughtyHaughty`
  if (path === '/chat')    return `Messages | NaughtyHaughty`
  if (path.startsWith('/chat/')) return `Chat | NaughtyHaughty`
  if (path === '/visitors') return `Who Viewed Your Profile | NaughtyHaughty`
  if (path === '/gifts')   return `Send Naughty Gifts | NaughtyHaughty`
  if (path === '/login')   return `Sign In & Get Naughty${loc ? ` — ${loc}` : ''} | NaughtyHaughty`
  if (path === '/register') return `Join Free${loc ? ` — Meet Naughty Hotties in ${loc}` : ' — Meet Naughty Hotties'} | NaughtyHaughty`
  if (path === '/premium') return `VIP Access — More Hotties, More Fun | NaughtyHaughty`
  if (path === '/credits') return `Credits & Gifts | NaughtyHaughty`
  if (path === '/boost')   return `Boost Profile — Get More Matches | NaughtyHaughty`
  if (path === '/home')    return `Your Naughty Matches${loc ? ` in ${loc}` : ''} | NaughtyHaughty`
  if (path === '/settings') return `Settings | NaughtyHaughty`
  if (path === '/referrals') return `Invite Friends & Earn | NaughtyHaughty`
  if (path === '/contact') return `Contact Us | NaughtyHaughty`
  if (path === '/terms')   return `Terms of Service | NaughtyHaughty`
  if (path === '/privacy') return `Privacy Policy | NaughtyHaughty`
  if (path.startsWith('/profile/') || path.startsWith('/@')) return `Naughty Profile | NaughtyHaughty`
  return `${siteTitle}${loc ? ` — ${loc}` : ''} | Adult Hookup Dating`
}

function buildDescription(countryCode: string, city: string, path: string): string {
  const seoData = COUNTRY_SEO[countryCode] || COUNTRY_SEO.DEFAULT

  if (path === '/register') {
    const loc = city || (COUNTRY_SEO[countryCode]?.cities?.[0] ?? '')
    return `Join NaughtyHaughty free and meet verified naughty hotties${loc ? ` in ${loc}` : ''}. Older men, younger women, bold adults — no judgment, just real fun. Sign up in 30 seconds.`
  }
  if (path === '/login') {
    return `Sign back in to NaughtyHaughty and keep the fun going. Your naughty matches are waiting. 100% discreet.`
  }
  if (path === '/discover' || path === '/meet') {
    const loc = city || (COUNTRY_SEO[countryCode]?.cities?.[0] ?? '')
    return `Browse verified naughty hotties${loc ? ` in ${loc}` : ' near you'}. Older men, younger women, cougars, MILFs, and bold adults looking for real hookups. 100% free to join.`
  }

  if (city) {
    return `NaughtyHaughty ${city} — meet naughty girls and wealthy older men for real hookups, NSA fun, and discreet encounters in ${city}. Verified hotties only. Join free.`
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

    const description = buildDescription(countryCode, userCity, location)
    const allKeywords = [
      ...seoData.keywords,
      ...seoData.ageGroups,
      ...(userCity ? [
        `naughty girls in ${userCity}`,
        `hookup in ${userCity}`,
        `naughty dating ${userCity}`,
        `older men younger women ${userCity}`,
        `naughty women ${userCity}`,
        `discreet dating ${userCity}`,
        `casual sex ${userCity}`,
        `NSA dating ${userCity}`,
        `adult dating ${userCity}`,
        `sugar daddy ${userCity}`,
        `mature men ${userCity}`,
      ] : []),
    ].join(', ')

    upsertMeta('description', description)
    upsertMeta('keywords', allKeywords)
    upsertMeta('robots', 'index, follow')
    upsertMeta('author', 'NaughtyHaughty')
    upsertMeta('rating', 'adult')
    upsertMeta('geo.region', countryCode !== 'DEFAULT' ? countryCode : '')
    if (userCity) upsertMeta('geo.placename', userCity)

    // Open Graph
    upsertMeta('og:title', title, true)
    upsertMeta('og:description', description, true)
    upsertMeta('og:type', 'website', true)
    upsertMeta('og:site_name', 'NaughtyHaughty', true)
    upsertMeta('og:image', '/og-image.jpg', true)
    if (countryCode !== 'DEFAULT') upsertMeta('og:locale', `en_${countryCode}`, true)

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
