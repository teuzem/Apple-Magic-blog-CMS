/**
 * Scoped bilingual showcase seed for the advanced article editor.
 * Creates or updates one post and related tags, without replacing other data.
 */
import fs from 'node:fs'
import { createClient } from '@sanity/client'

const env = fs.readFileSync('.env.local', 'utf8')
const get = (name) =>
  env.match(new RegExp(`^${name}=(.*)$`, 'm'))?.[1]?.replace(/^"|"$/g, '') || ''

const client = createClient({
  projectId: get('NEXT_PUBLIC_SANITY_PROJECT_ID'),
  dataset: get('NEXT_PUBLIC_SANITY_DATASET') || 'production',
  apiVersion: get('NEXT_PUBLIC_SANITY_API_VERSION') || '2026-09-05',
  token: get('SANITY_API_WRITE_TOKEN'),
  useCdn: false,
})

if (!client.config().projectId || !get('SANITY_API_WRITE_TOKEN')) {
  throw new Error(
    'Sanity project ID and write token are required in .env.local.',
  )
}

const key = (prefix) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`
const cloneWithFreshKeys = (value) => {
  if (Array.isArray(value)) return value.map(cloneWithFreshKeys)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.entries(value).map(([name, entry]) => [
      name,
      name === '_key' ? key(value._type || 'item') : cloneWithFreshKeys(entry),
    ]),
  )
}
const span = (text, marks = []) => ({
  _type: 'span',
  _key: key('span'),
  text,
  marks,
})
const textBlock = (text, style = 'normal') => ({
  _type: 'block',
  _key: key('block'),
  style,
  markDefs: [],
  children: [span(text)],
})
const listBlock = (text, level = 1) => ({
  ...textBlock(text),
  listItem: 'bullet',
  level,
})
const linkedBlock = (before, label, href, after = '') => {
  const markKey = key('link')
  return {
    _type: 'block',
    _key: key('block'),
    style: 'normal',
    markDefs: [
      {
        _type: 'link',
        _key: markKey,
        href,
        openInNewTab: true,
      },
    ],
    children: [span(before), span(label, [markKey]), span(after)],
  }
}

const sources = [
  {
    title: "What's new in the Foundation Models framework",
    url: 'https://developer.apple.com/videos/play/wwdc2026/241/',
  },
  {
    title: 'Foundation Models framework documentation',
    url: 'https://developer.apple.com/documentation/foundationmodels',
  },
  {
    title: 'App Intents documentation',
    url: 'https://developer.apple.com/documentation/appintents',
  },
  {
    title: 'Meet Swift Testing',
    url: 'https://developer.apple.com/videos/play/wwdc2024/10179/',
  },
  {
    title: 'Generating content and performing tasks with Foundation Models',
    url: 'https://developer.apple.com/documentation/foundationmodels/generating-content-and-performing-tasks-with-foundation-models',
  },
  {
    title: 'Creating your first app intent',
    url: 'https://developer.apple.com/documentation/appintents/creating-your-first-app-intent',
  },
  {
    title: 'Swift Testing documentation',
    url: 'https://developer.apple.com/documentation/testing',
  },
  {
    title: 'Bring an LLM provider to the Foundation Models framework',
    url: 'https://developer.apple.com/videos/play/wwdc2026/339/',
  },
]

const iphoneSources = [
  {
    title: 'Apple Events',
    url: 'https://www.apple.com/apple-events/',
  },
  {
    title: 'iPhone',
    url: 'https://www.apple.com/iphone/',
  },
  {
    title: 'iPhone Newsroom archive',
    url: 'https://www.apple.com/newsroom/topics/iphone/',
  },
  {
    title: 'Apple newsroom',
    url: 'https://www.apple.com/newsroom/',
  },
  {
    title: 'iOS',
    url: 'https://www.apple.com/ios/',
  },
]

async function uploadRemoteImage(url, label) {
  const response = await fetch(url)
  if (!response.ok)
    throw new Error(`Could not download ${label}: ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  return client.assets.upload('image', buffer, {
    filename: `${label}.jpg`,
    contentType: response.headers.get('content-type') || 'image/jpeg',
    title: label,
    source: {
      name: 'Apple Developer',
      id: label,
      url,
    },
  })
}

async function getStockVideo() {
  const pexelsKey = get('PEXELS_API_KEY')
  if (pexelsKey) {
    const response = await fetch(
      'https://api.pexels.com/videos/search?query=swift%20developer%20coding&page=1&per_page=8',
      { headers: { Authorization: pexelsKey } },
    )
    if (response.ok) {
      const data = await response.json()
      const item = data.videos?.[0]
      const file = item?.video_files
        ?.filter((entry) => entry.link && (entry.width || 0) >= 480)
        .sort(
          (a, b) =>
            Math.abs((a.width || 0) - 640) - Math.abs((b.width || 0) - 640),
        )[0]
      if (item && file)
        return {
          _type: 'stockVideo',
          _key: key('video'),
          url: file.link,
          posterUrl: item.image,
          caption:
            'A practical development workflow: prototype, test, measure, and iterate.',
          captionFr:
            'Un flux de développement pratique : prototyper, tester, mesurer et itérer.',
          alt: 'Developer working on an application',
          provider: 'Pexels',
          creator: item.user?.name,
          sourceId: String(item.id),
          sourceUrl: item.url,
          width: file.width,
          height: file.height,
          duration: item.duration,
          searchQuery: 'swift developer coding',
        }
    }
  }
  return null
}

async function uploadRemoteVideo(video) {
  if (!video?.url) return null
  const response = await fetch(video.url)
  if (!response.ok) return null
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.byteLength >= 48 * 1024 * 1024) return null
  return client.assets.upload('file', buffer, {
    filename: `swift-developer-workflow-${video.sourceId || 'pexels'}.mp4`,
    contentType: response.headers.get('content-type') || 'video/mp4',
    title: 'Swift developer workflow',
    source: {
      name: video.provider || 'Pexels',
      id: video.sourceId || 'swift-developer-workflow',
      url: video.sourceUrl || video.url,
    },
  })
}

const taxonomy = [
  ['tag-swift-development', 'Swift development', 'swift-development'],
  ['tag-foundation-models', 'Foundation Models', 'foundation-models'],
  ['tag-app-intents', 'App Intents', 'app-intents'],
  ['tag-swiftui', 'SwiftUI', 'swiftui'],
  ['tag-swift-testing', 'Swift Testing', 'swift-testing'],
]

for (const [id, title, slug] of taxonomy) {
  await client.createIfNotExists({
    _id: id,
    _type: 'tag',
    title,
    slug: { _type: 'slug', current: slug },
    type: 'topic',
  })
}

const refs = await client.fetch(`{
  "category": *[_type == "category" && slug.current == "software"][0]._id,
  "newsCategory": *[_type == "category" && slug.current == "news"][0]._id,
  "iphoneCategory": *[_type == "category" && slug.current == "iphone"][0]._id,
  "author": *[_type == "author"] | order(_createdAt asc)[0]._id,
  "product": *[_type == "product" && slug.current match "macbook-air*"][0]._id,
  "iphoneProduct": *[_type == "product" && slug.current match "iphone-17*"][0]._id,
  "iphoneTags": *[_type == "tag" && slug.current in ["iphone", "camera", "battery", "apple-intelligence", "buying-guide", "central-africa", "privacy"]]._id
}`)
if (!refs.category || !refs.author)
  throw new Error('The Software category and at least one author are required.')

const [coverAsset, testingAsset, stockVideo] = await Promise.all([
  uploadRemoteImage(
    'https://img.youtube.com/vi/Xrv8m_EHCbg/maxresdefault.jpg',
    'apple-foundation-models-wwdc26',
  ),
  uploadRemoteImage(
    'https://img.youtube.com/vi/zf10Onuyegs/maxresdefault.jpg',
    'apple-foundation-models-framework',
  ),
  getStockVideo(),
])
const uploadedVideoAsset = await uploadRemoteVideo(stockVideo)

const coverImage = {
  _type: 'image',
  asset: { _type: 'reference', _ref: coverAsset._id },
  alt: 'Apple Developer Foundation Models framework session',
  caption:
    'Official Apple Developer session: Foundation Models framework at WWDC26.',
}
const inlineImage = {
  _type: 'image',
  _key: key('image'),
  asset: { _type: 'reference', _ref: testingAsset._id },
  alt: 'Apple Developer Foundation Models framework',
  caption:
    'Start with a narrow, measurable feature before expanding the model workflow.',
  layout: 'wide',
}
const inlineImageFr = {
  ...inlineImage,
  _key: key('image'),
  caption:
    "Commencez par une fonctionnalité limitée et mesurable avant d'étendre le flux du modèle.",
}

const swiftCode = `import FoundationModels
import Observation

@MainActor
@Observable
final class ReleaseNotesModel {
    private let session = LanguageModelSession()
    var summary = ""

    func summarize(_ notes: String) async throws {
        let response = try await session.respond(
            to: "Summarize these release notes for an iOS developer: \\(notes)"
        )
        summary = response.content
    }
}`

