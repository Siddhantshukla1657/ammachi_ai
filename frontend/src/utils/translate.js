// Translation utility for handling language switching between English and Malayalam

// Default language is English
let currentLanguage = localStorage.getItem('ammachi_language') || 'English';

// Dictionary of translations
const translations = {
  // Common UI elements
  'Language': {
    'English': 'Language',
    'Malayalam': 'ഭാഷ'
  },
  'Save': {
    'English': 'Save',
    'Malayalam': 'സേവ് ചെയ്യുക'
  },
  'Cancel': {
    'English': 'Cancel',
    'Malayalam': 'റദ്ദാക്കുക'
  },
  'Edit': {
    'English': 'Edit',
    'Malayalam': 'എഡിറ്റ് ചെയ്യുക'
  },
  'Profile': {
    'English': 'Profile',
    'Malayalam': 'പ്രൊഫൈൽ'
  },
  'Dashboard': {
    'English': 'Dashboard',
    'Malayalam': 'ഡാഷ്ബോർഡ്'
  },
  'Logout': {
    'English': 'Logout',
    'Malayalam': 'ലോഗ്ഔട്ട്'
  },
  'Loading profile...': {
    'English': 'Loading profile...',
    'Malayalam': 'പ്രൊഫൈൽ ലോഡ് ചെയ്യുന്നു...'
  },
  'Farmer': {
    'English': 'Farmer',
    'Malayalam': 'കർഷകൻ'
  },
  'Submit': {
    'English': 'Submit',
    'Malayalam': 'സമർപ്പിക്കുക'
  },
  'Save Changes': {
    'English': 'Save Changes',
    'Malayalam': 'മാറ്റങ്ങൾ സംരക്ഷിക്കുക'
  },
  
  // Profile page
  'Phone Number': {
    'English': 'Phone Number',
    'Malayalam': 'ഫോൺ നമ്പർ'
  },
  'Experience (years)': {
    'English': 'Experience (years)',
    'Malayalam': 'പരിചയം (വർഷങ്ങൾ)'
  },
  'Email': {
    'English': 'Email',
    'Malayalam': 'ഇമെയിൽ'
  },
  'District': {
    'English': 'District',
    'Malayalam': 'ജില്ല'
  },
  'Farms': {
    'English': 'Farms',
    'Malayalam': 'ഫാമുകൾ'
  },
  'Questions Asked': {
    'English': 'Questions Asked',
    'Malayalam': 'ചോദിച്ച ചോദ്യങ്ങൾ'
  },
  'Days Active': {
    'English': 'Days Active',
    'Malayalam': 'സജീവ ദിവസങ്ങൾ'
  },
  'Add Farm': {
    'English': 'Add Farm',
    'Malayalam': 'ഫാം ചേർക്കുക'
  },
  'Farm': {
    'English': 'Farm',
    'Malayalam': 'ഫാം'
  },
  'Farm Name': {
    'English': 'Farm Name',
    'Malayalam': 'ഫാമിന്റെ പേര്'
  },
  'Acres': {
    'English': 'Acres',
    'Malayalam': 'ഏക്കർ'
  },
  'Location': {
    'English': 'Location',
    'Malayalam': 'സ്ഥലം'
  },
  'Crops (comma separated)': {
    'English': 'Crops (comma separated)',
    'Malayalam': 'വിളകൾ (കോമ വേർതിരിച്ചത്)'
  },
  'App Settings': {
    'English': 'App Settings',
    'Malayalam': 'ആപ്പ് സെറ്റിംഗ്സ്'
  },
  'Choose your preferred language': {
    'English': 'Choose your preferred language',
    'Malayalam': 'നിങ്ങളുടെ ഇഷ്ടമുള്ള ഭാഷ തിരഞ്ഞെടുക്കുക'
  },
  'Your Activity': {
    'English': 'Your Activity',
    'Malayalam': 'നിങ്ങളുടെ പ്രവർത്തനം'
  },
  'Crops Scanned': {
    'English': 'Crops Scanned',
    'Malayalam': 'സ്കാൻ ചെയ്ത വിളകൾ'
  },
  'Questions Asked': {
    'English': 'Questions Asked',
    'Malayalam': 'ചോദിച്ച ചോദ്യങ്ങൾ'
  },
  'Days Active': {
    'English': 'Days Active',
    'Malayalam': 'സജീവ ദിവസങ്ങൾ'
  },
  'Select': {
    'English': 'Select',
    'Malayalam': 'തിരഞ്ഞെടുക്കുക'
  },
  'Full Name': {
    'English': 'Full Name',
    'Malayalam': 'മുഴുവൻ പേര്'
  },
  'Number of farms': {
    'English': 'Number of farms',
    'Malayalam': 'ഫാമുകളുടെ എണ്ണം'
  },
  'State': {
    'English': 'State',
    'Malayalam': 'സംസ്ഥാനം'
  },
  'Personal Information': {
    'English': 'Personal Information',
    'Malayalam': 'വ്യക്തിഗത വിവരങ്ങൾ'
  },
  'No farms added.': {
    'English': 'No farms added.',
    'Malayalam': 'ഫാമുകളൊന്നും ചേർത്തിട്ടില്ല.'
  },
  'Remove': {
    'English': 'Remove',
    'Malayalam': 'നീക്കം ചെയ്യുക'
  },
  'Loading weather data for': {
    'English': 'Loading weather data for',
    'Malayalam': 'കാലാവസ്ഥ വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു'
  },
  'Error': {
    'English': 'Error',
    'Malayalam': 'പിശക്'
  },
  'Please ensure': {
    'English': 'Please ensure',
    'Malayalam': 'ദയവായി ഉറപ്പാക്കുക'
  },
  'Backend server is running at': {
    'English': 'Backend server is running at',
    'Malayalam': 'ബാക്കെൻഡ് സെർവർ പ്രവർത്തിക്കുന്നത്'
  },
  'is properly set in the backend .env file': {
    'English': 'is properly set in the backend .env file',
    'Malayalam': 'ബാക്കെൻഡ് .env ഫയലിൽ ശരിയായി സജ്ജീകരിച്ചിരിക്കുന്നു'
  },
  'Your internet connection is working': {
    'English': 'Your internet connection is working',
    'Malayalam': 'നിങ്ങളുടെ ഇന്റർനെറ്റ് കണക്ഷൻ പ്രവർത്തിക്കുന്നു'
  },
  'Retry': {
    'English': 'Retry',
    'Malayalam': 'വീണ്ടും ശ്രമിക്കുക'
  },
  'Current Weather': {
    'English': 'Current Weather',
    'Malayalam': 'ഇപ്പോഴത്തെ കാലാവസ്ഥ'
  },
  'Feels like': {
    'English': 'Feels like',
    'Malayalam': 'അനുഭവപ്പെടുന്നത്'
  },
  'Humidity': {
    'English': 'Humidity',
    'Malayalam': 'ആർദ്രത'
  },
  'Wind Speed': {
    'English': 'Wind Speed',
    'Malayalam': 'കാറ്റിന്റെ വേഗത'
  },
  'Pressure': {
    'English': 'Pressure',
    'Malayalam': 'മർദ്ദം'
  },
  'Visibility': {
    'English': 'Visibility',
    'Malayalam': 'ദൃശ്യത'
  },
  'Rain Chance': {
    'English': 'Rain Chance',
    'Malayalam': 'മഴ സാധ്യത'
  },
  'Updated': {
    'English': 'Updated',
    'Malayalam': 'അപ്ഡേറ്റ് ചെയ്തത്'
  },
  'Farming Advisories': {
    'English': 'Farming Advisories',
    'Malayalam': 'കൃഷി ഉപദേശങ്ങൾ'
  },
  'Watering Advisory': {
    'English': 'Watering Advisory',
    'Malayalam': 'ജലസേചന ഉപദേശം'
  },
  'Reduce watering today due to high humidity': {
    'English': 'Reduce watering today due to high humidity',
    'Malayalam': 'ഉയർന്ന ആർദ്രത കാരണം ഇന്ന് ജലസേചനം കുറയ്ക്കുക'
  },
  'Rain expected tomorrow': {
    'English': 'Rain expected tomorrow',
    'Malayalam': 'നാളെ മഴ പ്രതീക്ഷിക്കുന്നു'
  },
  'Current humidity is': {
    'English': 'Current humidity is',
    'Malayalam': 'നിലവിലെ ആർദ്രത'
  },
  'Regular watering recommended': {
    'English': 'Regular watering recommended',
    'Malayalam': 'സാധാരണ ജലസേചനം ശുപാർശ ചെയ്യുന്നു'
  },
  'Pest Alert': {
    'English': 'Pest Alert',
    'Malayalam': 'കീട അലേർട്ട്'
  },
  'High humidity may increase fungal diseases. Monitor crops closely': {
    'English': 'High humidity may increase fungal diseases. Monitor crops closely',
    'Malayalam': 'ഉയർന്ന ആർദ്രത കൂണ് രോഗങ്ങൾ വർദ്ധിപ്പിച്ചേക്കാം. വിളകൾ സൂക്ഷ്മമായി നിരീക്ഷിക്കുക'
  },
  'Harvesting Window': {
    'English': 'Harvesting Window',
    'Malayalam': 'വിളവെടുപ്പ് സമയം'
  },
  'Good weather conditions for harvesting in the next few days': {
    'English': 'Good weather conditions for harvesting in the next few days',
    'Malayalam': 'അടുത്ത കുറച്ച് ദിവസങ്ങളിൽ വിളവെടുപ്പിന് നല്ല കാലാവസ്ഥ'
  },
  '7-Day Forecast': {
    'English': '7-Day Forecast',
    'Malayalam': '7-ദിവസ പ്രവചനം'
  },
  'Hourly Forecast': {
    'English': 'Hourly Forecast',
    'Malayalam': 'മണിക്കൂർ പ്രവചനം'
  },
  'Disease Detection': {
    'English': 'Disease Detection',
    'Malayalam': 'രോഗ നിർണ്ണയം'
  },
  'Upload a photo of your crop to detect diseases': {
    'English': 'Upload a photo of your crop to detect diseases',
    'Malayalam': 'രോഗങ്ങൾ കണ്ടെത്താൻ നിങ്ങളുടെ വിളയുടെ ഒരു ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക'
  },
  'Upload Crop Photo': {
    'English': 'Upload Crop Photo',
    'Malayalam': 'വിള ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക'
  },
  'Drag and drop your image here, or click to browse': {
    'English': 'Drag and drop your image here, or click to browse',
    'Malayalam': 'നിങ്ങളുടെ ചിത്രം ഇവിടെ വലിച്ചിടുക, അല്ലെങ്കിൽ ബ്രൗസ് ചെയ്യാൻ ക്ലിക്ക് ചെയ്യുക'
  },
  'Please upload a valid image file (JPG, PNG)': {
    'English': 'Please upload a valid image file (JPG, PNG)',
    'Malayalam': 'ദയവായി സാധുവായ ഇമേജ് ഫയൽ അപ്‌ലോഡ് ചെയ്യുക (JPG, PNG)'
  },
  'File size must be less than 5MB': {
    'English': 'File size must be less than 5MB',
    'Malayalam': 'ഫയൽ വലുപ്പം 5MB-ൽ കുറവായിരിക്കണം'
  },
  'Detection failed': {
    'English': 'Detection failed',
    'Malayalam': 'കണ്ടെത്തൽ പരാജയപ്പെട്ടു'
  },
  'No description available': {
    'English': 'No description available',
    'Malayalam': 'വിവരണം ലഭ്യമല്ല'
  },
  'Your crop appears to be healthy! No diseases detected.': {
    'English': 'Your crop appears to be healthy! No diseases detected.',
    'Malayalam': 'നിങ്ങളുടെ വിള ആരോഗ്യകരമാണെന്ന് തോന്നുന്നു! രോഗങ്ങളൊന്നും കണ്ടെത്തിയില്ല.'
  },
  'No diseases detected. Your crop appears to be healthy!': {
    'English': 'No diseases detected. Your crop appears to be healthy!',
    'Malayalam': 'രോഗങ്ങളൊന്നും കണ്ടെത്തിയില്ല. നിങ്ങളുടെ വിള ആരോഗ്യകരമാണെന്ന് തോന്നുന്നു!'
  },
  'Failed to analyze the image. Please try again with a clearer photo.': {
    'English': 'Failed to analyze the image. Please try again with a clearer photo.',
    'Malayalam': 'ചിത്രം വിശകലനം ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു. കൂടുതൽ വ്യക്തതയുള്ള ഫോട്ടോയുമായി വീണ്ടും ശ്രമിക്കുക.'
  },
  'No specific remedies found. Please consult with an agricultural expert.': {
    'English': 'No specific remedies found. Please consult with an agricultural expert.',
    'Malayalam': 'പ്രത്യേക പരിഹാരങ്ങളൊന്നും കണ്ടെത്തിയില്ല. ദയവായി ഒരു കാർഷിക വിദഗ്ധനെ സമീപിക്കുക.'
  },
  'Unable to fetch remedies at the moment. Please consult with an agricultural expert.': {
    'English': 'Unable to fetch remedies at the moment. Please consult with an agricultural expert.',
    'Malayalam': 'ഇപ്പോൾ പരിഹാരങ്ങൾ ലഭ്യമാക്കാൻ കഴിയില്ല. ദയവായി ഒരു കാർഷിക വിദഗ്ധനെ സമീപിക്കുക.'
  },
  'Your Farming Assistant': {
    'English': 'Your Farming Assistant',
    'Malayalam': 'നിങ്ങളുടെ കാർഷിക സഹായി'
  },
  'of': {
    'English': 'of',
    'Malayalam': 'ൽ നിന്ന്'
  },
  'recent scans show healthy crops': {
    'English': 'recent scans show healthy crops',
    'Malayalam': 'സമീപകാല സ്കാനുകൾ ആരോഗ്യകരമായ വിളകൾ കാണിക്കുന്നു'
  },
  'Your crops are looking healthy today': {
    'English': 'Your crops are looking healthy today',
    'Malayalam': 'നിങ്ങളുടെ വിളകൾ ഇന്ന് ആരോഗ്യകരമായി കാണപ്പെടുന്നു'
  },
  'Last updated': {
    'English': 'Last updated',
    'Malayalam': 'അവസാനം അപ്ഡേറ്റ് ചെയ്തത്'
  },
  'Refresh': {
    'English': 'Refresh',
    'Malayalam': 'പുതുക്കുക'
  },
  'Scan Leaf': {
    'English': 'Scan Leaf',
    'Malayalam': 'ഇല സ്കാൻ ചെയ്യുക'
  },
  'Ask AI': {
    'English': 'Ask AI',
    'Malayalam': 'AI-യോട് ചോദിക്കുക'
  },
  'Crop Health': {
    'English': 'Crop Health',
    'Malayalam': 'വിള ആരോഗ്യം'
  },
  'Today\'s Tips': {
    'English': 'Today\'s Tips',
    'Malayalam': 'ഇന്നത്തെ നുറുങ്ങുകൾ'
  },
  'Today\'s Weather': {
    'English': 'Today\'s Weather',
    'Malayalam': 'ഇന്നത്തെ കാലാവസ്ഥ'
  },
  'View Details': {
    'English': 'View Details',
    'Malayalam': 'വിശദാംശങ്ങൾ കാണുക'
  },
  'Wind': {
    'English': 'Wind',
    'Malayalam': 'കാറ്റ്'
  },
  'Market Prices': {
    'English': 'Market Prices',
    'Malayalam': 'വിപണി വിലകൾ'
  },
  'Live crop prices and market trends for better selling decisions': {
    'English': 'Live crop prices and market trends for better selling decisions',
    'Malayalam': 'മികച്ച വിൽപ്പന തീരുമാനങ്ങൾക്കായി തത്സമയ വിള വിലകളും വിപണി പ്രവണതകളും'
  },
  'Select District': {
    'English': 'Select District',
    'Malayalam': 'ജില്ല തിരഞ്ഞെടുക്കുക'
  },
  'Select Market': {
    'English': 'Select Market',
    'Malayalam': 'വിപണി തിരഞ്ഞെടുക്കുക'
  },
  'No markets found': {
    'English': 'No markets found',
    'Malayalam': 'വിപണികളൊന്നും കണ്ടെത്തിയില്ല'
  },
  'markets available': {
    'English': 'markets available',
    'Malayalam': 'വിപണികൾ ലഭ്യമാണ്'
  },
  'Select Crop': {
    'English': 'Select Crop',
    'Malayalam': 'വിള തിരഞ്ഞെടുക്കുക'
  },
  'Last Updated': {
    'English': 'Last Updated',
    'Malayalam': 'അവസാനം പുതുക്കിയത്'
  },
  'Loading market data...': {
    'English': 'Loading market data...',
    'Malayalam': 'വിപണി ഡാറ്റ ലോഡ് ചെയ്യുന്നു...'
  },
  'Minimum Price': {
    'English': 'Minimum Price',
    'Malayalam': 'കുറഞ്ഞ വില'
  },
  'Lowest recorded price for': {
    'English': 'Lowest recorded price for',
    'Malayalam': 'ഏറ്റവും കുറഞ്ഞ രേഖപ്പെടുത്തിയ വില'
  },
  'in': {
    'English': 'in',
    'Malayalam': 'ൽ'
  },
  'Modal Price': {
    'English': 'Modal Price',
    'Malayalam': 'സാധാരണ വില'
  },
  'Most common price for': {
    'English': 'Most common price for',
    'Malayalam': 'ഏറ്റവും സാധാരണമായ വില'
  },
  'Maximum Price': {
    'English': 'Maximum Price',
    'Malayalam': 'പരമാവധി വില'
  },
  'Highest recorded price for': {
    'English': 'Highest recorded price for',
    'Malayalam': 'ഏറ്റവും ഉയർന്ന രേഖപ്പെടുത്തിയ വില'
  },
  'Quality': {
    'English': 'Quality',
    'Malayalam': 'ഗുണനിലവാരം'
  },
  'Market': {
    'English': 'Market',
    'Malayalam': 'വിപണി'
  },
  'Market Summary': {
    'English': 'Market Summary',
    'Malayalam': 'വിപണി സംഗ്രഹം'
  },
  'Selected Market': {
    'English': 'Selected Market',
    'Malayalam': 'തിരഞ്ഞെടുത്ത വിപണി'
  },
  'Data Points': {
    'English': 'Data Points',
    'Malayalam': 'ഡാറ്റ പോയിന്റുകൾ'
  },
  'Average Price': {
    'English': 'Average Price',
    'Malayalam': 'ശരാശരി വില'
  }
};

