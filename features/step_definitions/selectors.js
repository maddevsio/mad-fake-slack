const mainSelectors = {
  'Team name': '#team_name',
  'Team user name': '#team_menu_user_name',
  'Selected channel': '.p-channel_sidebar__channel--selected',
  'Channel title': '#channel_title',
  Favorite: '.im.im-star-o',
  'Channel header information': '#channel_header_info',
  Users: '.im.im-user-male',
  'Channel members count': '#channel_members_toggle_count',
  'Channel header topic': '#channel_topic_text',
  'Channel header buttons': '.channel_header__buttons',
  'Recent mentions button': 'button#recent_mentions_toggle > .im.im-link',
  'Stars toggle button': 'button#stars_toggle > .im.im-star-o',
  'Flex toggle button': 'button#flex_menu_toggle > .im.im-menu-dot-v',
  'Messages container': '#messages_container',
  'Message item': '.list__item',
  'Input message container': '#msg_form',
  'Input message': '#msg_input_text',
  'File upload button': '#primary_file_button',
  'Emoji button': '#main_emo_menu',
  'User mentions button': '.msg_mentions_button',
  'Notification bar container': '#notification_bar',
  'Left notification section': '.p-notification_bar__section.p-notification_bar__section--left',
  'Right notification section': '.p-notification_bar__section.p-notification_bar__section--right',
  'Message body': '#messages_container .c-message__body',
  'channel item': 'span.p-channel_sidebar__name',
  'Notification bar': '.p-notification_bar__section--left',
  'Notification bar item': '.p-notification_bar__section--left .p-notification_bar__typing',
  'Message sender': '#messages_container .c-message__sender_link',
  'App badge': '#messages_container .c-app_badge'
};

const selectors = {
  'fake slack ui': mainSelectors
};

module.exports = selectors;