const testCode = `import Testing
@testable import DeveloperAssistant

@Test("Generated summaries keep the essential migration warning")
func summaryContainsMigrationWarning() async throws {
    let result = try await fixtureSummary()
    #expect(result.localizedCaseInsensitiveContains("migration"))
}`

const availabilityCode = `import FoundationModels

enum AssistantAvailability {
    case ready
    case unavailable(reason: String)
}

func assistantAvailability() -> AssistantAvailability {
    let model = SystemLanguageModel.default

    switch model.availability {
    case .available:
        return .ready
    case .unavailable(let reason):
        return .unavailable(reason: String(describing: reason))
    }
}`

const appIntentCode = `import AppIntents

struct SummarizeReleaseNotesIntent: AppIntent {
    static let title: LocalizedStringResource = "Summarize Release Notes"
    static let description = IntentDescription(
        "Creates a concise draft while preserving migration warnings."
    )

    @Parameter(title: "Release notes")
    var notes: String

    func perform() async throws -> some IntentResult & ReturnsValue<String> {
        let summary = try await ReleaseNotesService.shared.summarize(notes)
        return .result(value: summary)
    }
}`

const evaluationCode = `struct EvaluationCase: Codable {
    let id: String
    let input: String
    let requiredFacts: [String]
    let prohibitedClaims: [String]
}

func score(_ output: String, against test: EvaluationCase) -> Double {
    let required = test.requiredFacts.filter(output.localizedCaseInsensitiveContains)
    let violations = test.prohibitedClaims.filter(output.localizedCaseInsensitiveContains)
    let recall = Double(required.count) / Double(max(test.requiredFacts.count, 1))
    return max(0, recall - Double(violations.count) * 0.25)
}`

