import { ButtonType } from '@waha/structures/chatting.buttons.dto';

import { buttonToJson, interactiveNodes } from './noweb.buttons';

describe('noweb.buttons', () => {
  it('maps button types to native-flow names and params', () => {
    const url = buttonToJson({ type: ButtonType.URL, text: 'Ver', url: 'https://x.test' } as any);
    expect(url.name).toBe('cta_url');
    expect(JSON.parse(url.buttonParamsJson)).toMatchObject({ display_text: 'Ver', url: 'https://x.test', merchant_url: 'https://x.test' });
    const reply = buttonToJson({ type: ButtonType.REPLY, text: 'Sí', id: 'si' } as any);
    expect(reply.name).toBe('quick_reply');
    expect(JSON.parse(reply.buttonParamsJson)).toMatchObject({ display_text: 'Sí', id: 'si' });
  });

  it('attaches the biz native_flow node, plus the bot node outside groups', () => {
    const dm = interactiveNodes('123@s.whatsapp.net');
    expect(dm[0]).toMatchObject({ tag: 'biz', content: [{ tag: 'interactive', attrs: { type: 'native_flow', v: '1' }, content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }] }] });
    expect(dm[1]).toEqual({ tag: 'bot', attrs: { biz_bot: '1' } });
    const group = interactiveNodes('123-456@g.us');
    expect(group.length).toBe(1);
  });
});
