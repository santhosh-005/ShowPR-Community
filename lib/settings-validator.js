/**
 * Validates and cleans user profile settings.
 *
 * @param {any} settings - The raw settings object to validate.
 * @returns {Object} The cleaned and validated settings object.
 * @throws {Error} If validation fails.
 */
export function validateSettings(settings) {
  if (typeof settings !== 'object' || settings === null) {
    throw new Error('Settings must be a valid JSON object');
  }

  const cleaned = {};

  // Validate theme (default: 'dark')
  if ('theme' in settings) {
    if (typeof settings.theme !== 'string') {
      throw new Error('Theme setting must be a string');
    }
    if (settings.theme.length > 50) {
      throw new Error('Theme setting cannot exceed 50 characters');
    }
    cleaned.theme = settings.theme;
  } else {
    cleaned.theme = 'dark';
  }

  // Validate excludedRepos (default: [])
  if ('excludedRepos' in settings) {
    if (!Array.isArray(settings.excludedRepos)) {
      throw new Error('Excluded repositories must be an array');
    }
    for (const repo of settings.excludedRepos) {
      if (typeof repo !== 'string') {
        throw new Error('All entries in excludedRepos must be strings');
      }
      if (repo.length > 250) {
        throw new Error('Repository name in excludedRepos cannot exceed 250 characters');
      }
    }
    cleaned.excludedRepos = settings.excludedRepos;
  } else {
    cleaned.excludedRepos = [];
  }

  // Validate layout (default: 'grid')
  if ('layout' in settings) {
    if (typeof settings.layout !== 'string') {
      throw new Error('Layout setting must be a string');
    }
    const allowedLayouts = ['grid', 'list'];
    if (!allowedLayouts.includes(settings.layout)) {
      throw new Error(`Layout must be one of: ${allowedLayouts.join(', ')}`);
    }
    cleaned.layout = settings.layout;
  } else {
    cleaned.layout = 'grid';
  }

  // Validate badgeStyle (default: 'flat')
  if ('badgeStyle' in settings) {
    if (typeof settings.badgeStyle !== 'string') {
      throw new Error('Badge style must be a string');
    }
    const allowedStyles = ['flat', 'flat-square', 'plastic', 'social', 'for-the-badge'];
    if (!allowedStyles.includes(settings.badgeStyle)) {
      throw new Error(`Badge style must be one of: ${allowedStyles.join(', ')}`);
    }
    cleaned.badgeStyle = settings.badgeStyle;
  } else {
    cleaned.badgeStyle = 'flat';
  }

  // Preserve existing cache data if present
  if ('_cache' in settings) {
    cleaned._cache = settings._cache;
  }

  return cleaned;
}