/**
 * Translates a text based on the current language setting
 * @param {string} text - The text to translate
 * @returns {string} - The translated text
 */
export function translate(text) {
  // If the text doesn't exist in our dictionary, return the original text
  if (!translations[text]) {
    return text;
  }
  
  // Return the translation for the current language, or the original text if translation not found
  return translations[text][currentLanguage] || text;
}

/**
 * Sets the current language for the application
 * @param {string} language - The language to set ('English' or 'Malayalam')
 */
export function setLanguage(language) {
  if (language === 'English' || language === 'Malayalam') {
    currentLanguage = language;
    localStorage.setItem('ammachi_language', language);
  }
}

/**
 * Gets the current language setting
 * @returns {string} - The current language ('English' or 'Malayalam')
 */
export function getLanguage() {
  return currentLanguage;
}

/**
 * Translates text using the backend API for more complex translations
 * @param {string} text - The text to translate
 * @param {string} targetLanguage - The target language ('English' or 'Malayalam')
 * @returns {Promise<string>} - A promise that resolves to the translated text
 */
export async function translateWithAPI(text, targetLanguage) {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLanguage: targetLanguage === 'English' ? 'English' : 'Malayalam',
      }),
    });

    const data = await response.json();
    return data.translatedText || text;
  } catch (error) {
    console.error('Translation API error:', error);
    return text; // Return original text if translation fails
  }
}