const englishAdvancedContent = [
  textBlock('5. Treat availability as a product state', 'h2'),
  textBlock(
    'A model-powered feature should never be represented by a single enabled or disabled flag. Build an explicit state machine for supported, temporarily unavailable, restricted, downloading, failed, and fallback modes. That state belongs in the view model so SwiftUI can explain what is happening instead of presenting a spinner that never resolves.',
  ),
  {
    _type: 'code',
    _key: key('code'),
    language: 'swift',
    filename: 'AssistantAvailability.swift',
    code: availabilityCode,
    caption: 'Convert framework availability into a user-facing product state.',
    captionFr:
      'Transformer la disponibilité du framework en état produit compréhensible.',
    showLineNumbers: true,
    wrapLines: false,
    highlightLines: '7-17',
  },
  listBlock(
    'Show the reason when a capability is unavailable, using plain language.',
  ),
  listBlock(
    'Keep core navigation, saved data, and manual workflows usable without the model.',
  ),
  listBlock(
    'Recheck availability when the app becomes active or relevant settings change.',
  ),
  listBlock(
    'Log aggregate availability states without collecting prompt or private user content.',
  ),
  {
    _type: 'callout',
    _key: key('callout'),
    icon: 'warning',
    heading: 'Do not make AI a single point of failure',
    text: 'If a user cannot finish the task when the model is unavailable, the feature is not progressively enhanced. Preserve a deterministic editor, search flow, or form as the primary fallback.',
  },
  textBlock('6. Prefer structured generation over fragile text parsing', 'h2'),
  linkedBlock(
    'Free-form text is useful for drafts, but product logic should consume constrained values whenever possible. Apple documents generation and task workflows in ',
    'its Foundation Models guide',
    sources[4].url,
    '. Define a small output contract, validate every field, and reject values that do not satisfy business rules.',
  ),
  textBlock(
    'For a release-note assistant, a useful contract might contain a short summary, affected platforms, migration urgency, required actions, and source citations. The UI can then render predictable sections, localize labels independently, and prevent generated prose from controlling navigation or permissions.',
  ),
  {
    _type: 'comparisonTable',
    _key: key('table'),
    caption: 'Choosing the right output shape',
    columns: ['Use case', 'Recommended output', 'Validation'],
    rows: [
      {
        _key: key('row'),
        label: 'Editorial draft',
        values: [
          'Constrained prose with citations',
          'Length, source coverage, prohibited claims',
        ],
      },
      {
        _key: key('row'),
        label: 'UI fields',
        values: [
          'Typed structured output',
          'Schema, ranges, enums, required fields',
        ],
      },
      {
        _key: key('row'),
        label: 'Search suggestions',
        values: [
          'Short ranked list',
          'Deduplication, relevance, safe destinations',
        ],
      },
      {
        _key: key('row'),
        label: 'Destructive action',
        values: [
          'Never execute directly',
          'Preview plus explicit user confirmation',
        ],
      },
    ],
  },
  textBlock('7. Put strict trust boundaries around tools', 'h2'),
  textBlock(
    'Tool calling can connect the model to calendars, local databases, network services, or app actions. Treat model-proposed arguments as untrusted input. Validate types and ranges, enforce authorization outside the model, rate-limit expensive operations, and require confirmation for purchases, deletion, publishing, messaging, or account changes.',
  ),
  listBlock('Expose the minimum tool surface needed for the current task.'),
  listBlock(
    'Return compact, typed tool results rather than entire private records.',
  ),
  listBlock(
    'Separate read-only tools from tools that mutate data or contact other people.',
  ),
  listBlock(
    'Record the tool name, result category, latency, and error class for debugging.',
  ),
  listBlock(
    'Never place API keys, authentication tokens, or hidden policy text in prompts.',
  ),
  textBlock('8. Make App Intents useful outside the app', 'h2'),
  linkedBlock(
    'App Intents can make a focused capability available to supported system experiences. Follow ',
    "Apple's first App Intent guidance",
    sources[5].url,
    ', provide localized titles and descriptions, keep parameters understandable, and return a result that remains useful when the full app interface is not visible.',
  ),
  {
    _type: 'code',
    _key: key('code'),
    language: 'swift',
    filename: 'SummarizeReleaseNotesIntent.swift',
    code: appIntentCode,
    caption:
      'A small App Intent that delegates business logic to a testable service.',
    captionFr:
      'Un App Intent minimal qui délègue la logique métier à un service testable.',
    showLineNumbers: true,
    wrapLines: true,
    highlightLines: '3-8,13-16',
  },
  textBlock(
    'The intent should not duplicate model orchestration. Keep prompting, validation, persistence, and telemetry in an application service that can also be called from SwiftUI and tests. This prevents different entry points from producing contradictory behavior.',
  ),
  textBlock('9. Build an evaluation dataset before tuning prompts', 'h2'),
  textBlock(
    'A useful evaluation set represents the real distribution of inputs, including short notes, long notes, mixed languages, missing context, malformed text, sensitive data, and adversarial instructions. Store expected facts and unacceptable claims rather than one exact reference paragraph.',
  ),
  {
    _type: 'code',
    _key: key('code'),
    language: 'swift',
    filename: 'EvaluationCase.swift',
    code: evaluationCode,
    caption:
      'A deterministic scoring layer for required facts and prohibited claims.',
    captionFr:
      'Une couche de notation déterministe pour les faits requis et les affirmations interdites.',
    showLineNumbers: true,
    wrapLines: true,
    highlightLines: '1-6,8-13',
  },
  {
    _type: 'latex',
    _key: key('latex'),
    formula: String.raw`S = 0.40F + 0.20C + 0.15U + 0.15A + 0.10E`,
    displayMode: true,
    alt: 'Release score combines factuality, constraint compliance, usefulness, accessibility, and efficiency',
    caption:
      'Example release score: factuality, constraint compliance, usefulness, accessibility, and efficiency.',
    captionFr:
      'Exemple de score de publication : factualité, respect des contraintes, utilité, accessibilité et efficacité.',
  },
  listBlock('Keep a frozen regression set for every released version.'),
  listBlock(
    'Add failed real-world cases only after removing personal or confidential data.',
  ),
  listBlock(
    'Compare the AI path with the manual fallback, not only with an earlier prompt.',
  ),
  listBlock(
    'Track median, tail latency, cancellation rate, and fallback completion rate.',
  ),
  textBlock('10. Design privacy and security into the data flow', 'h2'),
  textBlock(
    'Draw the complete data path before implementation: user input, app memory, local storage, model session, tools, analytics, crash reports, server calls, and deletion. Classify every field and decide which data must never leave the device. A privacy claim is credible only when the architecture and logging configuration enforce it.',
  ),
  {
    _type: 'comparisonTable',
    _key: key('table'),
    caption: 'Privacy review by data class',
    columns: ['Data class', 'Default treatment', 'Required control'],
    rows: [
      {
        _key: key('row'),
        label: 'Public documentation',
        values: [
          'May be processed for the feature',
          'Keep source and version metadata',
        ],
      },
      {
        _key: key('row'),
        label: 'Account data',
        values: [
          'Minimize and isolate',
          'Purpose limitation and access control',
        ],
      },
      {
        _key: key('row'),
        label: 'Secrets and credentials',
        values: [
          'Never include in prompts',
          'Keychain or server-side secret storage',
        ],
      },
      {
        _key: key('row'),
        label: 'Telemetry',
        values: [
          'Aggregate by default',
          'Consent, retention limit, deletion process',
        ],
      },
    ],
  },
  textBlock('11. Build accessibility into every generated state', 'h2'),
  textBlock(
    'Generated content must remain readable with Dynamic Type, VoiceOver, increased contrast, reduced motion, keyboard navigation, and switch control. Announce meaningful state changes, keep focus stable when results arrive, and identify generated drafts as drafts. Never encode confidence using color alone.',
  ),
  listBlock(
    'Use semantic headings and concise accessibility labels for generated sections.',
  ),
  listBlock('Let users pause media, animation, and automatic updates.'),
  listBlock(
    'Provide text alternatives and transcripts for images, audio, and video.',
  ),
  listBlock(
    'Test the longest French and English strings at accessibility text sizes.',
  ),
  listBlock(
    'Preserve selection and focus when a result is regenerated or rejected.',
  ),
  textBlock('12. Localize behavior, not only interface strings', 'h2'),
  textBlock(
    'English and French versions need separate evaluation cases because names, dates, units, punctuation, terminology, and acceptable summaries differ. Keep the user language explicit in the request, use localized App Intent resources, and never silently translate private content through an undisclosed service.',
  ),
  {
    _type: 'gallery',
    _key: key('gallery'),
    caption:
      'Official Apple Developer learning material used to validate the implementation path.',
    images: [
      {
        _type: 'image',
        _key: key('gallery-image'),
        asset: { _type: 'reference', _ref: coverAsset._id },
        alt: 'Apple Developer session introducing Foundation Models capabilities',
      },
      {
        _type: 'image',
        _key: key('gallery-image'),
        asset: { _type: 'reference', _ref: testingAsset._id },
        alt: 'Apple Developer technical session about building with Foundation Models',
      },
    ],
  },
  textBlock('13. Set a performance and energy budget', 'h2'),
  textBlock(
    'Measure cold start, time to first meaningful token, total completion time, memory pressure, cancellation, and battery impact on the oldest supported device. Debounce repeated requests, cancel work when the view disappears, cache only content that is safe to retain, and stream results only when progressive rendering improves comprehension.',
  ),
  {
    _type: 'callout',
    _key: key('callout'),
    icon: 'tip',
    heading: 'Measure the slow path',
    text: 'Median latency can hide the experience of users on older hardware or constrained networks. Define a tail-latency threshold and switch to a useful fallback before the interface feels stuck.',
  },
  textBlock('14. Observe failures without recording private prompts', 'h2'),
  textBlock(
    'Operational dashboards should answer whether the capability was available, which version ran, whether validation passed, whether the user accepted the result, and whether the fallback completed. Use redacted error categories and synthetic test identifiers instead of raw prompts or generated responses.',
  ),
  listBlock(
    'Availability rate by operating system, device class, language, and region.',
  ),
  listBlock('Validation failure and retry rate by feature version.'),
  listBlock('P50, P95, and P99 latency plus user cancellation rate.'),
  listBlock('Fallback completion rate and user-reported correction rate.'),
  listBlock('Crash-free sessions and memory warnings around model operations.'),
  ...(uploadedVideoAsset
    ? [
        {
          _type: 'mediaFile',
          _key: key('media'),
          kind: 'video',
          media: {
            _type: 'file',
            asset: { _type: 'reference', _ref: uploadedVideoAsset._id },
          },
          poster: {
            _type: 'image',
            asset: { _type: 'reference', _ref: testingAsset._id },
            alt: 'Developer workflow video poster',
          },
          title: 'A measured development loop',
          titleFr: 'Une boucle de développement mesurée',
          caption:
            'Prototype one outcome, run repeatable tests, inspect failures, and improve the product contract.',
          captionFr:
            'Prototyper un résultat, exécuter des tests reproductibles, analyser les échecs et améliorer le contrat produit.',
          transcript:
            'Supporting visual: a developer workflow representing implementation, testing, measurement, and iteration. No spoken instruction is required to understand this media.',
          transcriptFr:
            'Visuel complémentaire : un flux de développement représentant implémentation, tests, mesure et itération. Aucune instruction orale n’est nécessaire pour comprendre ce média.',
          autoplay: false,
          loop: false,
        },
      ]
    : []),
  textBlock('15. Release checklist for a production team', 'h2'),
  {
    _type: 'htmlContent',
    _key: key('html'),
    html: `<section><h3>Before TestFlight</h3><ol><li>Verify runtime availability on every supported device family.</li><li>Run the frozen evaluation set in English and French.</li><li>Test offline, cancellation, backgrounding and low-memory states.</li><li>Review tool permissions and destructive-action confirmations.</li><li>Audit analytics, retention and deletion behavior.</li><li>Complete VoiceOver, Dynamic Type and reduced-motion checks.</li><li>Confirm source links against the current SDK documentation.</li></ol><p><strong>Editorial rule:</strong> update this guide when Apple changes API names, availability or platform requirements.</p></section>`,
  },
  {
    _type: 'faq',
    _key: key('faq'),
    title: 'Frequently asked questions',
    titleFr: 'Questions fréquentes',
    items: [
      {
        _key: key('faq-item'),
        question: 'Can every supported iPhone run Foundation Models features?',
        answer:
          'No. Availability depends on the operating system, compatible hardware, language, region, Apple Intelligence state, and the specific model or capability. Check availability at runtime and provide a complete fallback.',
        questionFr:
          'Tous les iPhone pris en charge peuvent-ils exécuter Foundation Models ?',
        answerFr:
          'Non. La disponibilité dépend du système, du matériel compatible, de la langue, de la région, de l’état d’Apple Intelligence et de la capacité utilisée. Vérifiez-la à l’exécution et fournissez une solution complète.',
      },
      {
        _key: key('faq-item'),
        question: 'Should generated text be stored automatically?',
        answer:
          'Usually not before validation and user review. Store only what the product requires, explain retention, protect sensitive fields, and give users a way to edit or delete saved results.',
        questionFr: 'Faut-il enregistrer automatiquement le texte généré ?',
        answerFr:
          'Généralement pas avant validation et contrôle utilisateur. Conservez uniquement les données nécessaires, expliquez la durée de conservation et permettez la modification ou la suppression.',
      },
      {
        _key: key('faq-item'),
        question: 'How should a team test nondeterministic output?',
        answer:
          'Test required facts, forbidden claims, schema validity, safety rules, latency, and fallback behavior across a representative dataset. Avoid comparing every response with one exact sentence.',
        questionFr: 'Comment tester une sortie non déterministe ?',
        answerFr:
          'Testez les faits requis, les affirmations interdites, la validité du schéma, les règles de sécurité, la latence et la solution de repli sur un jeu de données représentatif.',
      },
      {
        _key: key('faq-item'),
        question: 'When should an App Intent require confirmation?',
        answer:
          'Require explicit confirmation before destructive, financial, privacy-sensitive, publishing, messaging, or account-changing actions. Authorization and validation must live outside the model.',
        questionFr: 'Quand un App Intent doit-il demander confirmation ?',
        answerFr:
          'Demandez une confirmation explicite avant toute action destructive, financière, sensible, éditoriale, de messagerie ou de modification de compte. L’autorisation reste extérieure au modèle.',
      },
    ],
  },
  textBlock('Official learning resources', 'h2'),
  linkedBlock(
    'Start with the ',
    'Foundation Models documentation',
    sources[1].url,
    '.',
  ),
  linkedBlock(
    'Review ',
    'App Intents documentation',
    sources[2].url,
    ' for system integration.',
  ),
  linkedBlock(
    'Use ',
    'Swift Testing documentation',
    sources[6].url,
    ' to build repeatable suites.',
  ),
  linkedBlock(
    'When an application requires another model provider, review ',
    "Apple's provider integration session",
    sources[7].url,
    ' and disclose the resulting data path clearly.',
  ),
]

