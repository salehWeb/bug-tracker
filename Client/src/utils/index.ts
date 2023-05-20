import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

export function dateFormat(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}


export function mdParser(markdown: string): string {

    const parser: MarkdownIt = new MarkdownIt({
        highlight: (str, lang) => {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return '<pre class="hljs"><code>' +
                        hljs.highlight(str, { language: lang }).value +
                        '</code></pre>';
                } catch (err) { }
            }

            return '<pre class="hljs"><code>' + parser.utils.escapeHtml(str) + '</code></pre>';
        }
    })

    return parser.render(markdown)
}


type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N ? Acc[number] : Enumerate<N, [...Acc, Acc['length']]>
type Range<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>

export function toWEBPImage(file: File, quality: Range<1, 101> = 80): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
        if (!file || !file.type || !file.type.includes("image")) throw Error("File Is NOT Image! OR THEY ARE NO FILE");
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            const image = new Image();
            image.src = reader.result as string;

            image.onload = () => {
                const width = image.width
                const height = image.height
                const qualityDecimal = quality / 100;
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");

                if (!ctx) throw new Error("No Canvas Element Found");

                ctx.fillStyle = "rgba(0, 0, 0, 0)";
                ctx.fillRect(0, 0, width, height);

                if (ctx.imageSmoothingEnabled && ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = 'high';

                ctx.drawImage(image, 0, 0, width, height);

                canvas.toBlob((b) =>  { resolve(b) }, "image/WEBP", qualityDecimal)
            };

            reader.onerror = (error: any) => { reject(new Error(error)) };
        }
    })
}
