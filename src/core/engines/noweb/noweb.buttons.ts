import { Button, ButtonType } from '@waha/structures/chatting.buttons.dto';
import esm from '@waha/vendor/esm';
import { randomBytes } from 'crypto';

function toName(type: ButtonType) {
  switch (type) {
    case ButtonType.REPLY:
      return 'quick_reply';
    case ButtonType.URL:
      return 'cta_url';
    case ButtonType.CALL:
      return 'cta_call';
    case ButtonType.COPY:
      return 'cta_copy';
  }
}

export function randomId() {
  // generate 16 random digits
  return Math.random().toString().slice(2, 18);
}

export function buttonToJson(button: Button) {
  const name = toName(button.type);
  const buttonParams: any = {
    display_text: button.text,
    id: button.id || randomId(),
    disabled: false,
  };
  switch (button.type) {
    case ButtonType.REPLY:
      break;
    case ButtonType.CALL:
      buttonParams.phone_number = button.phoneNumber;
      break;
    case ButtonType.COPY:
      buttonParams.copy_code = button.copyCode;
      break;
    case ButtonType.URL:
      buttonParams.url = button.url;
      buttonParams.merchant_url = button.url;
      break;
  }
  return {
    name: name,
    buttonParamsJson: JSON.stringify(buttonParams),
  };
}

export async function sendButtonMessage(
  sock: any,
  chatId: string,
  buttons: Button[],
  header?: string,
  headerImage?: any,
  body?: string,
  footer?: string,
) {
  // Native-flow buttons render on phones only when the stanza carries the
  // <biz><interactive type="native_flow"> node (plus <bot biz_bot="1"> in 1:1
  // chats) and the message is NOT wrapped in viewOnceMessage — the wrapper makes
  // Web/Desktop show a "view once" placeholder and phones drop it silently.
  // Same recipe as evolution-api PR #2526 and wuzapi; verified on Android 2026-10.
  const interactiveMessage: any = {
    body: undefined,
    header: undefined,
    footer: undefined,
    nativeFlowMessage: {
      buttons: buttons.map(buttonToJson),
      messageParamsJson: JSON.stringify({
        from: 'api',
        templateId: randomId(),
      }),
    },
  };

  if (header || headerImage) {
    interactiveMessage.header = {
      title: header,
      hasMediaAttachment: !!headerImage,
      imageMessage: headerImage,
    };
  }
  if (body) {
    interactiveMessage.body = {
      text: body,
    };
  }
  if (footer) {
    interactiveMessage.footer = {
      text: footer,
    };
  }

  const data = {
    messageContextInfo: {
      deviceListMetadata: {},
      deviceListMetadataVersion: 2,
      messageSecret: randomBytes(32),
    },
    interactiveMessage: interactiveMessage,
  };

  const msg = esm.b.proto.Message.create(data);
  const fullMessage = esm.b.generateWAMessageFromContent(chatId, msg, {
    userJid: sock?.user?.id,
  });
  await sock.relayMessage(chatId, fullMessage.message, {
    messageId: fullMessage.key.id,
    additionalNodes: interactiveNodes(chatId),
  });
  return fullMessage;
}

/** Stanza nodes WhatsApp clients require before they render native-flow buttons. */
export function interactiveNodes(chatId: string) {
  const nodes: any[] = [
    {
      tag: 'biz',
      attrs: {},
      content: [
        {
          tag: 'interactive',
          attrs: { type: 'native_flow', v: '1' },
          content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }],
        },
      ],
    },
  ];
  if (!chatId.endsWith('@g.us')) {
    nodes.push({ tag: 'bot', attrs: { biz_bot: '1' } });
  }
  return nodes;
}