const frenchAdvancedContent = [
  textBlock('5. Traiter la disponibilité comme un état produit', 'h2'),
  textBlock(
    'Une fonctionnalité fondée sur un modèle ne doit pas se résumer à un indicateur activé ou désactivé. Construisez une machine à états explicite pour les modes disponible, temporairement indisponible, restreint, en téléchargement, en échec et solution de repli. SwiftUI peut ainsi expliquer la situation au lieu d’afficher une attente sans fin.',
  ),
  cloneWithFreshKeys(
    englishAdvancedContent.find(
      (item) => item.filename === 'AssistantAvailability.swift',
    ),
  ),
  listBlock(
    'Afficher la raison de l’indisponibilité avec des termes compréhensibles.',
  ),
  listBlock(
    'Conserver la navigation, les données et le flux manuel utilisables sans le modèle.',
  ),
  listBlock(
    'Revérifier la disponibilité lorsque l’application redevient active.',
  ),
  listBlock(
    'Mesurer les états agrégés sans collecter les requêtes ou contenus privés.',
  ),
  {
    _type: 'callout',
    _key: key('callout'),
    icon: 'warning',
    heading: 'Ne pas faire de l’IA un point de défaillance unique',
    text: 'Si l’utilisateur ne peut plus terminer sa tâche lorsque le modèle est indisponible, la fonctionnalité n’est pas une amélioration progressive. Maintenez un éditeur, une recherche ou un formulaire déterministe.',
  },
  textBlock('6. Préférer les sorties structurées au parsing fragile', 'h2'),
  linkedBlock(
    'Le texte libre convient aux brouillons, mais la logique produit doit consommer des valeurs contraintes dès que possible. Apple documente ces flux dans ',
    'son guide Foundation Models',
    sources[4].url,
    '. Définissez un contrat réduit, validez chaque champ et rejetez les valeurs contraires aux règles métier.',
  ),
  textBlock(
    'Pour un assistant de notes de version, le contrat peut contenir un résumé, les plateformes concernées, l’urgence de migration, les actions requises et les sources. L’interface affiche alors des sections prévisibles et localise les libellés indépendamment de la génération.',
  ),
  {
    _type: 'comparisonTable',
    _key: key('table'),
    caption: 'Choisir la bonne forme de sortie',
    columns: ['Cas d’usage', 'Sortie recommandée', 'Validation'],
    rows: [
      {
        _key: key('row'),
        label: 'Brouillon éditorial',
        values: [
          'Texte contraint avec sources',
          'Longueur, couverture, affirmations interdites',
        ],
      },
      {
        _key: key('row'),
        label: 'Champs d’interface',
        values: [
          'Sortie structurée typée',
          'Schéma, plages, énumérations, champs requis',
        ],
      },
      {
        _key: key('row'),
        label: 'Suggestions',
        values: [
          'Liste courte et classée',
          'Déduplication, pertinence, destinations sûres',
        ],
      },
      {
        _key: key('row'),
        label: 'Action destructive',
        values: [
          'Jamais exécutée directement',
          'Aperçu puis confirmation explicite',
        ],
      },
    ],
  },
  textBlock('7. Encadrer strictement les outils', 'h2'),
  textBlock(
    'Les outils peuvent relier le modèle au calendrier, à une base locale, au réseau ou à des actions de l’application. Considérez les arguments proposés comme des entrées non fiables. Validez types et plages, appliquez les autorisations hors du modèle et exigez une confirmation pour les achats, suppressions, publications, messages ou changements de compte.',
  ),
  listBlock('Exposer uniquement les outils nécessaires à la tâche en cours.'),
  listBlock(
    'Retourner des résultats courts et typés plutôt que des dossiers privés complets.',
  ),
  listBlock(
    'Séparer les outils en lecture seule de ceux qui modifient des données.',
  ),
  listBlock(
    'Journaliser le nom de l’outil, la latence et la catégorie d’erreur.',
  ),
  listBlock(
    'Ne jamais placer de clé API, jeton ou politique interne dans une requête.',
  ),
  textBlock('8. Rendre App Intents utile en dehors de l’application', 'h2'),
  linkedBlock(
    'App Intents peut exposer une capacité ciblée aux expériences système compatibles. Suivez ',
    'le guide de création d’un premier App Intent',
    sources[5].url,
    ', localisez titres et descriptions, simplifiez les paramètres et retournez un résultat utile même sans l’interface complète.',
  ),
  cloneWithFreshKeys(
    englishAdvancedContent.find(
      (item) => item.filename === 'SummarizeReleaseNotesIntent.swift',
    ),
  ),
  textBlock(
    'L’intent ne doit pas dupliquer l’orchestration du modèle. Placez requêtes, validation, persistance et télémétrie dans un service réutilisable par SwiftUI, App Intents et les tests afin d’éviter des comportements contradictoires.',
  ),
  textBlock(
    '9. Construire un jeu d’évaluation avant d’ajuster les requêtes',
    'h2',
  ),
  textBlock(
    'Le jeu d’évaluation doit représenter les entrées réelles : textes courts ou longs, langues mélangées, contexte manquant, données sensibles et instructions adverses. Enregistrez les faits attendus et les affirmations inacceptables plutôt qu’un paragraphe de référence unique.',
  ),
  cloneWithFreshKeys(
    englishAdvancedContent.find(
      (item) => item.filename === 'EvaluationCase.swift',
    ),
  ),
  cloneWithFreshKeys(
    englishAdvancedContent.find(
      (item) =>
        item._type === 'latex' && String(item.formula).startsWith('S ='),
    ),
  ),
  listBlock('Conserver un jeu de régression figé pour chaque version publiée.'),
  listBlock(
    'Ajouter les échecs réels après suppression des données personnelles.',
  ),
  listBlock(
    'Comparer la voie IA à la solution manuelle, pas seulement à l’ancienne requête.',
  ),
  listBlock(
    'Mesurer la latence médiane et extrême, les annulations et la réussite du repli.',
  ),
  textBlock(
    '10. Intégrer confidentialité et sécurité dans le flux de données',
    'h2',
  ),
  textBlock(
    'Dessinez le trajet complet des données : saisie, mémoire, stockage local, session du modèle, outils, analytics, rapports de panne, serveur et suppression. Classez chaque champ et décidez ce qui ne doit jamais quitter l’appareil. Une promesse de confidentialité n’est crédible que si l’architecture et les journaux l’imposent.',
  ),
  {
    _type: 'comparisonTable',
    _key: key('table'),
    caption: 'Revue de confidentialité par catégorie',
    columns: ['Catégorie', 'Traitement par défaut', 'Contrôle requis'],
    rows: [
      {
        _key: key('row'),
        label: 'Documentation publique',
        values: ['Traitement possible', 'Conserver source et version'],
      },
      {
        _key: key('row'),
        label: 'Données de compte',
        values: ['Minimiser et isoler', 'Finalité et contrôle d’accès'],
      },
      {
        _key: key('row'),
        label: 'Secrets et identifiants',
        values: ['Jamais dans une requête', 'Trousseau ou stockage serveur'],
      },
      {
        _key: key('row'),
        label: 'Télémétrie',
        values: ['Agrégée par défaut', 'Consentement, durée, suppression'],
      },
    ],
  },
  textBlock('11. Intégrer l’accessibilité à chaque état généré', 'h2'),
  textBlock(
    'Le contenu généré doit rester utilisable avec Dynamic Type, VoiceOver, contraste renforcé, réduction des animations, clavier et contrôle de sélection. Annoncez les changements utiles, stabilisez le focus à l’arrivée du résultat et identifiez clairement un brouillon généré.',
  ),
  listBlock(
    'Employer des titres sémantiques et des libellés d’accessibilité concis.',
  ),
  listBlock(
    'Permettre la pause des médias, animations et mises à jour automatiques.',
  ),
  listBlock(
    'Fournir alternatives textuelles et transcriptions pour chaque média.',
  ),
  listBlock(
    'Tester les chaînes françaises et anglaises aux tailles d’accessibilité.',
  ),
  listBlock('Conserver la sélection et le focus après régénération ou rejet.'),
  textBlock('12. Localiser le comportement, pas seulement les libellés', 'h2'),
  textBlock(
    'Les versions française et anglaise exigent des cas d’évaluation distincts : noms, dates, unités, ponctuation, terminologie et résumé acceptable diffèrent. Rendez la langue explicite et ne traduisez jamais silencieusement un contenu privé par un service non annoncé.',
  ),
  {
    _type: 'gallery',
    _key: key('gallery'),
    caption:
      'Ressources Apple Developer officielles utilisées pour valider le parcours technique.',
    images: [
      {
        _type: 'image',
        _key: key('gallery-image'),
        asset: { _type: 'reference', _ref: coverAsset._id },
        alt: 'Session Apple Developer présentant les capacités de Foundation Models',
      },
      {
        _type: 'image',
        _key: key('gallery-image'),
        asset: { _type: 'reference', _ref: testingAsset._id },
        alt: 'Session technique Apple Developer sur Foundation Models',
      },
    ],
  },
  textBlock('13. Définir un budget de performance et d’énergie', 'h2'),
  textBlock(
    'Mesurez démarrage à froid, délai avant le premier résultat utile, durée totale, pression mémoire, annulation et impact batterie sur le plus ancien appareil pris en charge. Annulez le travail lorsque la vue disparaît et ne mettez en cache que les contenus pouvant être conservés.',
  ),
  {
    _type: 'callout',
    _key: key('callout'),
    icon: 'tip',
    heading: 'Mesurer le chemin lent',
    text: 'La médiane masque les difficultés des appareils anciens ou des réseaux contraints. Définissez un seuil de latence extrême et basculez vers une solution utile avant que l’interface paraisse bloquée.',
  },
  textBlock(
    '14. Observer les échecs sans enregistrer les contenus privés',
    'h2',
  ),
  textBlock(
    'Les tableaux de bord doivent indiquer la disponibilité, la version exécutée, le résultat de la validation, l’acceptation par l’utilisateur et la réussite de la solution de repli. Utilisez des catégories d’erreur expurgées plutôt que les requêtes et réponses brutes.',
  ),
  listBlock('Taux de disponibilité par système, appareil, langue et région.'),
  listBlock('Taux d’échec de validation et de nouvelle tentative par version.'),
  listBlock('Latences P50, P95 et P99 avec le taux d’annulation.'),
  listBlock('Taux de réussite du repli et taux de correction signalée.'),
  listBlock('Sessions sans panne et alertes mémoire autour des opérations.'),
  ...(uploadedVideoAsset
    ? [
        {
          ...cloneWithFreshKeys(
            englishAdvancedContent.find((item) => item._type === 'mediaFile'),
          ),
          title: 'Une boucle de développement mesurée',
          caption:
            'Prototyper un résultat, exécuter des tests reproductibles, analyser les échecs et améliorer le contrat produit.',
          transcript:
            'Visuel complémentaire représentant implémentation, tests, mesure et itération. Aucune instruction orale n’est nécessaire pour comprendre ce média.',
        },
      ]
    : []),
  textBlock('15. Checklist de mise en production', 'h2'),
  {
    _type: 'htmlContent',
    _key: key('html'),
    html: `<section><h3>Avant TestFlight</h3><ol><li>Vérifier la disponibilité sur chaque famille d’appareils.</li><li>Exécuter le jeu d’évaluation figé en français et en anglais.</li><li>Tester hors ligne, annulation, arrière-plan et faible mémoire.</li><li>Contrôler les permissions des outils et les confirmations.</li><li>Auditer analytics, conservation et suppression.</li><li>Terminer les tests VoiceOver, Dynamic Type et réduction des animations.</li><li>Comparer les sources avec la documentation du SDK actuel.</li></ol><p><strong>Règle éditoriale :</strong> mettre ce guide à jour lorsque Apple modifie les API, leur disponibilité ou les exigences de plateforme.</p></section>`,
  },
  cloneWithFreshKeys(
    englishAdvancedContent.find((item) => item._type === 'faq'),
  ),
  textBlock('Ressources officielles pour poursuivre', 'h2'),
  linkedBlock(
    'Commencez par la ',
    'documentation Foundation Models',
    sources[1].url,
    '.',
  ),
  linkedBlock(
    'Consultez la ',
    'documentation App Intents',
    sources[2].url,
    '.',
  ),
  linkedBlock(
    'Utilisez la ',
    'documentation Swift Testing',
    sources[6].url,
    '.',
  ),
  linkedBlock(
    'Si une application exige un autre fournisseur de modèle, consultez ',
    'la session Apple sur l’intégration des fournisseurs',
    sources[7].url,
    ' et expliquez clairement le nouveau trajet des données.',
  ),
]

