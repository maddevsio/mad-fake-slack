async function getMessages(page) {
  return page.$$eval('span.c-message__body',
    spans => Array.from(spans).map(el => el.textContent.trim()));
}

module.exports = {
  getMessages
};
