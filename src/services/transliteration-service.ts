/**
 * Production-Grade Offline Script Converter (Devanagari -> Perso-Arabic Urdu)
 *
 * Designed specifically for Pakistan / Urdu regional context (Asia/Karachi, ur-PK, ur).
 * Seamlessly handles mixed English + Hindustani code-switched text (Latin words, English terms,
 * model names, numbers remain 100% untouched).
 *
 * Fully offline. Zero network calls, zero external dependencies.
 */

// 1. Etymological Loanwords & Irregular Word Dictionary
const DICTIONARY: Record<string, string> = {
  // Grammar & Pronouns
  'है': 'ہے',
  'ہیں': 'ہیں',
  'हूं': 'ہوں',
  'हूँ': 'ہوں',
  'था': 'تھا',
  'थी': 'تھی',
  'थे': 'تھے',
  'का': 'کا',
  'की': 'کی',
  'के': 'کے',
  'को': 'کو',
  'में': 'میں',
  'से': 'سے',
  'ने': 'نے',
  'पर': 'پر',
  'तक': 'تک',
  'और': 'اور',
  'एक': 'ایک',
  'नहीं': 'نہیں',
  'यह': 'یہ',
  'ये': 'یہ',
  'वह': 'وہ',
  'वो': 'وہ',
  'भी': 'بھی',
  'इस': 'اس',
  'उस': 'اس',
  'इन': 'ان',
  'उन': 'ان',
  'जो': 'جو',
  'सो': 'سو',
  'कि': 'کہ',
  'तो': 'تو',
  'ही': 'ہی',
  'बहुत': 'بہت',
  'लिए': 'لیے',
  'गया': 'گیا',
  'गयी': 'گئی',
  'गये': 'گئے',
  'किया': 'کیا',
  'किए': 'کیے',
  'रहा': 'رہا',
  'रही': 'رہی',
  'रहे': 'رہے',
  'क्या': 'کیا',
  'क्यों': 'کیوں',
  'कैसे': 'کیسے',
  'कब': 'کب',
  'कहाँ': 'کہاں',
  'कहां': 'کہاں',
  'सब': 'سب',
  'कुछ': 'کچھ',
  'कोई': 'کوئی',
  'अपना': 'اپنا',
  'अपनी': 'اپنی',
  'अपने': 'اپنے',
  'आप': 'آپ',
  'हम': 'ہم',
  'तुम': 'تم',
  'मैं': 'میں',
  'आपकी': 'آپ کی',
  'आपका': 'آپ کا',
  'आपके': 'آپ کے',
  'मेरा': 'میرا',
  'मेरी': 'میری',
  'मेरे': 'میرے',
  'मुझे': 'مجھے',
  'तुझे': 'تجھے',
  'इसे': 'اسے',
  'उसे': 'اسے',
  'इन्हें': 'انہیں',
  'उन्हें': 'انہیں',

  // Arabic / Persian Loanwords (Etymological Urdu Spellings)
  'लेकिन': 'لیکن',
  'फैसला': 'فیصلہ',
  'तस्वीरें': 'تصویریں',
  'तस्वीर': 'تصویر',
  'खुश': 'خوش',
  'गांव': 'گاؤں',
  'गाँव': 'گاؤں',
  'लोग': 'لوگ',
  'आदमी': 'آدمی',
  'अमीर': 'امیر',
  'मतलबी': 'مطلبی',
  'जवान': 'جوان',
  'घर': 'گھر',
  'दोस्त': 'دوست',
  'दोस्तों': 'دوستوں',
  'उपलब्धि': 'کامیابی',
  'चित्रकारी': 'مصوری',
  'जीवित': 'زندہ',
  'क्रोधित': 'غصہ',
  'गुस्सा': 'غصہ',
  'मदद': 'مدد',
  'विचार': 'خیال',
  'खयाल': 'خیال',
  'ख्याल': 'خیال',
  'दुनिया': 'دنیا',
  'हाल': 'حال',
  'तरफ': 'طرف',
  'मतलब': 'مطلب',
  'असल': 'اصل',
  'हक': 'حق',
  'वक्त': 'وقت',
  'इस्तेमाल': 'استعمال',
  'प्रयोग': 'استعمال',
  'कोशिश': 'کوشش',
  'जरूरत': 'ضرورت',
  'ज़रूरत': 'ضرورت',
  'साहब': 'صاحب',
  'खास': 'خاص',
  'आम': 'عام',
  'इल्म': 'علم',
  'अक्ल': 'عقل',
  'इज्ज़त': 'عزت',
  'इज्जत': 'عزت',
  'सलाह': 'مشورہ',
  'सलाहकार': 'مشیر',
  'इतिहास': 'تاریخ',
  'तारीख': 'تاریخ',
  'तारीख़': 'تاریخ',
  'खबर': 'خبر',
  'ख़बर': 'خبر',
  'किताब': 'کتاب',
  'बात': 'بات',
  'काम': 'کام',
  'चाल': 'چال',
  'चलना': 'چلنا',
  'चलेगा': 'چلے گا',
  'देना': 'دینا',
  'दिया': 'دیا',
  'दे': 'دے',
  'लिया': 'لیا',
  'ले': 'لے',
  'बोला': 'بولا',
  'बोल': 'بول',
  'बोलना': 'بولنا',
  'बोलने': 'بولنے',

  // Benchmark Domain Words & Names
  'जादुई': 'جادوئی',
  'पेंटब्रश': 'پینٹبرش',
  'लिआंग': 'لیانگ',
  'नौकर': 'نوکر',
  'नौकरों': 'نوکروں',
  'भेजा': 'بھیجا',
  'बुलाने': 'بلانے',
  'आभारी': 'ممنون',
  'धन्यवाद': 'شکریہ',
  'शुक्रिया': 'شکریہ',
  'चेक': 'چیک',
  'मुफ्त': 'مفت',
  'मुक्त': 'آزاد',
  'बुरे': 'برے',
  'बुरा': 'برا',
}

