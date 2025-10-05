# SEO Setup Checklist

## ✅ Completed
- [x] App name as variable in `/src/lib/constants.ts`
- [x] Comprehensive metadata (title, description, keywords)
- [x] Open Graph tags for social sharing
- [x] Twitter Card metadata
- [x] JSON-LD structured data
- [x] PWA web manifest
- [x] Robots.txt directives
- [x] SEO-friendly meta tags

## 📋 TODO: When Logo is Ready

1. **Create logo assets:**
   - `favicon.ico` (32x32)
   - `favicon-16x16.png`
   - `apple-touch-icon.png` (180x180)
   - `icon-192x192.png` (for PWA)
   - `icon-512x512.png` (for PWA)
   - `og-image.png` (1200x630 for social sharing)

2. **Uncomment in `/src/app/layout.tsx`:**
   ```typescript
   // Line 39-46: OpenGraph images
   images: [
     {
       url: '/og-image.png',
       width: 1200,
       height: 630,
       alt: `${APP_NAME} - Climate Forecast Tool`,
     },
   ],

   // Line 53: Twitter images
   images: ['/og-image.png'],

   // Line 67-70: Icons
   icon: '/favicon.ico',
   shortcut: '/favicon-16x16.png',
   apple: '/apple-touch-icon.png',
   ```

3. **Update configuration:**
   - Change `APP_URL` in `/src/lib/constants.ts` to actual domain
   - Update Twitter handle (line 52 in layout.tsx)
   - Update PWA icons paths in `/public/site.webmanifest`

## 🔄 Easy Updates

To change the app name in the future:
1. Edit `APP_NAME` in `/src/lib/constants.ts`
2. Everything else updates automatically!

## 📊 SEO Testing

Test your SEO setup with:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