const iphone18Content = [
  textBlock(
    'Apple has scheduled a special event for Wednesday, September 9, 2026. As of September 5, Apple has not published a complete iPhone 18 Pro specification sheet or confirmed a retail release date in the public sources linked below. This bilingual guide explains what can be verified, what to watch during the keynote, and how buyers should validate regional availability before paying.',
    'lead',
  ),
  {
    _type: 'callout',
    _key: key('callout'),
    icon: 'warning',
    heading:
      'Editorial status: event preview, not a confirmed product announcement',
    text: 'September 9, 2026 is a Wednesday. Apple may reveal new hardware during the event, but model names, prices, configurations, launch countries, shipping dates, and specifications must be treated as unconfirmed until Apple publishes them.',
  },
  textBlock('What Apple has officially made available', 'h2'),
  linkedBlock(
    'The primary destination for the keynote schedule, livestream and replay is the ',
    'official Apple Events page',
    iphoneSources[0].url,
    '. Check the page again after the event because Apple may add a replay, transcript or product links.',
  ),
  linkedBlock(
    'For product specifications, compare the final information on the ',
    'official iPhone page',
    iphoneSources[1].url,
    ' and the relevant Apple newsroom release rather than relying on screenshots or anonymous leaks.',
  ),
  {
    _type: 'comparisonTable',
    _key: key('table'),
    caption: 'How to classify information on September 9',
    columns: ['Information type', 'Editorial treatment', 'Verification source'],
    rows: [
      {
        _key: key('row'),
        label: 'Confirmed before the keynote',
        values: [
          'State as confirmed with date',
          'Apple Events, Apple support or newsroom',
        ],
      },
      {
        _key: key('row'),
        label: 'Presented during the keynote',
        values: [
          'Quote and timestamp the presentation',
          'Apple livestream or replay',
        ],
      },
      {
        _key: key('row'),
        label: 'Rumour or analyst expectation',
        values: [
          'Label clearly and keep separate',
          'Independent source with methodology',
        ],
      },
      {
        _key: key('row'),
        label: 'Regional price or launch date',
        values: [
          'Verify per market and currency',
          'Apple local store and checkout',
        ],
      },
    ],
  },
  textBlock('What to record during the keynote', 'h2'),
  textBlock(
    'A useful launch report records the exact model name, screen sizes, materials, camera capabilities, processor generation, connectivity, battery claims, storage tiers, colours, starting price, pre-order time, shipping date, supported countries and warranty terms. Capture the wording Apple uses for each claim and link directly to the slide, newsroom release or specification page that supports it.',
  ),
  {
    _type: 'prosCons',
    _key: key('proscons'),
    score: 0,
    pros: [
      'Official event schedule gives readers a reliable verification point',
      'Apple newsroom and local store pages can confirm final specifications and prices',
      'A market-by-market checklist prevents currency and launch-date mistakes',
      'Readers can distinguish confirmed facts from pre-event expectations',
    ],
    cons: [
      'iPhone 18 Pro specifications are not confirmed in the public sources as of September 5, 2026',
      'Regional availability and pricing may differ across Africa and Europe',
      'Launch-day pages can change quickly during pre-orders',
      'Rumours should not be used as purchase advice without corroboration',
    ],
  },
  textBlock('Buying safely in Africa and other regions', 'h2'),
  textBlock(
    'After Apple publishes the product pages, verify the local currency, taxes, warranty coverage, cellular bands, eSIM availability, storage tier and delivery date for the reader’s country. A United States price is not a Cameroon, France, Senegal or Côte d’Ivoire landed price. Quote the currency you actually checked, include the access date, and link to the relevant local Apple store or authorised retailer.',
  ),
  listBlock(
    'Check whether the advertised price includes VAT, customs, delivery or activation fees.',
  ),
  listBlock(
    'Confirm whether the model supports the local carrier bands and eSIM requirements.',
  ),
  listBlock(
    'Compare official warranty and repair coverage before using a grey-market importer.',
  ),
  listBlock(
    'Do not publish a local price conversion as if it were an official Apple price.',
  ),
  listBlock(
    'Update the article when Apple posts final country availability or pre-order timing.',
  ),
  textBlock(
    'Camera, battery and AI claims: how to test the final product',
    'h2',
  ),
  textBlock(
    'Marketing claims become useful only when the test method is transparent. For camera comparisons, preserve the same scene, light, focal length and processing mode. For battery, report the workload, brightness, network, software version and test duration. For Apple Intelligence or other AI features, identify supported languages, account requirements, regional availability, privacy controls, fallback behaviour and whether the result is generated on device or through a server path.',
  ),
  {
    _type: 'code',
    _key: key('code'),
    language: 'typescript',
    filename: 'launch-verification.ts',
    code: `type LaunchFact = {
  claim: string
  source: string
  checkedAt: string
  market: string
}

export function isPublishable(fact: LaunchFact) {
  return Boolean(
    fact.claim.trim() &&
      /^https:\\/\\//.test(fact.source) &&
      fact.checkedAt &&
      fact.market,
  )
}`,
    caption: 'Keep every launch claim attached to a source, date and market.',
    captionFr:
      'Associer chaque information de lancement à une source, une date et un marché.',
    showLineNumbers: true,
    wrapLines: true,
    highlightLines: '1-6,8-14',
  },
  textBlock('Live update protocol for editors', 'h2'),
  textBlock(
    'Prepare the article before the event with a visible “last checked” timestamp. During the keynote, update only facts that appear in Apple’s presentation or supporting pages. Afterward, replace the preview callout with a dated update that lists what changed: model names, technical specifications, pricing, pre-orders, delivery dates, supported markets and any features that remain limited or delayed.',
  ),
  {
    _type: 'faq',
    _key: key('faq'),
    title: 'iPhone 18 Pro event questions',
    titleFr: 'Questions sur l’événement iPhone 18 Pro',
    items: [
      {
        _key: key('faq-item'),
        question:
          'Is the iPhone 18 Pro officially confirmed before September 9, 2026?',
        answer:
          'Apple has scheduled an event, but the public Apple sources linked in this guide do not yet provide a complete iPhone 18 Pro specification or retail announcement as of September 5, 2026. Recheck Apple’s event and newsroom pages for confirmation.',
        questionFr:
          'L’iPhone 18 Pro est-il officiellement confirmé avant le 9 septembre 2026 ?',
        answerFr:
          'Apple a programmé un événement, mais les sources publiques Apple liées ici ne fournissent pas encore de fiche technique ou d’annonce commerciale complète pour l’iPhone 18 Pro au 5 septembre 2026. Vérifiez les pages Apple Events et Newsroom.',
      },
      {
        _key: key('faq-item'),
        question: 'Why does this article say Wednesday instead of Tuesday?',
        answer:
          'September 9, 2026 falls on a Wednesday. The article uses the calendar date verified for the event and avoids repeating an incorrect weekday.',
        questionFr: 'Pourquoi cet article indique-t-il mercredi et non mardi ?',
        answerFr:
          'Le 9 septembre 2026 tombe un mercredi. L’article utilise la date vérifiée et évite de répéter un jour de semaine incorrect.',
      },
      {
        _key: key('faq-item'),
        question: 'When should readers trust a price?',
        answer:
          'Only after the price appears on Apple’s store or an authorised retailer for the reader’s market, with currency, taxes and availability clearly stated.',
        questionFr: 'Quand un lecteur peut-il faire confiance à un prix ?',
        answerFr:
          'Après publication du prix sur l’Apple Store ou chez un revendeur agréé du marché concerné, avec devise, taxes et disponibilité clairement indiquées.',
      },
    ],
  },
  {
    _type: 'gallery',
    _key: key('gallery'),
    caption:
      'Use official Apple pages as the visual source of truth after the keynote.',
    images: [
      {
        _type: 'image',
        _key: key('gallery-image'),
        asset: { _type: 'reference', _ref: coverAsset._id },
        alt: 'Apple Developer event-style presentation image',
      },
      {
        _type: 'image',
        _key: key('gallery-image'),
        asset: { _type: 'reference', _ref: testingAsset._id },
        alt: 'Apple technical presentation image',
      },
    ],
  },
  linkedBlock(
    'Follow the ',
    'Apple Events schedule',
    iphoneSources[0].url,
    ' for the official stream and replay.',
  ),
  linkedBlock(
    'Use the ',
    'Apple iPhone page',
    iphoneSources[1].url,
    ' for final product information.',
  ),
  linkedBlock(
    'Monitor the ',
    'iPhone newsroom archive',
    iphoneSources[2].url,
    ' for dated announcements.',
  ),
]

