import { createIntegration, createComponent } from '@gitbook/runtime';

/**
 * Antera Documentation Widgets integration.
 *
 * GitBook does not inline arbitrary third-party iframes from a URL (it renders a
 * bookmark card instead, by content-security policy). The supported way to embed
 * live interactive content is a ContentKit `webframe`, which is what this block
 * renders. When a writer pastes a widget URL, link-unfurling routes it here and
 * we render the live tool. The frame auto-sizes via @webframe.resize messages the
 * embed page posts (see the Angular EmbedComponent).
 */

const EMBED_PATH = '/documentation/embed/';

// Aspect ratio (width / height) for each widget's frame. The embed page also posts
// @webframe.resize to fit its real height, but this is the fallback if a host caps
// or ignores resize. Lower number = taller frame. shipping-tool and
// allocation-simulator use the side-by-side (embed-split) layout, so they are wider
// and shorter; the values lean tall so content never clips.
const DEFAULT_ASPECT: Record<string, number> = {
    'shipping-tool': 1.5,
    'shipping-flows': 1040 / 660,
    'shipping-qa': 1040 / 1000,
    'allocation-simulator': 1.15,
    'allocation-flows': 1040 / 660,
    'allocation-qa': 1040 / 1000,
};

function widgetKey(url?: string): string | undefined {
    if (!url) return undefined;
    const i = url.indexOf(EMBED_PATH);
    if (i === -1) return undefined;
    return url.slice(i + EMBED_PATH.length).split(/[/?#]/)[0] || undefined;
}

const embedBlock = createComponent<{ url?: string }>({
    componentId: 'embed',

    async action(element, action) {
        if (action.action === '@link.unfurl') {
            return { props: { url: action.url } };
        }
        return element;
    },

    async render(element) {
        const { url } = element.props;
        const key = widgetKey(url);

        if (!url || !key) {
            return (
                <block>
                    <card
                        title="Antera widget"
                        hint="Paste a https://dpartida-antera.github.io/documentation/embed/... URL"
                        onPress={{ action: '@ui.url.open', url: url ?? 'https://dpartida-antera.github.io/documentation/' }}
                    />
                </block>
            );
        }

        return (
            <block>
                <webframe source={{ url }} aspectRatio={DEFAULT_ASPECT[key] ?? 1040 / 720} />
            </block>
        );
    },
});

export default createIntegration({
    components: [embedBlock],
});
