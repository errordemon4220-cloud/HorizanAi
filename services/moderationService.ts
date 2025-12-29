/**
 * A simple keyword-based content moderation service.
 */

const FORBIDDEN_WORDS: string[] = [
  // Generic NSFW/Explicit
  'nsfw', 'explicit', 'erotic', 'lewd', 'lust', 'seduce', 'seduction',
  
  // Sexual Acts & Body Parts
  'sex', 'sexual', 'fuck', 'cunt', 'pussy', 'dick', 'cock', 'penis', 'vagina', 'clitoris', 'anus', 'anal','sexy',
  'porn', 'pornographic', 'hentai', 'lolita', 'shota', 'cub',
  'orgy', 'gangbang', 'threesome', 'foursome', 'dogging',
  'incest', 'bestiality', 'necrophilia', 'zoophilia',
  'bdsm', 'bondage', 'domination', 'sadism', 'masochism', 'fetish',
  'rape', 'raping', 'molest', 'molestation',
  'nude', 'naked', 'undress', 'undressed',
  'orgasm', 'climax', 'ejaculate', 'cum', 'cumshot', 'sperm', 'semen',
  'whore', 'slut', 'prostitute', 'hooker', 'gigolo', 'brothel',
  'masturbate', 'masturbation', 'handjob', 'blowjob', 'fellatio', 'cunnilingus', 'rimjob',
  'deepthroat', 'bukkake',
  
  // Violence & Gore
  'kill', 'murder', 'gore', 'gory', 'violence', 'torture', 'slaughter', 'behead', 'decapitate',
  'maim', 'dismember', 'guts', 'blood', 'bloody', 'massacre', 'butcher', 'slay',
  'assassinate', 'execute', 'execution', 'lynch',
  
  // Hate Speech & Derogatory Terms
  'nazi', 'swastika', 'holocaust',
  'racist', 'racism', 'supremacist', 'bigot',
  'n-word', 'nigger', 'nigga', // (plus other racial/ethnic slurs)
  'faggot', 'dyke', 'tranny', // (plus other slurs for sexual orientation/gender identity)
  'kkk', 'ku klux klan',

  // Self-Harm
  'suicide', 'self-harm', 'cutting', 'selfharm',
  
  // Illegal Activities & Substances
  'cocaine', 'heroin', 'meth', 'methamphetamine', 'lsd', 'fentanyl',
  'drug-lord', 'cartel',
  'bomb', 'terrorist', 'terrorism', 'bombing',
  'pedophile', 'pedophilia', 'grooming', 'child abuse',

  // Extreme Profanity / Scat
  'shit', 'bitch', 'asshole',
  'scat', 'coprophilia', 'feces', 'poop',
];

// Matches whole words, case-insensitive
const moderationRegex = new RegExp(`\\b(${FORBIDDEN_WORDS.join('|')})\\b`, 'i');

/**
 * Checks if a string contains inappropriate content.
 * @param text The string to check.
 * @param isNsfwModeEnabled If true, this check will be bypassed.
 * @returns True if inappropriate content is found, false otherwise.
 */
export function isContentInappropriate(text: string, isNsfwModeEnabled: boolean = false): boolean {
  if (isNsfwModeEnabled) {
    return false;
  }
  if (!text) return false;
  return moderationRegex.test(text);
}