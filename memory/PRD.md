# LaunchPad AI - Product Requirements Document

## Original Problem Statement
Build a fully functional SaaS web application named "LaunchPad AI" that helps founders, startups, local business owners, freelancers, D2C brands, and service businesses instantly create and publish their online presence in 2-3 minutes.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI components
- **Backend**: FastAPI (Python) 
- **Database**: MongoDB (Motor async driver)
- **AI**: OpenAI GPT-4o via emergentintegrations (text), Gemini Pro via emergentintegrations (image)
- **Auth**: Emergent Google OAuth
- **Publishing**: GitHub Pages via PyGithub
- **Design**: Swiss High-Contrast Light Theme (Outfit + IBM Plex Sans fonts)

## User Personas
1. **Founder**: Needs a quick landing page for their startup idea
2. **Freelancer**: Wants a professional portfolio/services site
3. **Small Business Owner**: Needs an online storefront with catalog
4. **D2C Brand**: Wants a product-focused website with pricing

## Core Requirements
- 3 Business creation paths: Idea to Website, Product to Storefront, Voice to Business
- AI-powered content generation (website copy, taglines, SEO)
- AI-powered media generation (logos, product images, social creatives)
- Real GitHub Pages deployment
- Wallet-based billing system
- Free (watermarked) and Premium (publishable) tiers

## What's Been Implemented (2026-04-05)
### Landing Page
- Hero section with "Turn Your Idea Into a Live Website in 2 Minutes" headline
- Partners/logos row, 3 business paths cards, features grid
- Pricing cards (Free vs Premium $49), testimonials, FAQ accordion, CTA, footer

### Authentication
- Emergent Google OAuth integration
- Session management with httpOnly cookies
- Protected routes with loading states

### Dashboard
- Projects list with status indicators
- Wallet balance with top-up modal
- Plan upgrade (Free → Premium)
- Recent transactions history
- Create new project button

### AI Business Wizard
- Step 1: Choose business type (3 options)
- Step 2: Business details form
- Step 3: AI-powered interview (chatbot UI)
- Step 4: Generate website content via OpenAI GPT-4o

### Website Preview
- Tabbed preview (Home, About, Services, Pricing, Contact, SEO)
- Free plan watermark overlay
- WhatsApp CTA button
- Publish button (Premium only)

### Media Generation
- Logo generation via Gemini Pro
- Product image mockups
- Tagline generator via OpenAI
- Social post creatives
- Video section (coming soon placeholder)

### GitHub Publishing
- Repository creation
- HTML generation from project content
- File push via Git tree API
- GitHub Pages URL generation
- Copy link, visit live site buttons

### Wallet System
- Balance tracking
- Credit (top-up) and debit operations
- Plan upgrade ($49 for Premium)
- Transaction history

## Prioritized Backlog
### P0 (Critical)
- All core features implemented ✅

### P1 (Important)
- Voice note recording & transcription for "Voice to Business" path
- Custom domain connection UI
- File/image upload in wizard
- Downloadable source code export

### P2 (Nice to Have)
- AI promo video generation (Sora integration)
- Analytics dashboard
- Template gallery
- Collaborative editing
- Custom CSS editor
- Multi-language support
- Brochure PDF generation

## Next Tasks
1. Voice recording integration for "Voice to Business Launch" path
2. File upload support in wizard (logo, product images)
3. Template selection before AI generation
4. Analytics/visitor tracking integration
5. Multi-page generated website (currently single HTML)
