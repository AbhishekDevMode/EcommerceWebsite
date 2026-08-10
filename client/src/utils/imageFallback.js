export const FALLBACK_PRODUCT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%231e293b'/%3E%3Cpath d='M325 210h150l35 65h55v170H235V275h55z' fill='%236366f1' opacity='.85'/%3E%3Ccircle cx='400' cy='355' r='55' fill='%230f172a'/%3E%3Ctext x='400' y='520' text-anchor='middle' font-family='Arial' font-size='32' fill='white'%3EQuicKart%3C/text%3E%3C/svg%3E";

export function replaceBrokenImage(event) {
    const image = event.currentTarget;
    if (image.dataset.fallbackApplied) return;
    image.dataset.fallbackApplied = 'true';
    image.src = FALLBACK_PRODUCT_IMAGE;
}