const iphone18ContentFr = [
  textBlock(
    'Apple a programmé un événement spécial le mercredi 9 septembre 2026. Au 5 septembre, Apple n’a pas encore publié de fiche technique complète ni confirmé une date de commercialisation pour un iPhone 18 Pro dans les sources publiques citées ci-dessous. Ce guide bilingue explique ce qui peut être vérifié, ce qu’il faut surveiller pendant la keynote et comment contrôler la disponibilité régionale avant tout achat.',
    'lead',
  ),
  {
    _type: 'callout',
    _key: key('callout'),
    icon: 'warning',
    heading: 'Statut éditorial : aperçu de l’événement, pas annonce confirmée',
    text: 'Le 9 septembre 2026 est un mercredi. Apple peut présenter un nouveau matériel, mais les noms, prix, configurations, pays de lancement, dates d’expédition et caractéristiques doivent rester non confirmés jusqu’à publication par Apple.',
  },
  textBlock('Ce qu’Apple a officiellement publié', 'h2'),
  linkedBlock(
    'La destination principale pour l’horaire, le flux vidéo et le replay est la ',
    'page officielle Apple Events',
    iphoneSources[0].url,
    '. Consultez-la après l’événement pour le replay, la transcription ou les liens produits.',
  ),
  linkedBlock(
    'Pour les caractéristiques, comparez les informations finales sur la ',
    'page officielle iPhone',
    iphoneSources[1].url,
    ' et dans le communiqué Apple correspondant plutôt que dans des captures ou des fuites anonymes.',
  ),
  {
    _type: 'comparisonTable',
    _key: key('table'),
    caption: 'Classer les informations le 9 septembre',
    columns: ['Type', 'Traitement éditorial', 'Source de vérification'],
    rows: [
      {
        _key: key('row'),
        label: 'Confirmé avant la keynote',
        values: [
          'Présenter avec la date',
          'Apple Events, assistance ou Newsroom',
        ],
      },
      {
        _key: key('row'),
        label: 'Présenté pendant la keynote',
        values: ['Citer et horodater', 'Flux ou replay Apple'],
      },
      {
        _key: key('row'),
        label: 'Rumeur ou attente',
        values: ['Étiqueter clairement', 'Source indépendante méthodologique'],
      },
      {
        _key: key('row'),
        label: 'Prix ou lancement régional',
        values: [
          'Vérifier par marché et devise',
          'Apple Store local et paiement',
        ],
      },
    ],
  },
  textBlock('Ce qu’il faut relever pendant la keynote', 'h2'),
  textBlock(
    'Un bon compte rendu relève le nom exact du modèle, les tailles d’écran, les matériaux, les appareils photo, la génération de processeur, la connectivité, les performances de batterie, les capacités de stockage, les couleurs, le prix de départ, l’heure des précommandes, la date d’expédition, les pays concernés et la garantie. Conservez les termes employés par Apple et reliez chaque information à la page qui la justifie.',
  ),
  {
    _type: 'prosCons',
    _key: key('proscons'),
    score: 0,
    pros: [
      'Le calendrier officiel fournit un point de vérification fiable',
      'Newsroom et Apple Store peuvent confirmer les caractéristiques et prix',
      'Une checklist par marché évite les erreurs de devise et de date',
      'Les lecteurs distinguent les faits des attentes pré-événement',
    ],
    cons: [
      'Les caractéristiques de l’iPhone 18 Pro ne sont pas confirmées au 5 septembre 2026',
      'Disponibilité et prix peuvent différer en Afrique et en Europe',
      'Les pages de précommande évoluent rapidement le jour du lancement',
      'Les rumeurs ne doivent pas servir de conseil d’achat sans corroboration',
    ],
  },
  textBlock('Acheter en Afrique et dans les autres régions', 'h2'),
  textBlock(
    'Après publication des pages Apple, vérifiez la devise locale, les taxes, la garantie, les bandes cellulaires, l’eSIM, le stockage et la livraison pour le pays du lecteur. Un prix américain n’est pas un prix rendu au Cameroun, en France, au Sénégal ou en Côte d’Ivoire. Indiquez la devise réellement vérifiée, la date d’accès et le lien vers l’Apple Store local ou un revendeur agréé.',
  ),
  listBlock('Vérifier TVA, douane, livraison et frais d’activation.'),
  listBlock('Confirmer les bandes opérateur et les exigences eSIM locales.'),
  listBlock(
    'Comparer garantie et réparation avant toute importation parallèle.',
  ),
  listBlock(
    'Ne pas transformer une conversion indicative en prix Apple officiel.',
  ),
  listBlock(
    'Mettre l’article à jour lorsque le pays et la précommande sont confirmés.',
  ),
  textBlock('Tester les affirmations photo, batterie et IA', 'h2'),
  textBlock(
    'Les promesses marketing deviennent utiles lorsque la méthode est transparente. Pour la photo, gardez la même scène, lumière, focale et traitement. Pour la batterie, documentez usage, luminosité, réseau, version logicielle et durée. Pour les fonctions Apple Intelligence, précisez langues, compte, région, confidentialité, repli et traitement local ou distant.',
  ),
  cloneWithFreshKeys(
    iphone18Content.find((item) => item.filename === 'launch-verification.ts'),
  ),
  textBlock('Protocole de mise à jour en direct', 'h2'),
  textBlock(
    'Préparez l’article avec une date de dernière vérification visible. Pendant la keynote, ajoutez uniquement les faits présents dans la présentation ou les pages Apple. Après l’événement, remplacez l’encadré de prévisualisation par une mise à jour datée listant modèles, caractéristiques, prix, précommandes, livraison, marchés et éventuelles fonctions retardées.',
  ),
  cloneWithFreshKeys(iphone18Content.find((item) => item._type === 'faq')),
  cloneWithFreshKeys(iphone18Content.find((item) => item._type === 'gallery')),
  linkedBlock(
    'Suivez le ',
    'calendrier Apple Events',
    iphoneSources[0].url,
    ' pour le flux officiel et le replay.',
  ),
  linkedBlock(
    'Utilisez la ',
    'page Apple iPhone',
    iphoneSources[1].url,
    ' pour les informations finales.',
  ),
  linkedBlock(
    'Surveillez les ',
    'archives iPhone Newsroom',
    iphoneSources[2].url,
    ' pour les annonces datées.',
  ),
]

