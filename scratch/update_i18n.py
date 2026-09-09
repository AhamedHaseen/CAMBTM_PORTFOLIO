with open('public/js/i18n.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix popup initialization
search_popup = """    if (popupCountrySelect && popupLanguageSelect) {
      populateCountrySelect(popupCountrySelect, DEFAULT_COUNTRY);
      populateLanguageSelect(popupLanguageSelect, DEFAULT_COUNTRY, DEFAULT_LANGUAGE);

      popupCountrySelect.addEventListener('change', function () {
        populateLanguageSelect(popupLanguageSelect, popupCountrySelect.value, popupLanguageSelect.value);
        applyTranslations(popupLanguageSelect.value); // live-preview the popup's own text in the chosen language
      });
      popupLanguageSelect.addEventListener('change', function () {
        applyTranslations(popupLanguageSelect.value); // live-preview
      });
    }"""
    
replace_popup = """    if (popupLanguageSelect) {
      populateLanguageSelect(popupLanguageSelect, DEFAULT_COUNTRY, DEFAULT_LANGUAGE);
      popupLanguageSelect.addEventListener('change', function () {
        applyTranslations(popupLanguageSelect.value); // live-preview
      });
    }"""

content = content.replace(search_popup, replace_popup)

# 2. Fix confirm button to use DEFAULT_COUNTRY
search_confirm = """      popupConfirm.addEventListener('click', function () {
        setLocale(popupCountrySelect.value, popupLanguageSelect.value, true);"""

replace_confirm = """      popupConfirm.addEventListener('click', function () {
        setLocale(DEFAULT_COUNTRY, popupLanguageSelect.value, true);"""

content = content.replace(search_confirm, replace_confirm)

# 3. Update English translation for popup title
search_title = "'locale.popupTitle': 'Choose your country & language', 'locale.popupDesc': 'We\\'ll tailor pricing and language to your region.'"
replace_title = "'locale.popupTitle': 'Choose your language', 'locale.popupDesc': 'We\\'ll tailor the language to you.'"

content = content.replace(search_title, replace_title)

with open('public/js/i18n.js', 'w', encoding='utf-8') as f:
    f.write(content)
