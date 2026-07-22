import { useState, useMemo } from 'react'
import { Link } from 'wouter'
import { Search, MapPin, ChevronRight } from 'lucide-react'
import { PLACES_LIST, CATEGORY_PREFIXES, CATEGORY_LABELS } from '../data/seoLandingPages'

function slugify(s: string) {
  return s.toLowerCase().replace(/['']/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

type GroupedCountry = { country: string; places: string[] }

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')


export default function LocationsPage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('sugar-daddy')

  const grouped = useMemo<GroupedCountry[]>(() => {
    const map = new Map<string, string[]>()
    for (const { city, country } of PLACES_LIST) {
      if (!map.has(country)) map.set(country, [])
      map.get(country)!.push(city)
    }
    return Array.from(map.entries())
      .map(([country, places]) => ({ country, places: places.sort() }))
      .sort((a, b) => a.country.replace(/^the /i, '').localeCompare(b.country.replace(/^the /i, '')))
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return grouped
    const q = query.toLowerCase()
    return grouped
      .map(g => ({ ...g, places: g.places.filter(p => p.toLowerCase().includes(q)) }))
      .filter(g => g.places.length > 0 || g.country.toLowerCase().includes(q))
  }, [grouped, query])

  const letterIndex = useMemo(() =>
    new Set(grouped.map(g => g.country.replace(/^the /i, '')[0].toUpperCase()))
  , [grouped])

  const totalPlaces = PLACES_LIST.length
  const totalPages = totalPlaces * CATEGORY_PREFIXES.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <MapPin className="text-brand-500" size={20} />
          <span className="text-brand-600 text-sm font-medium uppercase tracking-wider">Locations Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Find Wealthy Singles Near You
        </h1>
        <p className="text-gray-500 text-base max-w-xl mx-auto mb-2">
          Browse {totalPlaces.toLocaleString()} places across 60+ countries.
          Over <strong className="text-gray-800">{totalPages.toLocaleString()}+</strong> location pages covering every search term.
        </p>
        {/* Search */}
        <div className="relative max-w-md mx-auto mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search cities, towns, countries…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 pl-11 pr-5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:bg-white transition"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category filter */}
        <div className="mb-6">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Browse by category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_PREFIXES.map(prefix => (
              <button
                key={prefix}
                onClick={() => setActiveCategory(prefix)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                  activeCategory === prefix
                    ? 'border-brand-300 bg-brand-50 text-brand-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {CATEGORY_LABELS[prefix]}
              </button>
            ))}
          </div>
        </div>

        {/* A-Z index bar */}
        {!query && (
          <div className="flex flex-wrap gap-1 justify-center mb-8">
            {ALPHABET.map(letter => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition ${
                  letterIndex.has(letter)
                    ? 'bg-brand-100 hover:bg-brand-500 hover:text-white text-brand-700 cursor-pointer'
                    : 'text-gray-300 cursor-default'
                }`}
                onClick={e => { if (!letterIndex.has(letter)) e.preventDefault() }}
              >
                {letter}
              </a>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            <MapPin size={40} className="mx-auto mb-3 opacity-30" />
            <p>No locations found for "<span className="text-gray-600">{query}</span>"</p>
          </div>
        )}

        {/* Country groups */}
        {filtered.map(({ country, places }) => {
          const firstLetter = country.replace(/^the /i, '')[0].toUpperCase()
          return (
            <div key={country} id={`letter-${firstLetter}`} className="mb-10">
              <h2 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-600">
                  {firstLetter}
                </span>
                {country}
                <span className="text-gray-400 text-xs font-normal ml-1">({places.length} places)</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {places.map(place => {
                  const citySlug = slugify(place)
                  return (
                    <div key={place} className="group">
                      {/* Primary link for the active category */}
                      <Link
                        href={`/${activeCategory}-${citySlug}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-brand-50 border border-gray-200 hover:border-brand-300 transition text-sm text-gray-600 hover:text-brand-700"
                      >
                        <MapPin size={12} className="shrink-0 text-gray-400 group-hover:text-brand-500" />
                        <span className="truncate font-medium">{place}</span>
                      </Link>
                      {/* Quick-access chips for all categories */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {CATEGORY_PREFIXES.map(prefix => (
                          <Link
                            key={prefix}
                            href={`/${prefix}-${citySlug}`}
                            title={`${CATEGORY_LABELS[prefix]} in ${place}`}
                            className="text-[10px] px-1.5 py-0.5 rounded transition border border-gray-200 bg-gray-50 text-gray-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                          >
                            {CATEGORY_LABELS[prefix]}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Bottom CTA */}
        <div className="mt-12 gradient-brand rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Don't see your city?</h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            We're active in 180+ countries. Sign up free and find verified wealthy singles wherever you are.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-8 py-3 rounded-full hover:bg-gray-50 transition"
          >
            Join Free Today <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}