const content = [
  textBlock(
    "Apple's Foundation Models framework can place language-model features inside a native Swift application while App Intents exposes useful actions to system experiences. This guide shows a production-minded architecture with SwiftUI, structured output, privacy checks, testing, accessibility, and measurable fallbacks.",
    'lead',
  ),
  {
    _type: 'callout',
    _key: key('callout'),
    icon: 'info',
    heading: 'Availability first',
    text: 'Model capabilities vary by operating system, device, language, region, and Apple Intelligence availability. Gate every feature at runtime and always provide a non-AI path.',
  },
  textBlock('What Apple changed for developers', 'h2'),
  linkedBlock(
    'At WWDC26, Apple described new Foundation Models capabilities including additional model options, vision workflows, context management, semantic search, evaluations, and server-side paths. Review ',
    "Apple's official session",
    sources[0].url,
    ' before adopting APIs because SDK names and availability can change.',
  ),
  inlineImage,
  textBlock('1. Design one focused user outcome', 'h2'),
  textBlock(
    'Do not begin with a generic chatbot. Choose a task with a clear success condition: summarize release notes, classify feedback, extract structured fields, or propose a draft that the user reviews.',
  ),
  {
    _type: 'prosCons',
    _key: key('proscons'),
    score: 8.8,
    pros: [
      'Native Swift integration and system-aware experiences',
      'Privacy-preserving on-device paths where supported',
      'Structured generation, tools, sessions, and evaluation workflows',
      'App Intents can surface actions beyond the app interface',
    ],
    cons: [
      'Availability differs across devices, languages, and regions',
      'Generative output still requires validation and product safeguards',
      'New SDK capabilities can evolve between beta and final releases',
    ],
  },
  textBlock('2. Build the SwiftUI model layer', 'h2'),
  {
    _type: 'code',
    _key: key('code'),
    language: 'swift',
    filename: 'ReleaseNotesModel.swift',
    code: swiftCode,
    caption:
      'A deliberately small model layer suitable for progressive enhancement.',
    captionFr:
      "Une couche de modèle volontairement limitée, adaptée à l'amélioration progressive.",
    showLineNumbers: true,
    wrapLines: false,
    highlightLines: '5,8-13',
  },
  {
    _type: 'latex',
    _key: key('latex'),
    formula: String.raw`Q = 0.35A + 0.25R + 0.20L + 0.20P`,
    displayMode: true,
    alt: 'Quality score equals accuracy, reliability, latency, and privacy weighted together',
    caption:
      'A practical evaluation score combining accuracy, reliability, latency, and privacy.',
    captionFr:
      "Un score d'évaluation pratique combinant précision, fiabilité, latence et confidentialité.",
  },
  textBlock('3. Connect actions with App Intents', 'h2'),
  linkedBlock(
    'Use App Intents to describe actions and entities in a structured way so supported system experiences can discover them. Start from the ',
    'official App Intents documentation',
    sources[2].url,
    ', keep parameter summaries understandable, and avoid hiding essential confirmation steps.',
  ),
  {
    _type: 'embed',
    _key: key('embed'),
    provider: 'youtube',
    url: 'https://www.youtube.com/watch?v=Xrv8m_EHCbg',
    title: "What's new in the Foundation Models framework - Apple Developer",
    caption: 'Official Apple Developer WWDC26 Foundation Models session.',
    captionFr:
      'Session officielle Apple Developer WWDC26 sur Foundation Models.',
    aspectRatio: '16/9',
  },
  ...(stockVideo ? [stockVideo] : []),
  textBlock('4. Test behavior, not phrasing', 'h2'),
  textBlock(
    'Generated wording can change while the product requirement remains stable. Test required facts, prohibited content, structured constraints, cancellation, unavailable-model behavior, and the manual fallback.',
  ),
  {
    _type: 'code',
    _key: key('code'),
    language: 'swift',
    filename: 'ReleaseNotesModelTests.swift',
    code: testCode,
    caption:
      'Swift Testing assertion focused on an essential product requirement.',
    captionFr:
      'Assertion Swift Testing centrée sur une exigence produit essentielle.',
    showLineNumbers: true,
    highlightLines: '4,7',
  },
  {
    _type: 'comparisonTable',
    _key: key('table'),
    caption: 'Production decision matrix',
    columns: ['Concern', 'Preferred approach', 'Fallback'],
    rows: [
      {
        _key: key('row'),
        label: 'Privacy',
        values: [
          'On-device processing when available',
          'Explicitly disclosed server path',
        ],
      },
      {
        _key: key('row'),
        label: 'Availability',
        values: ['Runtime capability checks', 'Deterministic non-AI workflow'],
      },
      {
        _key: key('row'),
        label: 'Quality',
        values: [
          'Evaluation set and structured constraints',
          'Human review and retry',
        ],
      },
    ],
  },
  ...englishAdvancedContent,
  ...(refs.product
    ? [
        {
          _type: 'productCard',
          _key: key('product'),
          product: { _type: 'reference', _ref: refs.product },
          title: 'A practical Mac for Xcode and Swift development',
          tagline:
            'Check memory, storage, and current Xcode requirements before buying.',
        },
      ]
    : []),
  {
    _type: 'htmlContent',
    _key: key('html'),
    html: `<section><h2>Production checklist</h2><ul><li>Provide an accessible non-AI fallback.</li><li>Test supported languages and regions.</li><li>Measure latency, cancellation and failure states.</li><li>Keep source links and an update log.</li></ul><p><a href="${sources[1].url}">Read the official Foundation Models documentation</a>.</p></section>`,
  },
  textBlock('Final verdict', 'h2'),
  {
    _type: 'verdict',
    _key: key('verdict'),
    rating: 8.8,
    title:
      'A strong native foundation when the fallback is equally well designed',
    body: 'Foundation Models, SwiftUI, App Intents, and Swift Testing form a credible Apple-native stack. The quality of the result still depends on narrow product scope, availability checks, evaluations, accessibility, and transparent data handling.',
    recommended: true,
  },
]

const contentFr = [
  textBlock(
    "Le framework Foundation Models d'Apple permet d'intégrer des fonctions de modèle de langage dans une application Swift native, tandis qu'App Intents expose les actions utiles aux expériences système. Ce guide propose une architecture orientée production avec SwiftUI, sortie structurée, confidentialité, tests, accessibilité et solutions de repli mesurables.",
    'lead',
  ),
  {
    _type: 'callout',
    _key: key('callout'),
    icon: 'info',
    heading: "Vérifier d'abord la disponibilité",
    text: "Les capacités varient selon le système, l'appareil, la langue, la région et la disponibilité d'Apple Intelligence. Vérifiez les capacités à l'exécution et fournissez toujours une solution sans IA.",
  },
  textBlock("Ce qu'Apple a fait évoluer pour les développeurs", 'h2'),
  linkedBlock(
    'À la WWDC26, Apple a présenté de nouvelles capacités de Foundation Models concernant les modèles, la vision, la gestion du contexte, la recherche sémantique, les évaluations et les traitements côté serveur. Consultez ',
    'la session officielle Apple',
    sources[0].url,
    " avant l'adoption, car les noms et disponibilités des API peuvent évoluer.",
  ),
  inlineImageFr,
  textBlock('1. Définir un résultat utilisateur précis', 'h2'),
  textBlock(
    "Ne commencez pas par un chatbot générique. Choisissez une tâche mesurable : résumer des notes de version, classer des retours, extraire des champs structurés ou produire un brouillon contrôlé par l'utilisateur.",
  ),
  {
    _type: 'prosCons',
    _key: key('proscons'),
    score: 8.8,
    pros: [
      'Intégration native Swift et expériences système',
      "Traitement local respectueux de la confidentialité lorsqu'il est disponible",
      'Génération structurée, outils, sessions et évaluations',
      "App Intents expose des actions au-delà de l'interface de l'application",
    ],
    cons: [
      'Disponibilité variable selon appareils, langues et régions',
      'Les sorties génératives nécessitent validation et protections produit',
      'Les nouvelles API peuvent évoluer entre bêta et version finale',
    ],
  },
  textBlock('2. Construire la couche modèle SwiftUI', 'h2'),
  { ...content.find((item) => item._type === 'code'), _key: key('code') },
  { ...content.find((item) => item._type === 'latex'), _key: key('latex') },
  textBlock('3. Connecter les actions avec App Intents', 'h2'),
  linkedBlock(
    'App Intents décrit les actions et les entités de manière structurée afin que les expériences système compatibles puissent les découvrir. Commencez par ',
    'la documentation officielle App Intents',
    sources[2].url,
    ' et conservez des paramètres clairs.',
  ),
  { ...content.find((item) => item._type === 'embed'), _key: key('embed') },
  ...(stockVideo ? [{ ...stockVideo, _key: key('video') }] : []),
  textBlock('4. Tester le comportement plutôt que la formulation', 'h2'),
  textBlock(
    "La formulation générée peut changer alors que l'exigence produit reste stable. Testez les faits obligatoires, le contenu interdit, les contraintes structurées, l'annulation, l'indisponibilité du modèle et la solution manuelle.",
  ),
  { ...content.filter((item) => item._type === 'code')[1], _key: key('code') },
  ...frenchAdvancedContent,
  {
    _type: 'htmlContent',
    _key: key('html'),
    html: `<section><h2>Checklist de production</h2><ul><li>Fournir une solution accessible sans IA.</li><li>Tester les langues et régions prises en charge.</li><li>Mesurer latence, annulation et erreurs.</li><li>Conserver les sources et un journal de mise à jour.</li></ul><p><a href="${sources[1].url}">Consulter la documentation officielle Foundation Models</a>.</p></section>`,
  },
  textBlock('Verdict final', 'h2'),
  {
    _type: 'verdict',
    _key: key('verdict'),
    rating: 8.8,
    title: 'Une base native solide avec une solution de repli de même qualité',
    body: "Foundation Models, SwiftUI, App Intents et Swift Testing forment une pile Apple crédible. La qualité dépend néanmoins d'un périmètre précis, des contrôles de disponibilité, des évaluations, de l'accessibilité et d'une gestion transparente des données.",
    recommended: true,
  },
]