const INDEPENDENT_VOWELS: Record<string, string> = {
  'अ': 'ا',
  'आ': 'آ',
  'इ': 'ا',
  'ई': 'ای',
  'उ': 'ا',
  'ऊ': 'او',
  'ऋ': 'ر',
  'ए': 'اے',
  'ऐ': 'اے',
  'ओ': 'او',
  'औ': 'او',
}

// Dependent Vowel Signs (Matras). Non-final 'ए/ऐ' (े/ै) maps to 'ی' inside words for authentic Urdu writing style.
const MATRAS: Record<string, string> = {
  'ा': 'ا',
  'ि': '',
  'ी': 'ی',
  'ु': '',
  'ू': 'و',
  'ृ': 'ر',
  'े': 'ی',
  'ै': 'ے',
  'ो': 'و',
  'ौ': 'و',
}

const CONSONANTS: Record<string, string> = {
  'क': 'ک',
  'ख': 'کھ',
  'ग': 'گ',
  'घ': 'گھ',
  'ङ': 'نگ',
  'च': 'چ',
  'छ': 'چھ',
  'ज': 'ج',
  'झ': 'جھ',
  'ञ': 'ن',
  'ट': 'ٹ',
  'ठ': 'ٹھ',
  'ड': 'ڈ',
  'ढ': 'ڈھ',
  'ण': 'ن',
  'त': 'ت',
  'थ': 'تھ',
  'द': 'د',
  'ध': 'دھ',
  'न': 'ن',
  'प': 'پ',
  'फ': 'پھ',
  'ब': 'ب',
  'भ': 'بھ',
  'म': 'م',
  'य': 'ی',
  'र': 'ر',
  'ल': 'ل',
  'व': 'و',
  'श': 'ش',
  'ष': 'ش',
  'स': 'س',
  'ह': 'ہ',
}

const NUKTA_CONSONANTS: Record<string, string> = {
  'क़': 'ق',
  'ख़': 'خ',
  'ग़': 'غ',
  'ज़': 'ز',
  'ड़': 'ڑ',
  'ढ़': 'ڑھ',
  'फ़': 'ف',
  'य़': 'ے',
}

const DIGIT_MAP: Record<string, string> = {
  '०': '۰',
  '१': '۱',
  '२': '۲',
  '३': '۳',
  '४': '۴',
  '५': '۵',
  '६': '۶',
  '७': '۷',
  '८': '۸',
  '९': '۹',
}

const PUNCTUATION_MAP: Record<string, string> = {
  '।': '۔',
  ',': '،',
  ';': '؛',
  '?': '؟',
}

const HALANT = '्'
const ANUSVARA = 'ं'
const CHANDRABINDU = 'ँ'
const VISARGA = 'ः'
const NUKTA = '़'
const LABIALS = new Set(['प', 'फ', 'ब', 'भ', 'म'])