const postId = 'post-apple-foundation-models-swiftui-guide-2026'
await client.createOrReplace({
  _id: postId,
  _type: 'post',
  locale: 'en',
  title:
    'Build a private AI feature in Swift with Foundation Models, SwiftUI and App Intents',
  titleFr:
    'Créer une fonction IA privée en Swift avec Foundation Models, SwiftUI et App Intents',
  slug: {
    _type: 'slug',
    current: 'apple-foundation-models-swiftui-app-intents-guide',
  },
  excerpt:
    'A production-focused Apple developer guide to Foundation Models, SwiftUI, App Intents, Swift Testing, privacy, evaluation, fallbacks, and accessible AI experiences.',
  excerptFr:
    "Guide Apple Developer orienté production sur Foundation Models, SwiftUI, App Intents, Swift Testing, la confidentialité, l'évaluation et les solutions de repli.",
  content,
  contentFr,
  coverImage,
  category: { _type: 'reference', _ref: refs.category },
  author: { _type: 'reference', _ref: refs.author },
  tags: taxonomy.map(([id]) => ({
    _type: 'reference',
    _key: key('tag'),
    _ref: id,
  })),
  productMentions: refs.product
    ? [{ _type: 'reference', _key: key('product'), _ref: refs.product }]
    : [],
  status: 'published',
  date: '2026-09-05T08:00:00.000Z',
  updatedAt: new Date().toISOString(),
  featured: true,
  trending: true,
  allowComments: true,
  sponsored: false,
  seoTitle: 'Apple Foundation Models Swift Guide: SwiftUI & App Intents',
  seoTitleFr: 'Guide Apple Foundation Models avec SwiftUI et App Intents',
  seoDescription:
    'Build and test a private Apple AI feature using Foundation Models, SwiftUI, App Intents and Swift Testing, with fallbacks and production safeguards.',
  seoDescriptionFr:
    'Créez et testez une fonction IA Apple privée avec Foundation Models, SwiftUI, App Intents, Swift Testing et des solutions de repli.',
  seoKeywords:
    'Apple Foundation Models, SwiftUI, App Intents, Swift Testing, Apple Intelligence development, on-device AI, Swift tutorial',
  focusKeyphrase: 'Apple Foundation Models Swift guide',
  noIndex: false,
  contentType: 'HowTo',
  sources: sources.map((source) => ({
    _type: 'source',
    _key: key('source'),
    ...source,
    publisher: 'Apple Developer',
    accessedAt: '2026-09-05',
  })),
  correctionNote:
    'Last reviewed on September 5, 2026 against current Apple Developer documentation. Verify SDK availability in the current Xcode release before shipping.',
  correctionNoteFr:
    'Dernière vérification le 5 septembre 2026 avec la documentation Apple Developer actuelle. Vérifiez la disponibilité des API dans la version actuelle de Xcode avant publication.',
  verdictVoteTotal: 44,
  verdictVoteCount: 5,
})

const iphonePostId = 'post-iphone-18-pro-event-preview-september-2026'
await client.createOrReplace({
  _id: iphonePostId,
  _type: 'post',
  locale: 'en',
  title:
    'iPhone 18 Pro event preview: what Apple has confirmed for September 9, 2026',
  titleFr:
    'Aperçu de l’événement iPhone 18 Pro : ce qu’Apple a confirmé pour le 9 septembre 2026',
  slug: {
    _type: 'slug',
    current: 'iphone-18-pro-event-preview-september-2026',
  },
  excerpt:
    'A source-first bilingual guide to Apple’s September 9, 2026 event, separating confirmed information from expectations and explaining how to verify iPhone 18 Pro pricing, availability and specifications by market.',
  excerptFr:
    'Un guide bilingue fondé sur les sources pour l’événement Apple du 9 septembre 2026, distinguant les faits des attentes et expliquant comment vérifier prix, disponibilité et caractéristiques de l’iPhone 18 Pro par marché.',
  content: iphone18Content,
  contentFr: iphone18ContentFr,
  coverImage,
  category: {
    _type: 'reference',
    _ref: refs.newsCategory || refs.iphoneCategory || refs.category,
  },
  author: { _type: 'reference', _ref: refs.author },
  tags: (refs.iphoneTags || []).map((_ref) => ({
    _type: 'reference',
    _key: key('tag'),
    _ref,
  })),
  productMentions: refs.iphoneProduct
    ? [{ _type: 'reference', _key: key('product'), _ref: refs.iphoneProduct }]
    : [],
  status: 'published',
  date: '2026-09-05T10:00:00.000Z',
  updatedAt: new Date().toISOString(),
  featured: true,
  trending: true,
  allowComments: true,
  sponsored: false,
  seoTitle:
    'iPhone 18 Pro September 9, 2026 event preview and verified updates',
  seoTitleFr:
    'iPhone 18 Pro : aperçu du 9 septembre 2026 et mises à jour vérifiées',
  seoDescription:
    'Follow Apple’s September 9, 2026 event with a source-first iPhone 18 Pro preview covering confirmed facts, regional pricing, launch timing, camera, battery, AI and buyer verification.',
  seoDescriptionFr:
    'Suivez l’événement Apple du 9 septembre 2026 avec un aperçu iPhone 18 Pro fondé sur les sources : faits confirmés, prix régionaux, calendrier, photo, batterie, IA et vérifications.',
  seoKeywords:
    'iPhone 18 Pro, Apple event September 9 2026, iPhone launch, Apple Newsroom, iPhone price Africa, iPhone availability',
  focusKeyphrase: 'iPhone 18 Pro September 9 2026',
  noIndex: false,
  contentType: 'NewsArticle',
  sources: iphoneSources.map((source) => ({
    _type: 'source',
    _key: key('source'),
    ...source,
    publisher: 'Apple',
    accessedAt: '2026-09-05',
  })),
  correctionNote:
    'This article is an event preview last checked on September 5, 2026. September 9, 2026 is a Wednesday. Apple had not published a complete iPhone 18 Pro specification sheet in the cited public sources at the time of review.',
  correctionNoteFr:
    'Cet article est un aperçu vérifié le 5 septembre 2026. Le 9 septembre 2026 est un mercredi. Apple n’avait pas publié de fiche technique complète de l’iPhone 18 Pro dans les sources publiques citées au moment de la vérification.',
  verdictVoteTotal: 0,
  verdictVoteCount: 0,
})

await client.createIfNotExists({
  _id: 'settings',
  _type: 'settings',
  title: 'Apple Magic Blog',
})
await client
  .patch('settings')
  .set({
    'seoDefaults.titleSuffix': ' — Apple Magic Blog',
    'seoDefaults.organizationName': 'Apple Magic Blog',
    'seoDefaults.legalName': 'Apple Magic Blog',
    'seoDefaults.newsPublicationName': 'Apple Magic Blog',
    'seoDefaults.enableNewsSitemap': true,
    'seoDefaults.description':
      'Independent Apple news, developer tutorials, in-depth reviews, buying guides and practical analysis for readers across Africa.',
    'seoDefaults.descriptionFr':
      "Actualités Apple indépendantes, tutoriels développeur, tests approfondis, guides d'achat et analyses pratiques pour les lecteurs en Afrique.",
    'seoDefaults.email': 'hello@applemagic.blog',
    'seoDefaults.address.addressLocality': 'Douala',
    'seoDefaults.address.addressCountry': 'CM',
    'seoDefaults.twitterHandle': '@applemagicblog',
    'seoDefaults.defaultKeywords': [
      'Apple news',
      'Apple Developer',
      'Swift',
      'SwiftUI',
      'Foundation Models',
      'App Intents',
      'iPhone',
      'Mac',
      'iPad',
      'Apple Intelligence',
      'Apple Africa',
      'technology reviews',
      'buying guides',
    ],
  })
  .commit({ visibility: 'sync' })

console.log(
  JSON.stringify(
    {
      postId,
      slug: 'apple-foundation-models-swiftui-app-intents-guide',
      englishBlocks: content.length,
      frenchBlocks: contentFr.length,
      iphonePostId,
      iphoneSlug: 'iphone-18-pro-event-preview-september-2026',
      iphoneEnglishBlocks: iphone18Content.length,
      iphoneFrenchBlocks: iphone18ContentFr.length,
      stockVideo: Boolean(stockVideo),
      uploadedVideo: Boolean(uploadedVideoAsset),
      coverAsset: coverAsset._id,
      settingsUpdated: true,
    },
    null,
    2,
  ),
)