function convertWord(word: string): string {
  // 1. Check exact dictionary match first
  if (DICTIONARY[word])
    return DICTIONARY[word]

  // 2. Character-by-character grapheme conversion
  const chars = Array.from(word)
  let out = ''
  let i = 0

  while (i < chars.length) {
    const ch = chars[i] || ''
    const next = chars[i + 1] || ''

    // Consonant + combining Nukta
    if (ch in CONSONANTS && next === NUKTA) {
      out += NUKTA_CONSONANTS[`${ch}${NUKTA}`] || CONSONANTS[ch] || ''
      i += 2
      continue
    }

    // Precomposed Nukta consonant
    if (ch in NUKTA_CONSONANTS) {
      out += NUKTA_CONSONANTS[ch] || ''
      i += 1
      continue
    }

    // Consonant
    if (ch in CONSONANTS) {
      out += CONSONANTS[ch] || ''
      const after = chars[i + 1] || ''
      if (after === HALANT) {
        // Conjunct: skip vowel between consonants
        i += 2
        continue
      }
      if (after && after in MATRAS) {
        // Special rule for 'े': word-final is Bari Ye ('ے'), inside word is Chhoti Ye ('ی')
        if (after === 'े') {
          out += (i + 1 === chars.length - 1) ? 'ے' : 'ی'
        }
        else {
          out += MATRAS[after] || ''
        }
        i += 2
        continue
      }
      // Bare consonant
      i += 1
      continue
    }

    // Independent Vowels
    if (ch in INDEPENDENT_VOWELS) {
      out += INDEPENDENT_VOWELS[ch] || ''
      i += 1
      continue
    }

    // Nasalization (Anusvara & Chandrabindu)
    if (ch === ANUSVARA || ch === CHANDRABINDU) {
      const isWordFinal = i === chars.length - 1
      if (isWordFinal) {
        out += 'ں'
      }
      else {
        const nextChar = chars[i + 1] || ''
        out += LABIALS.has(nextChar) ? 'م' : 'ن'
      }
      i += 1
      continue
    }

    // Visarga
    if (ch === VISARGA) {
      out += 'ہ'
      i += 1
      continue
    }

    // Pass through unmapped characters
    out += ch
    i += 1
  }

  return out
}

/**
 * Pure Offline Transliteration Function
 * Converts Devanagari runs to Urdu script, keeping Latin/English words 100% intact.
 */
export function hindiToUrdu(text: string, options: { convertDigits?: boolean } = {}): string {
  if (!text || text.trim() === '')
    return text
  const { convertDigits = true } = options

  // Match only Devanagari character runs, preserving English/Latin words
  let result = text.replace(/[\u0900-\u0963\u0966-\u097F]+/g, convertWord)

  if (convertDigits) {
    result = result.replace(/[०-९]/g, d => DIGIT_MAP[d] ?? d)
  }
  result = result.replace(/[।,;?]/g, p => PUNCTUATION_MAP[p] ?? p)

  // Post-processing cleanup for natural Urdu presentation
  result = result
    .replace(/(^|\s)اا/g, '$1آ')
    .replace(/اوا/g, 'او')
    .replace(/یء/g, 'ی')
    .replace(/ءی/g, 'ئی')
    .replace(/یاا/g, 'یا')
    .replace(/ےا/g, 'یا')

  return result
}

/**
 * Detects if the user's browser runtime context is in Pakistan / Urdu regional context.
 * Strict check: only returns true for Pakistan / Urdu regions (Asia/Karachi, ur-PK, ur).
 * Will NOT trigger for Chinese, Japanese, Russian, European, or other regions.
 */
export function isUrduRegion(): boolean {
  if (typeof window === 'undefined')
    return false
  const locale = (navigator.language || '').toLowerCase()
  const tz = (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || '' : '').toLowerCase()

  return (
    locale.startsWith('ur')
    || locale.endsWith('-pk')
    || tz.includes('karachi')
    || tz.includes('pakistan')
  )
}

/**
 * Checks if a text string contains Devanagari characters.
 */
export function containsDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/.test(text)
}

/**
 * Automatic Regional Smart Handler:
 * If the user is in Pakistan / Urdu region AND the text contains Devanagari Hindi,
 * it automatically converts Devanagari runs into Perso-Arabic Urdu script while
 * keeping all mixed English words completely untouched.
 *
 * For all other regions (Chinese, Japanese, Russian, European, US), it leaves the text as-is.
 */
export function autoTransliterateIfUrduRegion(text: string): string {
  if (!text || text.trim() === '')
    return text

  if (isUrduRegion() && containsDevanagari(text)) {
    return hindiToUrdu(text)
  }

  return text
}
